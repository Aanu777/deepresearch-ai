from datetime import datetime
from typing import List

from pydantic import BaseModel, Field


# ============================================================
# TIMELINE
# ============================================================

class TimelineEvent(BaseModel):
    id: int
    time: str
    agent: str
    title: str
    description: str
    completed: bool = False


# ============================================================
# THINKING
# ============================================================

class ThinkingStep(BaseModel):
    id: int
    time: str
    message: str


# ============================================================
# SOURCES
# ============================================================

class SourceItem(BaseModel):
    id: int
    title: str
    url: str = ""


# ============================================================
# EVIDENCE
# ============================================================

class EvidenceItem(BaseModel):
    id: str
    source_title: str
    source_url: str = ""

    claim: str = ""
    supporting_text: str = ""

    relevance: float = 0.0
    confidence: float = 0.0


# ============================================================
# METRICS
# ============================================================

class JobMetrics(BaseModel):
    confidence: float = 0.0
    sources: int = 0
    reflections: int = 0
    runtime: int = 0

    evidence_items: int = 0


# ============================================================
# RESEARCH QUESTION
# ============================================================

class ResearchQuestion(BaseModel):
    """
    One question asked inside a Deep Research conversation.
    """

    id: int

    query: str

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )


# ============================================================
# RESEARCH JOB
# ============================================================

class ResearchJob(BaseModel):

    job_id: str

    # --------------------------------------------------------
    # OWNER
    # --------------------------------------------------------
    #
    # Supabase authenticated user ID.
    #
    # Every DeepResearch conversation belongs to exactly
    # one authenticated user.
    #
    # This is used by the backend to enforce ownership.
    # --------------------------------------------------------

    user_id: str

    # --------------------------------------------------------
    # CURRENT / ORIGINAL QUERY
    # --------------------------------------------------------

    query: str

    # --------------------------------------------------------
    # ALL QUESTIONS ASKED IN THIS RESEARCH CONVERSATION
    # --------------------------------------------------------

    questions: List[ResearchQuestion] = Field(
        default_factory=list
    )

    # --------------------------------------------------------
    # PDF INPUT
    # --------------------------------------------------------

    pdf_filename: str | None = None

    pdf_text: str = ""

    # --------------------------------------------------------
    # JOB STATUS
    # --------------------------------------------------------

    status: str = "queued"

    progress: int = 0

    current_step: str = "Waiting"

    report: str = ""

    summary: str = ""

    error: str = ""

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    completed_at: datetime | None = None

    # --------------------------------------------------------
    # WORKSPACE ACTIVITY
    # --------------------------------------------------------

    timeline: List[TimelineEvent] = Field(
        default_factory=list
    )

    thinking: List[ThinkingStep] = Field(
        default_factory=list
    )

    # --------------------------------------------------------
    # SOURCES
    # --------------------------------------------------------

    sources: List[SourceItem] = Field(
        default_factory=list
    )

    # --------------------------------------------------------
    # EVIDENCE
    # --------------------------------------------------------

    evidence: List[EvidenceItem] = Field(
        default_factory=list
    )

    # --------------------------------------------------------
    # METRICS
    # --------------------------------------------------------

    metrics: JobMetrics = Field(
        default_factory=JobMetrics
    )