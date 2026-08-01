from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.health import router as health_router
from app.api.v1.research import router as research_router

app = FastAPI(
    title="DeepResearch AI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    health_router,
    prefix="/api/v1",
)

app.include_router(
    research_router,
    prefix="/api/v1",
)

@app.get("/")
async def root():
    return {
        "message": "DeepResearch AI Backend Running 🚀"
    }

@app.get("/health")
async def root_health():
    return {
        "status": "healthy"
    }