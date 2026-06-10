"""
Pakistan Constitution RAG API Backend
FastAPI server for querying Pakistan Constitution using Pinecone + Gemini
Falls back to OpenAI (gpt-4o-mini) when Gemini is unavailable.
Deploy on Railway
"""

import os
import time
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pinecone import Pinecone
from dotenv import load_dotenv
from google import genai
from google.genai import errors as genai_errors

# Load environment variables
load_dotenv()

# =====================================================
# CONFIG
# =====================================================
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
INDEX_NAME = "pakllama"
TOP_K = 7

# Primary model (Gemini). Preview models throw 503s more often, so default to GA.
MODEL_NAME = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash")
# Fallback model (OpenAI), used only when Gemini is unavailable.
FALLBACK_MODEL_NAME = os.environ.get("OPENAI_MODEL", "gpt-4.1-mini")

# Retry settings for transient errors (503 = model overloaded/unavailable)
MAX_RETRIES = 4
INITIAL_BACKOFF = 1.0  # seconds, doubles each retry

# =====================================================
# INIT CLIENTS
# =====================================================
if not PINECONE_API_KEY:
    raise RuntimeError("PINECONE_API_KEY is not set")
if not GOOGLE_API_KEY:
    raise RuntimeError("GOOGLE_API_KEY is not set")

pc = Pinecone(api_key=PINECONE_API_KEY)
index = pc.Index(INDEX_NAME)

# Initialize Gemini client with new SDK
client = genai.Client(api_key=GOOGLE_API_KEY)

# Initialize OpenAI client only if a key is present (fallback is optional).
openai_client = None
if OPENAI_API_KEY:
    try:
        from openai import OpenAI
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
    except Exception as e:
        print(f"OpenAI client init failed (fallback disabled): {e}")
else:
    print("OPENAI_API_KEY not set -- Gemini fallback to OpenAI is disabled.")

# =====================================================
# FASTAPI APP
# =====================================================
app = FastAPI(
    title="Pakistan Constitution AI",
    description="Ask questions about the Constitution of Pakistan",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # must be False when allow_origins is "*"
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# =====================================================
# PYDANTIC MODELS
# =====================================================
class QueryRequest(BaseModel):
    question: str
    top_k: Optional[int] = TOP_K

class Citation(BaseModel):
    ref: str
    article: str
    title: str
    score: float
    text_preview: str

class QueryResponse(BaseModel):
    question: str
    answer: str
    citations: List[Citation]
    num_sources: int
    model_used: str

class HealthResponse(BaseModel):
    status: str
    index: str
    model: str
    fallback_model: str
    fallback_enabled: bool

# =====================================================
# RETRIEVAL FROM PINECONE
# =====================================================
def retrieve_from_pinecone(query: str, top_k: int = TOP_K) -> List[dict]:
    """Search Pinecone index using integrated llama-text-embed-v2."""
    try:
        results = index.search(
            namespace="__default__",
            query={
                "inputs": {"text": query},
                "top_k": top_k
            },
            fields=["text", "article", "title", "keywords"]
        )
    except Exception as e:
        print(f"Search error: {e}")
        return []

    retrieved = []
    hits = []

    if hasattr(results, 'result'):
        hits = results.result.get('hits', []) if hasattr(results.result, 'get') else getattr(results.result, 'hits', [])

    for match in hits:
        fields = match.get('fields', {}) if hasattr(match, 'get') else getattr(match, 'fields', {})
        retrieved.append({
            "id": match.get('_id', '') if hasattr(match, 'get') else getattr(match, '_id', ''),
            "score": match.get('_score', 0.0) if hasattr(match, 'get') else getattr(match, '_score', 0.0),
            "text": fields.get('text', '') if hasattr(fields, 'get') else getattr(fields, 'text', ''),
            "article": fields.get('article', '') if hasattr(fields, 'get') else getattr(fields, 'article', ''),
            "title": fields.get('title', '') if hasattr(fields, 'get') else getattr(fields, 'title', ''),
            "keywords": fields.get('keywords', '') if hasattr(fields, 'get') else getattr(fields, 'keywords', ''),
        })

    return retrieved

# =====================================================
# LLM CALLS: GEMINI (primary) + OPENAI (fallback)
# =====================================================
def _call_gemini_with_retry(prompt: str) -> str:
    """Call Gemini, retrying on transient 503/429 errors with backoff.
    Raises on final failure so the caller can fall back to OpenAI."""
    backoff = INITIAL_BACKOFF
    last_error = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt
            )
            return response.text
        except genai_errors.APIError as e:
            last_error = e
            status = getattr(e, "code", None) or getattr(e, "status_code", None)
            if status in (503, 429) and attempt < MAX_RETRIES:
                print(f"Gemini {status} on attempt {attempt}, retrying in {backoff}s...")
                time.sleep(backoff)
                backoff *= 2
                continue
            raise
        except Exception as e:
            last_error = e
            raise

    raise last_error if last_error else RuntimeError("Gemini call failed")


