from fastapi import APIRouter
from fastapi import HTTPException

from app.schemas.research import (
    ResearchRequest,
    ResearchResponse,
)

from app.services.research_service import research_service

from app.models.research_job import ResearchJob

router = APIRouter(prefix="/research", tags=["Research"])

@router.get("/{job_id}")
async def get_job(job_id: str):

    job = research_service.get_job(job_id)

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    return job

@router.post(
    "/",
    response_model=ResearchResponse,
)
async def create_research_job(
    request: ResearchRequest,
):

    return research_service.create_job(
        request.query
    )