import uuid
from datetime import datetime

from app.models.research_job import ResearchJob
from app.services.job_store import job_store


class ResearchService:

    def create_job(self, query: str):

        job = ResearchJob(
            job_id=str(uuid.uuid4()),
            query=query,
            status="queued",
            progress=0,
            created_at=datetime.utcnow(),
        )

        job_store.add(job)

        return job

    def get_job(self, job_id: str):
        return job_store.get(job_id)


research_service = ResearchService()
