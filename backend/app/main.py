from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.research import router as research_router
from app.api.v1.conversations import router as conversations_router
from app.api.v1.websocket import router as websocket_router


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="DeepResearch AI",
    description="Autonomous AI-powered research platform.",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://deepresearch-ai-nu.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
async def root():

    return {
        "name": "DeepResearch AI",
        "status": "online",
        "version": "1.0.0",
    }


# ============================================================
# RESEARCH API
# ============================================================

app.include_router(
    research_router,
    prefix="/api/v1/research",
    tags=["Research"],
)


# ============================================================
# CHAT API
# ============================================================

app.include_router(
    conversations_router,
    prefix="/api/v1/conversations",
    tags=["Conversations"],
)

app.include_router(
    websocket_router,
    tags=["WebSocket"],
)