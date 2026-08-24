from datetime import datetime

from app.models.research_job import (
    EvidenceItem,
    ResearchJob,
    SourceItem,
    ThinkingStep,
    TimelineEvent,
)


class JobStateManager:

    # ============================================================
    # INTERNAL HELPERS
    # ============================================================

    @staticmethod
    def _timestamp() -> str:
        return datetime.now().strftime("%H:%M:%S")

    @staticmethod
    def _next_timeline_id(job: ResearchJob) -> int:
        return len(job.timeline) + 1

    @staticmethod
    def _next_thinking_id(job: ResearchJob) -> int:
        return len(job.thinking) + 1

    @staticmethod
    def _next_source_id(job: ResearchJob) -> int:
        return len(job.sources) + 1

    # ============================================================
    # STATUS
    # ============================================================

    @staticmethod
    def update_status(
        job: ResearchJob,
        status: str | None = None,
        progress: int | None = None,
        step: str | None = None,
    ):

        if status is not None:
            job.status = status

        if progress is not None:
            job.progress = max(
                0,
                min(100, progress),
            )

        if step is not None:
            job.current_step = step

    # ============================================================
    # TIMELINE
    # ============================================================

    @staticmethod
    def add_timeline(
        job: ResearchJob,
        agent: str,
        description: str,
        completed: bool = False,
    ):

        event = TimelineEvent(
            id=JobStateManager._next_timeline_id(job),
            time=JobStateManager._timestamp(),
            agent=agent,
            title=agent,
            description=description,
            completed=completed,
        )

        job.timeline.append(event)

    # ============================================================
    # THINKING
    # ============================================================

    @staticmethod
    def add_thinking(
        job: ResearchJob,
        message: str,
    ):

        step = ThinkingStep(
            id=JobStateManager._next_thinking_id(job),
            time=JobStateManager._timestamp(),
            message=message,
        )

        job.thinking.append(step)

    # ============================================================
    # SUMMARY
    # ============================================================

    @staticmethod
    def set_summary(
        job: ResearchJob,
        summary: str,
    ):

        job.summary = summary

    # ============================================================
    # REPORT
    # ============================================================

    @staticmethod
    def set_report(
        job: ResearchJob,
        report: str,
    ):

        job.report = report

    # ============================================================
    # CONFIDENCE
    # ============================================================

    @staticmethod
    def set_confidence(
        job: ResearchJob,
        confidence: float,
    ):

        # Accept either 0-1 or 0-100 style values.
        if confidence <= 1:
            confidence *= 100

        confidence = max(
            0.0,
            min(100.0, float(confidence)),
        )

        job.metrics.confidence = confidence

    # ============================================================
    # REFLECTIONS
    # ============================================================

    @staticmethod
    def increment_reflection(
        job: ResearchJob,
    ):

        job.metrics.reflections += 1

    # ============================================================
    # SOURCES
    # ============================================================

    @staticmethod
    def add_source(
        job: ResearchJob,
        title: str,
        url: str = "",
    ):

        # Avoid duplicate sources.
        for source in job.sources:

            if (
                source.title == title
                and source.url == url
            ):
                return

        source = SourceItem(
            id=JobStateManager._next_source_id(job),
            title=title,
            url=url,
        )

        job.sources.append(source)

        job.metrics.sources = len(job.sources)

    # ============================================================
    # EVIDENCE
    # ============================================================

    @staticmethod
    def add_evidence(
        job: ResearchJob,
        evidence: dict,
    ):

        if not isinstance(evidence, dict):
            return

        evidence_id = evidence.get("id")

        if not evidence_id:
            return

        # Prevent duplicate evidence.
        for existing in job.evidence:

            if existing.id == evidence_id:
                return

        item = EvidenceItem(
            id=str(evidence_id),

            source_title=evidence.get(
                "source_title",
                "Unknown Source",
            ),

            source_url=evidence.get(
                "source_url",
                "",
            ),

            claim=evidence.get(
                "claim",
                "",
            ),

            supporting_text=evidence.get(
                "supporting_text",
                "",
            ),

            relevance=float(
                evidence.get(
                    "relevance",
                    0.0,
                )
            ),

            confidence=float(
                evidence.get(
                    "confidence",
                    0.0,
                )
            ),
        )

        job.evidence.append(item)

        job.metrics.evidence_items = len(
            job.evidence
        )

    # ============================================================
    # BULK EVIDENCE
    # ============================================================

    @staticmethod
    def set_evidence(
        job: ResearchJob,
        evidence_items: list,
    ):

        if not isinstance(evidence_items, list):
            return

        for evidence in evidence_items:

            JobStateManager.add_evidence(
                job,
                evidence,
            )

    # ============================================================
    # RUNTIME
    # ============================================================

    @staticmethod
    def set_runtime(
        job: ResearchJob,
        runtime: int,
    ):

        job.metrics.runtime = max(
            0,
            int(runtime),
        )

    # ============================================================
    # COMPLETION
    # ============================================================

    @staticmethod
    def mark_completed(
        job: ResearchJob,
    ):

        job.status = "completed"
        job.progress = 100
        job.current_step = "Finished"
        job.completed_at = datetime.utcnow()

    # ============================================================
    # FAILURE
    # ============================================================

    @staticmethod
    def mark_failed(
        job: ResearchJob,
        error: str,
    ):

        job.status = "failed"
        job.error = error
        job.completed_at = datetime.utcnow()