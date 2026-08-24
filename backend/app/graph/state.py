from typing import TypedDict


# ============================================================
# EVIDENCE
# ============================================================

class EvidenceItem(TypedDict, total=False):

    id: str

    source_id: int
    source_title: str
    source_url: str

    claim: str
    supporting_text: str

    relevance: float
    confidence: float

    research_step: str

    source_type: str


# ============================================================
# RESEARCH STATE
# ============================================================

class ResearchState(TypedDict):

    # ========================================================
    # CORE RESEARCH INFORMATION
    # ========================================================

    job_id: str
    query: str

    # ========================================================
    # RESEARCH MODE
    # ========================================================

    research_mode: str

    # Possible values:
    #
    # "web"
    # "pdf"
    # "hybrid"
    #
    # web    = normal web research
    # pdf    = analyze uploaded PDF only
    # hybrid = PDF + external web research

    # ========================================================
    # OPTIONAL PDF INPUT
    # ========================================================

    pdf_filename: str | None
    pdf_text: str | None

    # ========================================================
    # PLANNER
    # ========================================================

    plan: list[str]

    # ========================================================
    # SEARCH
    # ========================================================

    search_results: list

    # ========================================================
    # EXTRACTION
    # ========================================================

    extracted_information: list

    # ========================================================
    # EVIDENCE
    # ========================================================

    evidence: list[EvidenceItem]

    # ========================================================
    # SYNTHESIS
    # ========================================================

    summary: str

    # ========================================================
    # FINAL REPORT
    # ========================================================

    report: str

    # ========================================================
    # LIVE WORKFLOW STATE
    # ========================================================

    current_step: str
    completed: bool

    # ========================================================
    # REFLECTION
    # ========================================================

    reflection_count: int
    quality_score: float

    research_gaps: list[str]

    contradictions: list[str]

    reflection_reason: str

    next_research_questions: list[str]

    # ========================================================
    # LIVE UI INFORMATION
    # ========================================================

    timeline: list
    thinking: list
    agents: list
    sources: list

    # ========================================================
    # RUNTIME
    # ========================================================

    started_at: float