from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.middleware.payload_encryption import (
    PayloadEncryptionMiddleware,
)

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

cors_origins = [
    origin.strip()
    for origin in settings.CORS_ORIGINS.split(",")
    if origin.strip()
]


app.add_middleware(
    PayloadEncryptionMiddleware,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[
        "X-DR-Encrypted-Response",
        "X-DR-Original-Content-Type",
    ],
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