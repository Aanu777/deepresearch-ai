from app.graph.state import ResearchState
from app.services.llm_service import llm_service


class Synthesizer:

    def run(
        self,
        state: ResearchState,
    ):

        research_mode = state.get(
            "research_mode",
            "web",
        )

        # ========================================================
        # BUILD SOURCE CONTEXT
        # ========================================================

        context_parts = []

        extracted_information = state.get(
            "extracted_information",
            [],
        )

        for item in extracted_information:

            if not isinstance(
                item,
                dict,
            ):
                continue

            title = item.get(
                "title",
                "Unknown Source",
            )

            summary = item.get(
                "summary",
                "",
            )

            url = item.get(
                "url",
                "",
            )

            source_type = item.get(
                "source_type",
                "web",
            )

            if source_type == "pdf":

                source_label = (
                    "USER-UPLOADED PDF"
                )

            else:

                source_label = (
                    "EXTERNAL WEB SOURCE"
                )

            context_parts.append(
                f"""
SOURCE TYPE:
{source_label}

TITLE:
{title}

CONTENT:
{summary}

SOURCE URL:
{url or "User-provided document"}

------------------------------------------------
"""
            )

        context = "\n".join(
            context_parts
        )

        # ========================================================
        # PDF FALLBACK
        # ========================================================

        pdf_text = (
            state.get("pdf_text") or ""
        ).strip()

        pdf_filename = (
            state.get("pdf_filename")
            or "Attached PDF"
        )

        pdf_already_in_context = any(
            isinstance(item, dict)
            and item.get("source_type") == "pdf"
            for item in extracted_information
        )

        if (
            pdf_text
            and not pdf_already_in_context
        ):

            context += f"""
SOURCE TYPE:
USER-UPLOADED PDF

TITLE:
{pdf_filename}

CONTENT:
{pdf_text[:50000]}

SOURCE URL:
User-provided document

------------------------------------------------
"""

        # ========================================================
        # PDF-ONLY PROMPT
        # ========================================================

        if research_mode == "pdf":

            prompt = f"""
You are a document analysis specialist.

The user uploaded a PDF and wants you to analyze
the actual contents of that PDF.

USER REQUEST:

{state.get("query", "")}

IMPORTANT:

The uploaded PDF is the PRIMARY and ONLY research source.

Do NOT perform web research.

Do NOT discuss generic PDF-analysis tools.

Do NOT explain how AI can analyze PDFs.

Do NOT invent information about the document.

Do NOT answer based on general knowledge.

Your answer must be grounded directly in the
actual contents of the uploaded PDF.

If something is not present in the PDF, say that
the document does not provide that information.

DOCUMENT:

{context}

TASK:

Analyze the uploaded document itself.

Depending on what the document contains, identify:

- its purpose
- important topics
- key information
- important numbers
- claims
- tables
- pricing
- recommendations
- conclusions
- notable patterns
- limitations
- anything else directly relevant to the user's request

If the user simply asks to analyze the PDF,
provide a comprehensive analysis of the document.

Return ONLY the document analysis.
"""

        # ========================================================
        # HYBRID PROMPT
        # ========================================================

        elif research_mode == "hybrid":

            prompt = f"""
You are a senior research analyst.

The user provided a PDF and requested research
that may require external information.

USER REQUEST:

{state.get("query", "")}

Use BOTH:

1. The uploaded PDF.
2. External web sources.

SOURCE RULES:

- Clearly distinguish the PDF from external sources.
- Do not invent information.
- Do not silently merge contradictory claims.
- If the PDF disagrees with external sources,
  explicitly mention the disagreement.
- Only use external research when it is relevant
  to the user's request.
- Give priority to the user's uploaded document
  when the request concerns its contents.

RESEARCH MATERIAL:

{context}

TASK:

Create a coherent research synthesis addressing
the user's request.

Return ONLY the research synthesis.
"""

        # ========================================================
        # NORMAL WEB RESEARCH
        # ========================================================

        else:

            prompt = f"""
You are a senior research analyst inside
an autonomous deep research system.

RESEARCH QUESTION:

{state.get("query", "")}

RESEARCH MATERIAL:

{context}

Some sources are external web sources.

SOURCE RULES:

- Use the provided research material.
- Do not invent unsupported facts.
- Distinguish sources where necessary.
- Identify uncertainty when evidence is weak.

TASK:

Create a coherent research synthesis.

Return ONLY the research synthesis.
"""

        # ========================================================
        # GENERATE
        # ========================================================

        summary = llm_service.generate(
            prompt
        )

        # ========================================================
        # SAVE
        # ========================================================

        state["summary"] = summary

        if research_mode == "pdf":

            state["current_step"] = (
                "Synthesizing PDF analysis"
            )

        elif research_mode == "hybrid":

            state["current_step"] = (
                "Synthesizing PDF and external research"
            )

        else:

            state["current_step"] = (
                "Synthesizing research"
            )

        return state


synthesizer = Synthesizer()