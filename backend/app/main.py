from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.payload_crypto import (
    validate_payload_crypto_config,
)
from app.middleware.payload_encryption import (
    PayloadEncryptionMiddleware,
)

from app.api.v1.research import router as research_router
from app.api.v1.conversations import router as conversations_router
from app.api.v1.memory import router as memory_router
from app.api.v1.websocket import router as websocket_router


# ============================================================
# APPLICATION
# ============================================================

validate_payload_crypto_config()


app = FastAPI(
    title="DeepResearch AI",
    description="Autonomous AI-powered research platform.",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

configured_cors_origins = {
    origin.strip()
    for origin in settings.CORS_ORIGINS.split(",")
    if origin.strip()
}

required_cors_origins = {
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://deepresearch-ai-nu.vercel.app",
    "https://deepresearch-ai-ayan-a664.vercel.app",
    "https://deepresearch-ai-git-main-ayan-a664.vercel.app",
}

cors_origins = sorted(
    configured_cors_origins
    | required_cors_origins
)

local_dev_origin_regex = (
    r"^http://(?:localhost|127\.0\.0\.1)(?::\d+)?$"
)

cors_origin_regex = (
    rf"(?:{settings.CORS_ORIGIN_REGEX})"
    rf"|(?:{local_dev_origin_regex})"
)


app.add_middleware(
    PayloadEncryptionMiddleware,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[
        "X-DR-Encrypted-Response",
        "X-DR-Original-Content-Type",
    ],
)


# ============================================================
# ROOT / HEALTH
# ============================================================

@app.get("/health")
async def health():

    return {
        "status": "ok",
        "version": "1.0.0",
        "payload_encryption_required":
            settings.PAYLOAD_ENCRYPTION_REQUIRED,
    }


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
    memory_router,
    prefix="/api/v1/memory",
    tags=["Memory"],
)

app.include_router(
    websocket_router,
    tags=["WebSocket"],
)