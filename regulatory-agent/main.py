from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from agents.intake_agent import router as intake_router
from agents.approval_selection_agent import router as approval_router
from agents.prevalidation_agent import router as prevalidation_router
from agents.rag_app import router as rag_router, initialize_rag_service

load_dotenv()

app = FastAPI(title="Regulatory Knowledge Engine (Novelty Core)", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

app.include_router(intake_router, tags=["Intake Agent"])
app.include_router(approval_router, tags=["Approval Selection Agent"])
app.include_router(prevalidation_router, tags=["Prevalidation Agent"])
app.include_router(rag_router, tags=["RAG Agent"])

@app.on_event("startup")
async def startup_event():
    initialize_rag_service()

@app.get("/", tags=["Health"])
def read_root():
    return {"message": "Regulatory Knowledge Engine API", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8002, reload=False)
