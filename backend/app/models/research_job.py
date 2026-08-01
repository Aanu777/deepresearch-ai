from datetime import datetime
from pydantic import BaseModel


class ResearchJob(BaseModel):
    job_id: str
    query: str
    status: str
    progress: int
    created_at: datetime