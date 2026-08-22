import asyncio
import json
import logging
import os
from typing import Any, Dict, List, Optional

import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI

logger = logging.getLogger("uvicorn")
router = APIRouter()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
CHAT_MODEL = os.getenv("CHAT_MODEL", "gemini-2.5-flash")

class ApprovalSelectionIn(BaseModel):
    session_id: str
    intake_data: Dict[str, str]

class ApprovalOut(BaseModel):
    approval: str
    authority: str
    documents: List[str]

class ApprovalSelectionOut(BaseModel):
    session_id: str
    checklist_markdown: str
    approvals: List[ApprovalOut]

def get_chat_model(temperature=0.0):
    return ChatGoogleGenerativeAI(model=CHAT_MODEL, temperature=temperature)

def invoke_text(messages, temperature=0.0):
    llm = get_chat_model(temperature)
    try:
        from langchain_core.messages import SystemMessage, HumanMessage
        langchain_msgs = []
        for m in messages:
            if m["role"] == "system":
                langchain_msgs.append(SystemMessage(content=m["content"]))
            elif m["role"] == "user":
                langchain_msgs.append(HumanMessage(content=m["content"]))
        res = llm.invoke(langchain_msgs)
        return res.content
    except Exception as e:
        logger.error(f"Error invoking text: {e}")
        raise e

def load_regulatory_matrix() -> pd.DataFrame:
    path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "regulatory_matrix.xlsx")
    try:
        if not os.path.exists(path):
            raise Exception(f"File not found: {path}")
        df = pd.read_excel(path)
        return df
    except Exception as exc:
        logger.error(f"Error reading regulatory_matrix.xlsx: {exc}")
        raise exc

async def select_approvals(intake_data: Dict[str, str], df: pd.DataFrame) -> List[ApprovalOut]:
    # Format the matrix for the LLM
    matrix_list = []
    for idx, r in df.iterrows():
        matrix_list.append({
            "id": idx,
            "sector": str(r.get("sector", "")),
            "location": str(r.get("location", "")),
            "project_size_range": str(r.get("project_size_range", "")),
            "required_approval": str(r.get("required_approval", "")),
            "issuing_authority": str(r.get("issuing_authority", "")),
            "required_documents": str(r.get("required_documents", ""))
        })

    system_prompt = f"""
You are an expert regulatory approval assessor. Your task is to select the applicable approvals from the provided Regulatory Matrix based on the project's intake details.

**CRITICAL RULES**:
1. You MUST select relevant approvals ONLY from the provided Regulatory Matrix.
2. NEVER invent, hallucinate, or assume any approval that is not present in the matrix.
3. Consider the sector, location, and project size when matching.

**Regulatory Matrix:**
{json.dumps(matrix_list)}

**Intake Details:**
{json.dumps(intake_data)}

Output ONLY a JSON list of objects, where each object represents a selected approval. Use exactly this format:
[
  {{
    "approval": "Name of the approval from the matrix",
    "authority": "Name of the issuing authority from the matrix",
    "documents": ["doc1", "doc2"]
  }}
]
"""
    try:
        response = await asyncio.to_thread(
            invoke_text,
            [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "Analyze the intake details and select the required approvals from the matrix."}
            ],
            0.1
        )
        
        # Clean response
        clean_res = response.strip().replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_res)
        
        approvals = []
        if isinstance(data, list):
            for item in data:
                approvals.append(ApprovalOut(
                    approval=item.get("approval", ""),
                    authority=item.get("authority", ""),
                    documents=item.get("documents", [])
                ))
        return approvals
    except Exception as exc:
        logger.error(f"Error selecting approvals: {exc}", exc_info=True)
        raise HTTPException(500, f"Error selecting approvals: {str(exc)}")

@router.post("/select-approvals", response_model=ApprovalSelectionOut)
async def run_approval_selection(payload: ApprovalSelectionIn):
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="AI not configured. Add GOOGLE_API_KEY.")

    try:
        df = load_regulatory_matrix()
        approvals = await select_approvals(payload.intake_data, df)
        
        # Generate Markdown checklist
        checklist_lines = ["### Required Approvals Checklist", ""]
        for app in approvals:
            checklist_lines.append(f"- [ ] **{app.approval}** (Authority: {app.authority})")
            for doc in app.documents:
                checklist_lines.append(f"  - [ ] Required Document: {doc}")
            checklist_lines.append("")
        
        checklist_markdown = "\n".join(checklist_lines)

        return ApprovalSelectionOut(
            session_id=payload.session_id,
            checklist_markdown=checklist_markdown,
            approvals=approvals
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"Error in approval selection endpoint: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
