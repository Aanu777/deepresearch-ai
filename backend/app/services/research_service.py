import threading
import time
import traceback
import uuid
from datetime import datetime

from app.graph.workflow import graph
from app.models.research_job import (
    ResearchJob,
    ResearchQuestion,
)
from app.services.job_store import job_store
from app.state.job_state_manager import JobStateManager


class ResearchService:

    def __init__(self):
        # ========================================================
        # RUN VERSION TRACKING
        #
        # Each research execution receives a version number.
        #
        # This allows us to:
        # - cancel an active run
        # - prevent an older run from overwriting a newer run
        # - safely continue the same research conversation later
        # ========================================================

        self._run_lock = threading.Lock()

        self._run_versions: dict[
            str,
            int,
        ] = {}

        self._cancelled_runs: set[
            tuple[str, int]
        ] = set()

    # ============================================================
    # CREATE NEW RESEARCH CONVERSATION
    # ============================================================

    def create_job(
        self,
        query: str,
        user_id: str,
        pdf_filename: str | None = None,
        pdf_text: str | None = None,
    ):
        query = query.strip()

        job = ResearchJob(
            job_id=str(uuid.uuid4()),

            user_id=user_id,

            query=query,

            questions=[
                ResearchQuestion(
                    id=1,
                    query=query,
                )
            ],

            pdf_filename=pdf_filename,

            pdf_text=pdf_text or "",

            created_at=datetime.utcnow(),
        )

        job_store.add(job)

        return job

    # ============================================================
    # GET JOB
    # ============================================================

    def get_job(
        self,
        job_id: str,
    ):
        return job_store.get(
            job_id
        )

    # ============================================================
    # GET USER JOB
    # ============================================================

    def get_user_job(
        self,
        job_id: str,
        user_id: str,
    ) -> ResearchJob | None:
        job = job_store.get(
            job_id
        )

        if job is None:
            return None

        if job.user_id != user_id:
            return None

        return job

    # ============================================================
    # LIST USER JOBS
    # ============================================================

    def list_jobs(
        self,
        user_id: str,
    ) -> list[ResearchJob]:
        jobs = [
            job
            for job in job_store.all()
            if job.user_id == user_id
        ]

        jobs.sort(
            key=lambda job: job.created_at,
            reverse=True,
        )

        return jobs

    # ============================================================
    # LIST USER JOBS ALIAS
    # ============================================================

    def list_user_jobs(
        self,
        user_id: str,
    ) -> list[ResearchJob]:
        return self.list_jobs(
            user_id
        )

    # ============================================================
    # ADD FOLLOW-UP QUESTION
    # ============================================================

    def add_question(
        self,
        job_id: str,
        query: str,
    ):
        job = job_store.get(
            job_id
        )

        if job is None:
            return None

        query = query.strip()

        if not query:
            return job

        next_id = (
            max(
                (
                    question.id
                    for question in job.questions
                ),
                default=0,
            )
            + 1
        )

        job.questions.append(
            ResearchQuestion(
                id=next_id,
                query=query,
            )
        )

        job.query = query

        # --------------------------------------------------------
        # Reset research output while keeping the SAME job ID.
        # --------------------------------------------------------

        job.status = "queued"

        job.progress = 0

        job.current_step = "Waiting"

        job.report = ""

        job.summary = ""

        job.error = ""

        job.completed_at = None

        job.timeline = []

        job.thinking = []

        job.sources = []

        job.evidence = []

        job.metrics.confidence = 0.0

        job.metrics.sources = 0

        job.metrics.reflections = 0

        job.metrics.runtime = 0

        job.metrics.evidence_items = 0

        job_store.update(
            job
        )

        return job

    # ============================================================
    # ADD FOLLOW-UP QUESTION FOR USER
    # ============================================================

    def add_user_question(
        self,
        job_id: str,
        user_id: str,
        query: str,
    ):
        job = self.get_user_job(
            job_id,
            user_id,
        )

        if job is None:
            return None

        return self.add_question(
            job_id,
            query,
        )

    # ============================================================
    # RUN VERSION
    # ============================================================

    def _begin_run(
        self,
        job_id: str,
    ) -> int:
        with self._run_lock:
            current = (
                self._run_versions.get(
                    job_id,
                    0,
                )
            )

            version = (
                current + 1
            )

            self._run_versions[
                job_id
            ] = version

            return version

    # ============================================================
    # CURRENT RUN CHECK
    # ============================================================

    def _is_current_run(
        self,
        job_id: str,
        run_version: int,
    ) -> bool:
        with self._run_lock:
            return (
                self._run_versions.get(
                    job_id
                )
                == run_version
            )

    # ============================================================
    # CANCEL CHECK
    # ============================================================

    def _is_cancelled(
        self,
        job_id: str,
        run_version: int,
    ) -> bool:
        with self._run_lock:
            return (
                (
                    job_id,
                    run_version,
                )
                in self._cancelled_runs
            )

    # ============================================================
    # SHOULD STOP
    # ============================================================

    def _should_stop(
        self,
        job_id: str,
        run_version: int,
    ) -> bool:
        if not self._is_current_run(
            job_id,
            run_version,
        ):
            return True

        return self._is_cancelled(
            job_id,
            run_version,
        )

    # ============================================================
    # MARK CANCELLED
    # ============================================================

    def _mark_cancelled(
        self,
        job: ResearchJob,
    ):
        job.status = "cancelled"

        job.current_step = (
            "Cancelled"
        )

        job.error = ""

        JobStateManager.add_timeline(
            job,
            "Cancelled",
            "Research was cancelled.",
            True,
        )

        JobStateManager.add_thinking(
            job,
            "Research stopped by the user.",
        )

        job_store.update(
            job
        )

    # ============================================================
    # CANCEL RESEARCH
    # ============================================================

    def cancel_job(
        self,
        job_id: str,
        user_id: str,
    ) -> ResearchJob | None:
        job = self.get_user_job(
            job_id,
            user_id,
        )

        if job is None:
            return None

        # --------------------------------------------------------
        # Already terminal.
        # --------------------------------------------------------

        if job.status in {
            "completed",
            "failed",
            "cancelled",
        }:
            return job

        with self._run_lock:
            current_version = (
                self._run_versions.get(
                    job_id
                )
            )

            if (
                current_version
                is not None
            ):
                self._cancelled_runs.add(
                    (
                        job_id,
                        current_version,
                    )
                )

        # --------------------------------------------------------
        # Mark immediately so the UI responds instantly.
        #
        # If the background function has not begun yet,
        # run_research() will see this status and exit.
        # --------------------------------------------------------

        self._mark_cancelled(
            job
        )

        return job

    # ============================================================
    # RUN RESEARCH
    # ============================================================

    def run_research(
        self,
        job_id: str,
        query: str,
    ):
        job = job_store.get(
            job_id
        )

        if job is None:
            return

        # --------------------------------------------------------
        # Handles cancellation before the BackgroundTask had
        # a chance to begin.
        # --------------------------------------------------------

        if job.status == "cancelled":
            return

        run_version = self._begin_run(
            job_id
        )

        start_time = time.time()

        try:
            # ====================================================
            # INITIAL STATUS
            # ====================================================

            JobStateManager.update_status(
                job,
                status="running",
                progress=0,
                step="Planning",
            )

            JobStateManager.add_timeline(
                job,
                "Planner",
                "Research job created.",
                True,
            )

            job_store.update(
                job
            )

            # ====================================================
            # CANCELLATION CHECK
            # ====================================================

            if self._should_stop(
                job_id,
                run_version,
            ):
                if self._is_cancelled(
                    job_id,
                    run_version,
                ):
                    self._mark_cancelled(
                        job
                    )

                return

            # ====================================================
            # BUILD CONVERSATION CONTEXT
            # ====================================================

            conversation_context = ""

            if job.questions:
                conversation_context = (
                    "\n\n".join(
                        [
                            (
                                f"Previous research "
                                f"question {question.id}: "
                                f"{question.query}"
                            )
                            for question in job.questions
                        ]
                    )
                )

            # ====================================================
            # INITIAL LANGGRAPH STATE
            # ====================================================

            state = {
                "job_id": job_id,

                "user_id": job.user_id,

                "query": query,

                "conversation_history":
                    conversation_context,

                "research_mode": "web",

                "pdf_filename":
                    job.pdf_filename,

                "pdf_text":
                    job.pdf_text or "",

                "plan": [],

                "search_results": [],

                "extracted_information": [],

                "evidence": [],

                "summary": "",

                "report": "",

                "current_step":
                    "Planning",

                "completed": False,

                "reflection_count": 0,

                "quality_score": 0.0,

                "research_gaps": [],

                "contradictions": [],

                "reflection_reason": "",

                "next_research_questions": [],

                "timeline": [],

                "thinking": [],

                "agents": [],

                "sources": [],

                "started_at":
                    start_time,
            }

            # ====================================================
            # PROGRESS MAP
            #
            # Existing graph stages are preserved.
            # ====================================================

            progress = {
                "planner": 10,
                "search": 30,
                "extractor": 50,
                "synthesizer": 70,
                "reflection": 85,
                "writer": 95,
            }

            # ====================================================
            # NODE TITLES
            # ====================================================

            node_titles = {
                "planner": "Planner",
                "search": "Searcher",
                "extractor": "Extractor",
                "synthesizer": "Synthesizer",
                "reflection": "Reflection",
                "writer": "Writer",
            }

            # ====================================================
            # RUN LANGGRAPH
            # ====================================================

            for event in graph.stream(
                state
            ):
                # ------------------------------------------------
                # Cooperative cancellation.
                #
                # We cannot safely interrupt Python in the middle
                # of an executing graph node, so cancellation is
                # applied as soon as that node returns.
                # ------------------------------------------------

                if self._should_stop(
                    job_id,
                    run_version,
                ):
                    if self._is_cancelled(
                        job_id,
                        run_version,
                    ):
                        self._mark_cancelled(
                            job
                        )

                    return

                if not event:
                    continue

                node_name = list(
                    event.keys()
                )[0]

                current_state = event[
                    node_name
                ]

                if not isinstance(
                    current_state,
                    dict,
                ):
                    continue

                agent_title = (
                    node_titles.get(
                        node_name,
                        node_name.capitalize(),
                    )
                )

                # =================================================
                # PROGRESS
                # =================================================

                JobStateManager.update_status(
                    job,
                    progress=progress.get(
                        node_name,
                        job.progress,
                    ),
                    step=current_state.get(
                        "current_step",
                        agent_title,
                    ),
                )

                # =================================================
                # TIMELINE
                # =================================================

                JobStateManager.add_timeline(
                    job,
                    agent_title,
                    current_state.get(
                        "current_step",
                        "Running...",
                    ),
                    True,
                )

                # =================================================
                # THINKING
                # =================================================

                JobStateManager.add_thinking(
                    job,
                    f"{agent_title} is processing...",
                )

                # =================================================
                # SUMMARY
                # =================================================

                summary = (
                    current_state.get(
                        "summary"
                    )
                )

                if summary:
                    JobStateManager.set_summary(
                        job,
                        summary,
                    )

                # =================================================
                # REPORT
                # =================================================

                report = (
                    current_state.get(
                        "report"
                    )
                )

                if report:
                    JobStateManager.set_report(
                        job,
                        report,
                    )

                # =================================================
                # CONFIDENCE
                # =================================================

                quality_score = (
                    current_state.get(
                        "quality_score"
                    )
                )

                if (
                    quality_score
                    is not None
                ):
                    JobStateManager.set_confidence(
                        job,
                        quality_score,
                    )

                # =================================================
                # REFLECTION COUNT
                # =================================================

                reflection_count = (
                    current_state.get(
                        "reflection_count"
                    )
                )

                if (
                    reflection_count
                    is not None
                ):
                    job.metrics.reflections = max(
                        job.metrics.reflections,
                        int(
                            reflection_count
                        ),
                    )

                # =================================================
                # SOURCES
                # =================================================

                search_results = (
                    current_state.get(
                        "search_results"
                    )
                )

                if search_results:
                    for result in search_results:
                        if isinstance(
                            result,
                            dict,
                        ):
                            title = result.get(
                                "title",
                                "Unknown Source",
                            )

                            url = result.get(
                                "url",
                                "",
                            )

                            JobStateManager.add_source(
                                job,
                                title,
                                url,
                            )

                        else:
                            JobStateManager.add_source(
                                job,
                                str(result),
                            )

                # =================================================
                # EVIDENCE
                # =================================================

                evidence = (
                    current_state.get(
                        "evidence"
                    )
                )

                if evidence:
                    JobStateManager.set_evidence(
                        job,
                        evidence,
                    )

                # =================================================
                # PERSIST
                # =================================================

                job_store.update(
                    job
                )

                # =================================================
                # CANCEL AFTER NODE
                # =================================================

                if self._should_stop(
                    job_id,
                    run_version,
                ):
                    if self._is_cancelled(
                        job_id,
                        run_version,
                    ):
                        self._mark_cancelled(
                            job
                        )

                    return

            # ====================================================
            # DON'T COMPLETE CANCELLED / STALE RUNS
            # ====================================================

            if self._should_stop(
                job_id,
                run_version,
            ):
                if self._is_cancelled(
                    job_id,
                    run_version,
                ):
                    self._mark_cancelled(
                        job
                    )

                return

            # ====================================================
            # FINAL RUNTIME
            # ====================================================

            runtime = int(
                time.time()
                - start_time
            )

            JobStateManager.set_runtime(
                job,
                runtime,
            )

            # ====================================================
            # COMPLETED
            # ====================================================

            JobStateManager.mark_completed(
                job
            )

            JobStateManager.add_timeline(
                job,
                "Completed",
                "Research completed successfully.",
                True,
            )

            JobStateManager.add_thinking(
                job,
                "Final report generated.",
            )

            job_store.update(
                job
            )

            # ====================================================
            # DEBUG
            # ====================================================

            print(
                "\n========== RESEARCH MODE ==========\n"
            )

            print(
                state.get(
                    "research_mode",
                    "unknown",
                )
            )

            print(
                "\n========== USER ==========\n"
            )

            print(
                job.user_id
            )

            print(
                "\n========== REPORT ==========\n"
            )

            print(
                job.report
            )

            print(
                "\n============================\n"
            )

            print(
                f"Sources discovered: "
                f"{len(job.sources)}"
            )

            print(
                f"Evidence items: "
                f"{len(job.evidence)}"
            )

            print(
                f"Runtime: "
                f"{job.metrics.runtime}s"
            )

            print(
                "\n============================\n"
            )

        # ========================================================
        # ERROR HANDLING
        # ========================================================

        except Exception as exc:
            traceback.print_exc()

            # ----------------------------------------------------
            # Never transform a cancelled/stale run into failed.
            # ----------------------------------------------------

            if self._should_stop(
                job_id,
                run_version,
            ):
                if self._is_cancelled(
                    job_id,
                    run_version,
                ):
                    self._mark_cancelled(
                        job
                    )

                return

            JobStateManager.mark_failed(
                job,
                str(exc),
            )

            job_store.update(
                job
            )


# ================================================================
# SINGLE SERVICE INSTANCE
# ================================================================

research_service = ResearchService()