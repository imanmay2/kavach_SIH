import os
import io
import asyncio
from typing import List

from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from langchain_qdrant import QdrantVectorStore as QdrantVS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from pypdf import PdfReader

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_CHAT_MODEL = os.getenv("CHAT_MODEL", "gemini-2.5-flash")
GEMINI_EMBED_MODEL = os.getenv("EMBEDDING_MODEL", "models/text-embedding-004")

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))
RAG_COLLECTION = os.getenv("QDRANT_COLLECTION_NAME", "regulatory-docs")
RAG_TOP_K = 4

router = APIRouter()
rag_state = {}

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str
    sources: List[str]

RAG_PROMPT = ChatPromptTemplate.from_template(
    "You are a regulatory assistant. Use ONLY the provided context from regulatory circulars to answer. "
    "If the answer isn't in the context, say you don't know.\n\n"
    "Context:\n{context}\n\n"
    "Question: {question}"
)

def _split_docs(text: str, source: str) -> List[Document]:
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    return [Document(page_content=c, metadata={"source": source}) for c in splitter.split_text(text)]

def _read_pdf(content: bytes) -> str:
    try:
        reader = PdfReader(io.BytesIO(content))
        return "\n\n".join((pg.extract_text() or "") for pg in reader.pages)
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return ""

def initialize_rag_service():
    print("Initializing RAG service components for Regulatory Docs...")
    
    if not GOOGLE_API_KEY:
        print("[WARN] GOOGLE_API_KEY is not set. RAG will not work.")
        return

    try:
        embeddings = GoogleGenerativeAIEmbeddings(model=GEMINI_EMBED_MODEL)
        llm = ChatGoogleGenerativeAI(model=GEMINI_CHAT_MODEL, temperature=0.2)
        
        # Using :memory: mode for local testing as requested.
        # TODO: Swap back to QDRANT_URL/QDRANT_PORT for real Qdrant in production/demo
        qclient = QdrantClient(location=":memory:")
        
        try:
            qclient.get_collection(RAG_COLLECTION)
        except Exception:
            dims = len(embeddings.embed_query("probe"))
            qclient.recreate_collection(
                collection_name=RAG_COLLECTION,
                vectors_config=VectorParams(size=dims, distance=Distance.COSINE),
            )

        vectorstore = QdrantVS(client=qclient, collection_name=RAG_COLLECTION, embedding=embeddings)
        retriever = vectorstore.as_retriever(search_kwargs={"k": RAG_TOP_K})

        rag_state.update({
            "qclient": qclient, 
            "retriever": retriever, 
            "llm": llm,
            "vectorstore": vectorstore
        })
        print("RAG service ready.")
    except Exception as exc:
        print(f"[WARN] Failed to initialize RAG components: {exc}.")

@router.post("/sync-docs")
async def sync_docs(file: UploadFile = File(...)):
    if "vectorstore" not in rag_state:
        raise HTTPException(status_code=503, detail="RAG service not initialized")
    
    content = await file.read()
    if not file.filename.endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported for sync.")
        
    text = _read_pdf(content)
    if not text.strip():
        raise HTTPException(400, "Could not extract text from the PDF.")
        
    docs_to_add = _split_docs(text, file.filename)
    if docs_to_add:
        rag_state["vectorstore"].add_documents(docs_to_add)
        
    return {"message": f"Successfully embedded {len(docs_to_add)} chunks from {file.filename}."}

@router.post("/rag-query", response_model=QueryResponse)
async def query(request: QueryRequest):
    retriever, llm = rag_state.get("retriever"), rag_state.get("llm")
    if not retriever or not llm:
        raise HTTPException(status_code=503, detail="RAG service is not ready.")

    docs = retriever.invoke(request.question)
    
    if not docs:
        return QueryResponse(answer="I couldn't find any relevant information in the documents.", sources=[])

    context = "\n\n".join([d.page_content for d in docs])
    msgs = RAG_PROMPT.format_messages(history="", context=context, question=request.question)
    response = llm.invoke(msgs)
    
    sources = list(set([d.metadata.get("source", "unknown") for d in docs]))
    
    answer_content = response.content
    if isinstance(answer_content, list):
        text_parts = []
        for part in answer_content:
            if isinstance(part, str):
                text_parts.append(part)
            elif isinstance(part, dict) and "text" in part:
                text_parts.append(part["text"])
        answer = "".join(text_parts)
    else:
        answer = str(answer_content)
        
    return QueryResponse(answer=answer, sources=sources)
