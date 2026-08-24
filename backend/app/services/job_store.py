from threading import Lock
from typing import Dict, List

from app.models.research_job import ResearchJob


class JobStore:
    """
    Thread-safe in-memory storage for research jobs.

    Each ResearchJob belongs to exactly one authenticated
    Supabase user through `job.user_id`.

    The store still uses job_id as its primary key, but all
    user-facing queries can now be restricted to a specific
    user.
    """

    def __init__(self):
        self._jobs: Dict[str, ResearchJob] = {}

        self._lock = Lock()

    # ============================================================
    # CREATE
    # ============================================================

    def add(
        self,
        job: ResearchJob,
    ) -> None:

        with self._lock:
            self._jobs[job.job_id] = job

    # ============================================================
    # READ
    # ============================================================

    def get(
        self,
        job_id: str,
    ) -> ResearchJob | None:

        with self._lock:
            return self._jobs.get(job_id)

    # ============================================================
    # GET USER JOB
    # ============================================================

    def get_for_user(
        self,
        job_id: str,
        user_id: str,
    ) -> ResearchJob | None:
        """
        Return a job only when it belongs to the requested user.

        This is the main ownership check used by the API layer.
        """

        with self._lock:

            job = self._jobs.get(job_id)

            if job is None:
                return None

            if job.user_id != user_id:
                return None

            return job

    # ============================================================
    # UPDATE
    # ============================================================

    def update(
        self,
        job: ResearchJob,
    ) -> None:

        with self._lock:
            self._jobs[job.job_id] = job

    # ============================================================
    # DELETE
    # ============================================================

    def remove(
        self,
        job_id: str,
    ) -> None:

        with self._lock:
            self._jobs.pop(
                job_id,
                None,
            )

    # ============================================================
    # DELETE USER JOB
    # ============================================================

    def remove_for_user(
        self,
        job_id: str,
        user_id: str,
    ) -> bool:
        """
        Delete a job only when it belongs to the requested user.

        Returns True when the job was removed.
        """

        with self._lock:

            job = self._jobs.get(job_id)

            if job is None:
                return False

            if job.user_id != user_id:
                return False

            del self._jobs[job_id]

            return True

    # ============================================================
    # QUERIES
    # ============================================================

    def exists(
        self,
        job_id: str,
    ) -> bool:

        with self._lock:
            return job_id in self._jobs

    # ============================================================
    # USER JOB QUERIES
    # ============================================================

    def all_for_user(
        self,
        user_id: str,
    ) -> List[ResearchJob]:
        """
        Return only research conversations owned by this user.
        """

        with self._lock:

            return [
                job
                for job in self._jobs.values()
                if job.user_id == user_id
            ]

    def count_for_user(
        self,
        user_id: str,
    ) -> int:

        with self._lock:

            return sum(
                1
                for job in self._jobs.values()
                if job.user_id == user_id
            )

    # ============================================================
    # GLOBAL QUERIES
    # ============================================================
    #
    # These remain available internally so existing backend
    # functionality is not unnecessarily broken.
    #
    # IMPORTANT:
    # API endpoints showing user data must use the user-aware
    # methods above instead of these global methods.
    # ============================================================

    def all(self) -> List[ResearchJob]:

        with self._lock:
            return list(
                self._jobs.values()
            )

    def count(self) -> int:

        with self._lock:
            return len(
                self._jobs
            )

    def clear(self) -> None:

        with self._lock:
            self._jobs.clear()

    # ============================================================
    # USER DASHBOARD HELPERS
    # ============================================================

    def completed_for_user(
        self,
        user_id: str,
    ) -> List[ResearchJob]:

        with self._lock:

            return [
                job
                for job in self._jobs.values()
                if (
                    job.user_id == user_id
                    and job.status == "completed"
                )
            ]

    def running_for_user(
        self,
        user_id: str,
    ) -> List[ResearchJob]:

        with self._lock:

            return [
                job
                for job in self._jobs.values()
                if (
                    job.user_id == user_id
                    and job.status == "running"
                )
            ]

    def failed_for_user(
        self,
        user_id: str,
    ) -> List[ResearchJob]:

        with self._lock:

            return [
                job
                for job in self._jobs.values()
                if (
                    job.user_id == user_id
                    and job.status == "failed"
                )
            ]

    # ============================================================
    # GLOBAL DASHBOARD HELPERS
    # ============================================================
    #
    # Kept for internal/backend compatibility.
    # User-facing endpoints should NOT use these.
    # ============================================================

    def completed(
        self,
    ) -> List[ResearchJob]:

        with self._lock:

            return [
                job
                for job in self._jobs.values()
                if job.status == "completed"
            ]

    def running(
        self,
    ) -> List[ResearchJob]:

        with self._lock:

            return [
                job
                for job in self._jobs.values()
                if job.status == "running"
            ]

    def failed(
        self,
    ) -> List[ResearchJob]:

        with self._lock:

            return [
                job
                for job in self._jobs.values()
                if job.status == "failed"
            ]


job_store = JobStore()