from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app.api.v1.health import router as health_router

app = FastAPI(title="DeepResearch AI")

app.include_router(health_router, prefix="/api/v1")

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

@app.get("/")
async def root():
    return {
        "message": "DeepResearch AI Backend Running 🚀"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }