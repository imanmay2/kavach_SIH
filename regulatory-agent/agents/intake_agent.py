import json
import os
from typing import Any, Dict, List, Optional, TypedDict

from fastapi import APIRouter, HTTPException
from langgraph.graph import END, StateGraph
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
CHAT_MODEL = os.getenv("CHAT_MODEL", "gemini-2.5-flash")

class IntakeState(TypedDict):
    messages: List[Any]
    extracted_data: Dict[str, Any]
    next_question: str
    finished: bool
    session_id: str

EXTRACTION_PROMPT = """
You are a Regulatory Intake Assistant.
Analyze the following conversation and extract details about the industrial project.
Look for:
- sector (e.g., Manufacturing, IT, Pharmaceuticals, Food Processing)
- location (State or City)
- project_size (e.g., Small, Medium, Large)
- stage (e.g., Setup, Operation, Expansion)

Return the response ONLY as a JSON object with these keys. If a value is unknown, set it to null.

Conversation:
{history}
"""

CHAT_PROMPT = """
You are a Regulatory Intake Assistant helping a user determine necessary industrial approvals.

Work as a guided intake assistant:
- Ask one relevant follow-up question at a time when the user's input is incomplete (we need sector, location, project size, and stage).
- Once you have all 4 details, briefly summarize them and ask the user to confirm before proceeding to approval selection.
- If confirmed, set the finished flag to true (in logic).

Conversation:
{history}
"""

def get_chat_model(temperature=0.0):
    return ChatGoogleGenerativeAI(model=CHAT_MODEL, temperature=temperature)

def _extract_text_response(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: List[str] = []
        for part in content:
            if isinstance(part, dict) and "text" in part:
                parts.append(str(part["text"]))
            else:
                parts.append(str(part))
        return "".join(parts)
    return str(content)

def _clean_json_block(text: str) -> str:
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:-3].strip()
    elif text.startswith("```"):
        text = text[3:-3].strip()

    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        text = text[start : end + 1]
    return text

def extract_details(state: IntakeState):
    llm = get_chat_model(temperature=0)
    history = "\n".join(f"{m['role']}: {m['content']}" for m in state["messages"])
    prompt = EXTRACTION_PROMPT.format(history=history)

    try:
        response = llm.invoke(prompt)
        text = _clean_json_block(_extract_text_response(response.content))
        return {"extracted_data": json.loads(text)}
    except Exception as exc:
        print(f"Error parsing intake details: {exc}")
        return {"extracted_data": {}}

def generate_response(state: IntakeState):
    llm = get_chat_model(temperature=0.2)
    history = "\n".join(f"{m['role']}: {m['content']}" for m in state["messages"])
    prompt = CHAT_PROMPT.format(history=history)

    try:
        response = llm.invoke(prompt)
        next_q = _extract_text_response(response.content).strip()
        # Simple heuristic to determine if we are done
        finished = False
        data = state.get("extracted_data", {})
        if all(data.get(k) for k in ["sector", "location", "project_size", "stage"]) and "confirm" in next_q.lower():
            pass # Keep finished false until user confirms
        
        # If the user says yes/confirmed in the last message and we have data
        last_msg = state["messages"][-1]["content"].lower() if state["messages"] else ""
        if all(data.get(k) for k in ["sector", "location", "project_size", "stage"]):
            if "yes" in last_msg or "confirm" in last_msg or "looks good" in last_msg:
                finished = True
                next_q = "Thank you. Your details are confirmed. We will now determine the required approvals."
                
        return {"next_question": next_q, "finished": finished}
    except Exception as exc:
        print(f"Error generating response: {exc}")
        return {"next_question": "Could you provide more details about your project?"}

def build_graph():
    graph = StateGraph(IntakeState)
    graph.add_node("extract", extract_details)
    graph.add_node("respond", generate_response)
    graph.set_entry_point("extract")
    graph.add_edge("extract", "respond")
    graph.add_edge("respond", END)
    return graph.compile()

_graph = build_graph()

class IntakeIn(BaseModel):
    session_id: str
    messages: List[Dict[str, str]]

class IntakeOut(BaseModel):
    session_id: str
    extracted_data: Dict[str, Any]
    next_question: str
    finished: bool

@router.post("/intake", response_model=IntakeOut)
async def run_intake(payload: IntakeIn):
    if not GOOGLE_API_KEY:
        raise HTTPException(status_code=500, detail="AI not configured. Add GOOGLE_API_KEY.")

    inputs: IntakeState = {
        "messages": payload.messages,
        "extracted_data": {},
        "next_question": "",
        "finished": False,
        "session_id": payload.session_id
    }

    try:
        result = _graph.invoke(inputs)
        return IntakeOut(
            session_id=payload.session_id,
            extracted_data=result.get("extracted_data", {}),
            next_question=result.get("next_question", "I've analyzed the conversation."),
            finished=result.get("finished", False),
        )
    except Exception as exc:
        print(f"Intake Error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))