def _call_openai(prompt: str) -> str:
    """Call OpenAI as a fallback. Raises if no client or the call fails."""
    if openai_client is None:
        raise RuntimeError("OpenAI fallback is not configured (OPENAI_API_KEY missing)")

    response = openai_client.chat.completions.create(
        model=FALLBACK_MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content


def generate_with_fallback(prompt: str) -> tuple[str, str]:
    """Try Gemini first; fall back to OpenAI if Gemini is unavailable.
    Returns (answer_text, model_used)."""
    try:
        return _call_gemini_with_retry(prompt), MODEL_NAME
    except Exception as gemini_error:
        print(f"Gemini unavailable, attempting OpenAI fallback: {gemini_error}")
        try:
            return _call_openai(prompt), FALLBACK_MODEL_NAME
        except Exception as openai_error:
            # Both providers failed -- surface a combined message.
            raise RuntimeError(
                f"Both providers failed. Gemini: {gemini_error} | OpenAI: {openai_error}"
            )

# =====================================================
# ANSWER GENERATION
# =====================================================
def generate_answer(query: str, contexts: List[dict]) -> tuple[str, str]:
    """Generate answer, returning (answer_text, model_used)."""
    if not contexts:
        return ("I couldn't find relevant information in the Constitution to answer your question.", "none")

    # Build context string
    context_str = ""
    for i, ctx in enumerate(contexts, 1):
        article_info = f"Article {ctx['article']}" if ctx.get('article') else f"Source {i}"
        title_info = f" - {ctx['title']}" if ctx.get('title') else ""
        context_str += f"\n{article_info}{title_info}:\n{ctx['text']}\n"

    prompt = f"""You are a friendly legal expert assistant specializing in the Constitution of Pakistan.

QUESTION: {query}

CONTEXT FROM CONSTITUTION:
{context_str}

INSTRUCTIONS FOR YOUR RESPONSE:

1. Structure your answer clearly:
   - Start with a brief 1-2 sentence summary answering the question directly
   - Then provide details using bullet points
   - Keep it concise and easy to read

2. Formatting Rules:
   - Do NOT use any markdown formatting (no **, no *, no #, no headings)
   - Use simple bullet points with "•" for lists
   - Keep paragraphs short (2-3 sentences max)
   - Use plain text only
   - Mention Article numbers naturally (e.g., "Article 25 states that...")

3. Content Rules:
   - Primarily use the provided context from the Constitution
   - If the context doesn't fully answer the question, you may supplement with your general knowledge about Pakistan's Constitution
   - Do NOT use citation numbers like [1], [2], etc.

4. Example Format:
   Article 25 establishes the principle of equality before law.

   Key points:
   • All citizens are equal before law
   • No discrimination based on sex
   • State can make special provisions for women and children

Now provide a clear, plain-text answer:"""

    try:
        return generate_with_fallback(prompt)
    except Exception as e:
        return (f"Error generating answer: {str(e)}", "error")

# =====================================================
# API ENDPOINTS
# =====================================================
@app.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        index=INDEX_NAME,
        model=MODEL_NAME,
        fallback_model=FALLBACK_MODEL_NAME,
        fallback_enabled=openai_client is not None,
    )

@app.post("/ask", response_model=QueryResponse)
async def ask_question(request: QueryRequest):
    """
    Ask a question about the Pakistan Constitution.
    Returns an AI-generated answer with citations from relevant articles.
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    # Retrieve relevant documents
    contexts = retrieve_from_pinecone(request.question, request.top_k)

    if not contexts:
        raise HTTPException(status_code=404, detail="No relevant articles found")

    # Generate answer (Gemini, with OpenAI fallback)
    answer, model_used = generate_answer(request.question, contexts)

    # Build citations
    citations = []
    for i, ctx in enumerate(contexts, 1):
        citations.append(Citation(
            ref=f"[{i}]",
            article=ctx.get('article', 'N/A'),
            title=ctx.get('title', 'N/A')[:100],
            score=round(ctx.get('score', 0.0), 4),
            text_preview=ctx.get('text', '')[:200] + "..."
        ))

    return QueryResponse(
        question=request.question,
        answer=answer,
        citations=citations,
        num_sources=len(contexts),
        model_used=model_used,
    )

@app.get("/articles")
async def list_articles():
    """Get a sample of available articles."""
    sample_queries = [
        "fundamental rights",
        "president powers",
        "supreme court"
    ]

    articles = set()
    for query in sample_queries:
        results = retrieve_from_pinecone(query, top_k=3)
        for r in results:
            if r.get('article'):
                articles.add(r['article'])

    return {"available_articles": sorted(list(articles))[:20]}

# =====================================================
# RUN SERVER
# =====================================================
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
