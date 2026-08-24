from io import BytesIO

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from app.core.auth import (
    AuthenticatedUser,
    get_current_user,
)

from app.schemas.research import (
    ResearchQuestionRequest,
    ResearchResponse,
)

from app.services.research_service import (
    research_service,
)


router = APIRouter()


# ============================================================
# CREATE NEW RESEARCH CONVERSATION
# ============================================================

@router.post(
    "/",
    response_model=ResearchResponse,
)
async def create_research_job(
    background_tasks: BackgroundTasks,

    query: str = Form(default=""),

    pdf: UploadFile | None = File(
        default=None
    ),

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
):

    query = (query or "").strip()

    # ========================================================
    # PDF VARIABLES
    # ========================================================

    pdf_filename: str | None = None

    pdf_text: str = ""

    # ========================================================
    # DETERMINE WHETHER PDF EXISTS
    # ========================================================

    has_pdf = (
        pdf is not None
        and bool(pdf.filename)
    )

    # ========================================================
    # READ PDF
    # ========================================================

    if has_pdf:

        filename = pdf.filename.strip()

        if not filename.lower().endswith(".pdf"):

            raise HTTPException(
                status_code=400,
                detail="Only PDF files are supported.",
            )

        pdf_filename = filename

        try:

            pdf_bytes = await pdf.read()

            if not pdf_bytes:

                raise HTTPException(
                    status_code=400,
                    detail="The uploaded PDF is empty.",
                )

            from pypdf import PdfReader

            reader = PdfReader(
                BytesIO(pdf_bytes)
            )

            pages: list[str] = []

            for page in reader.pages:

                try:
                    text = page.extract_text()

                except Exception:
                    text = None

                if text:

                    cleaned_text = text.strip()

                    if cleaned_text:
                        pages.append(
                            cleaned_text
                        )

            pdf_text = (
                "\n\n".join(pages)
                .strip()
            )

        except HTTPException:
            raise

        except Exception as exc:

            raise HTTPException(
                status_code=400,
                detail=f"Failed to read PDF: {exc}",
            )

    # ========================================================
    # VALIDATE INPUT
    # ========================================================

    if not query and not has_pdf:

        raise HTTPException(
            status_code=400,
            detail=(
                "Please enter a research question "
                "or attach a PDF."
            ),
        )

    # ========================================================
    # PDF ONLY
    # ========================================================

    research_query = query

    if not research_query and has_pdf:

        research_query = (
            "Analyze the attached PDF and produce a "
            "comprehensive research report based on its "
            "contents. Identify the main topics, important "
            "findings, key claims, supporting evidence, "
            "limitations, and conclusions."
        )

    # ========================================================
    # CREATE JOB
    # ========================================================

    try:

        job = research_service.create_job(
            user_id=current_user.user_id,
            query=research_query,
            pdf_filename=pdf_filename,
            pdf_text=pdf_text,
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Failed to create research job: {exc}"
            ),
        )

    # ========================================================
    # START BACKGROUND RESEARCH
    # ========================================================

    background_tasks.add_task(
        research_service.run_research,
        job.job_id,
        research_query,
    )

    # ========================================================
    # RESPONSE
    # ========================================================

    return ResearchResponse(
        job_id=job.job_id,
        status=job.status,
        message="Research started successfully.",
    )


# ============================================================
# ASK FOLLOW-UP QUESTION IN EXISTING RESEARCH
# ============================================================

@router.post(
    "/{job_id}/question",
    response_model=ResearchResponse,
)
async def ask_research_question(
    job_id: str,

    request: ResearchQuestionRequest,

    background_tasks: BackgroundTasks,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
):

    query = request.query.strip()

    if not query:

        raise HTTPException(
            status_code=400,
            detail="Research question cannot be empty.",
        )

    # ========================================================
    # VERIFY JOB OWNERSHIP
    # ========================================================

    job = research_service.get_user_job(
        job_id,
        current_user.user_id,
    )

    if job is None:

        raise HTTPException(
            status_code=404,
            detail="Research job not found.",
        )

    # ========================================================
    # ADD QUESTION TO EXISTING CHAT
    # ========================================================

    updated_job = research_service.add_question(
        job_id=job_id,
        query=query,
        user_id=current_user.user_id,
    )

    if updated_job is None:

        raise HTTPException(
            status_code=404,
            detail="Research job not found.",
        )

    # ========================================================
    # RUN RESEARCH AGAIN
    #
    # SAME JOB ID
    #
    # Therefore:
    #
    # ONE sidebar conversation
    #
    # ========================================================

    background_tasks.add_task(
        research_service.run_research,
        job_id,
        query,
    )

    return ResearchResponse(
        job_id=job_id,
        status="queued",
        message="Research question added successfully.",
    )


# ============================================================
# FULL JOB
# ============================================================

@router.get("/{job_id}")
async def get_job(
    job_id: str,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
):

    job = research_service.get_user_job(
        job_id,
        current_user.user_id,
    )

    if job is None:

        raise HTTPException(
            status_code=404,
            detail="Research job not found.",
        )

    return job


# ============================================================
# REPORT
# ============================================================

@router.get("/{job_id}/report")
async def get_report(
    job_id: str,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
):

    job = research_service.get_user_job(
        job_id,
        current_user.user_id,
    )

    if job is None:

        raise HTTPException(
            status_code=404,
            detail="Research job not found.",
        )

    return {
        "report": job.report,
        "summary": job.summary,
    }


# ============================================================
# TIMELINE
# ============================================================

@router.get("/{job_id}/timeline")
async def get_timeline(
    job_id: str,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
):

    job = research_service.get_user_job(
        job_id,
        current_user.user_id,
    )

    if job is None:

        raise HTTPException(
            status_code=404,
            detail="Research job not found.",
        )

    return job.timeline


# ============================================================
# THINKING
# ============================================================

@router.get("/{job_id}/thinking")
async def get_thinking(
    job_id: str,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
):

    job = research_service.get_user_job(
        job_id,
        current_user.user_id,
    )

    if job is None:

        raise HTTPException(
            status_code=404,
            detail="Research job not found.",
        )

    return job.thinking


# ============================================================
# SOURCES
# ============================================================

@router.get("/{job_id}/sources")
async def get_sources(
    job_id: str,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
):

    job = research_service.get_user_job(
        job_id,
        current_user.user_id,
    )

    if job is None:

        raise HTTPException(
            status_code=404,
            detail="Research job not found.",
        )

    return job.sources


# ============================================================
# METRICS
# ============================================================

@router.get("/{job_id}/metrics")
async def get_metrics(
    job_id: str,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
):

    job = research_service.get_user_job(
        job_id,
        current_user.user_id,
    )

    if job is None:

        raise HTTPException(
            status_code=404,
            detail="Research job not found.",
        )

    return job.metrics


# ============================================================
# STATUS
# ============================================================

@router.get("/{job_id}/status")
async def get_status(
    job_id: str,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
):

    job = research_service.get_user_job(
        job_id,
        current_user.user_id,
    )

    if job is None:

        raise HTTPException(
            status_code=404,
            detail="Research job not found.",
        )

    return {
        "status": job.status,
        "progress": job.progress,
        "current_step": job.current_step,
    }


# ============================================================
# DASHBOARD / HISTORY
# ============================================================

@router.get("/")
async def dashboard(
    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
):

    jobs = research_service.list_jobs(
        current_user.user_id
    )

    return {
        "total_jobs": len(jobs),
        "jobs": jobs,
    }