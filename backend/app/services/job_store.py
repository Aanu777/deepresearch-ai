from typing import Dict

from app.models.research_job import ResearchJob


class JobStore:

    def __init__(self):
        self.jobs: Dict[str, ResearchJob] = {}

    def add(self, job: ResearchJob):
        self.jobs[job.job_id] = job

    def get(self, job_id: str):
        return self.jobs.get(job_id)


job_store = JobStore()