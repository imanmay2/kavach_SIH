import json
import os
from typing import Any, Dict, List, TypedDict

from fastapi import APIRouter, HTTPException
from langgraph.graph import END, StateGraph
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
CHAT_MODEL = os.getenv("CHAT_MODEL", "gemini-2.5-flash")

class SubmittedDocument(BaseModel):
    name: str
    content_summary: str

class PrevalidationIn(BaseModel):
    session_id: str
    selected_approvals: List[str]
    submitted_documents: List[SubmittedDocument]

class ItemizedScore(BaseModel):
    approval: str
    score: int
    rationale: str

class PrevalidationOut(BaseModel):
    session_id: str
    overall_score: float
    missing_items: List[str]
    itemized_scores: List[ItemizedScore]

class PrevalidationState(TypedDict):
    selected_approvals: List[str]
    submitted_documents: List[Dict[str, str]]
    itemized_scores: List[Dict[str, Any]]
    missing_items: List[str]
    overall_score: float

def get_chat_model(temperature=0.0):
    return ChatGoogleGenerativeAI(model=CHAT_MODEL, temperature=temperature)

SYSTEM_SCORING_INSTRUCTIONS = """
You are a Regulatory Compliance Auditor. Your task is to pre-validate an applicant's submitted documents against the required approvals.
Score the completeness for each approval on a scale of 0-4:
0 = No required documents submitted.
1 = Emerging (some irrelevant or minimal documents).
2 = Defined (some required documents submitted, but missing key ones).
3 = Measured (most required documents submitted, minor gaps).
4 = Optimized (all required documents submitted and perfectly match the approval requirements).

Additionally, list any missing items or documents that are required for the approval but not submitted.

Output ONLY a JSON list of objects:
[
  {
    "approval": "Approval Name",
    "score": int,
    "rationale": "Short explanation",
    "missing_items": ["Missing Doc 1", "Missing Doc 2"]
  }
]
"""

def score_documents(state: PrevalidationState):
    llm = get_chat_model(temperature=0)
    
    user_prompt = f"""
Selected Approvals:
{json.dumps(state['selected_approvals'])}

Submitted Documents (Name and Summary):
{json.dumps(state['submitted_documents'])}
"""

    try:
        from langchain_core.messages import SystemMessage, HumanMessage
        messages = [
            SystemMessage(content=SYSTEM_SCORING_INSTRUCTIONS),
            HumanMessage(content=user_prompt)
        ]
        response = llm.invoke(messages)
        text = response.content.strip()
        
        # Clean JSON block
        if text.startswith("```json"):
            text = text[7:-3].strip()
        elif text.startswith("```"):
            text = text[3:-3].strip()
            
        data = json.loads(text)
        if not isinstance(data, list):
            data = [data]
            
        state['itemized_scores'] = data
        return state
    except Exception as exc:
        print(f"Error scoring documents: {exc}")
        state['itemized_scores'] = []
        return state

def compile_results(state: PrevalidationState):
    itemized = state.get("itemized_scores", [])
    total_score = sum(item.get("score", 0) for item in itemized)
    count = len(itemized)
    
    overall_score = round(total_score / count, 2) if count > 0 else 0.0
    state["overall_score"] = overall_score
    
    missing = []
    for item in itemized:
        missing_docs = item.get("missing_items", [])
        if missing_docs:
            for doc in missing_docs:
                missing.append(f"{item.get('approval', 'Unknown')}: {doc}")
                
    state["missing_items"] = missing
    return state

def build_graph():
    graph = StateGraph(PrevalidationState)
    graph.add_node("score", score_documents)
    graph.add_node("compile", compile_results)
    
    graph.set_entry_point("score")
    graph.add_edge("score", "compile")
    graph.add_edge("compile", END)
    
    return graph.compile()

_graph = build_graph()

@router.post("/prevalidate", response_model=PrevalidationOut)
async def run_prevalidate(payload: PrevalidationIn):
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="AI not configured. Add GOOGLE_API_KEY.")

    inputs: PrevalidationState = {
        "selected_approvals": payload.selected_approvals,
        "submitted_documents": [doc.model_dump() for doc in payload.submitted_documents],
        "itemized_scores": [],
        "missing_items": [],
        "overall_score": 0.0
    }

    try:
        result = _graph.invoke(inputs)
        
        itemized_scores = []
        for item in result.get("itemized_scores", []):
            itemized_scores.append(ItemizedScore(
                approval=item.get("approval", ""),
                score=item.get("score", 0),
                rationale=item.get("rationale", "")
            ))
            
        return PrevalidationOut(
            session_id=payload.session_id,
            overall_score=result.get("overall_score", 0.0),
            missing_items=result.get("missing_items", []),
            itemized_scores=itemized_scores
        )
    except Exception as exc:
        print(f"Prevalidation Error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
