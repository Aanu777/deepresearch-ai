from app.graph.state import ResearchState


class Planner:

    # ============================================================
    # DETERMINE RESEARCH MODE
    # ============================================================

    def determine_mode(
        self,
        state: ResearchState,
    ) -> str:

        pdf_text = (
            state.get("pdf_text") or ""
        ).strip()

        query = (
            state.get("query") or ""
        ).strip().lower()

        # --------------------------------------------------------
        # No PDF
        # --------------------------------------------------------

        if not pdf_text:
            return "web"

        # --------------------------------------------------------
        # PDF exists
        #
        # Look for requests that clearly refer to the document
        # itself and do not require outside information.
        # --------------------------------------------------------

        pdf_only_phrases = [
            "analyse this pdf",
            "analyze this pdf",
            "analyze the pdf",
            "analyse the pdf",
            "summarize this pdf",
            "summarise this pdf",
            "summarize the pdf",
            "summarise the pdf",
            "review this pdf",
            "review the pdf",
            "explain this pdf",
            "explain the pdf",
            "read this pdf",
            "read the pdf",
            "what does this pdf say",
            "what does the pdf say",
            "what is in this pdf",
            "what is in the pdf",
            "extract information from this pdf",
            "extract information from the pdf",
            "analyze this document",
            "analyse this document",
            "summarize this document",
            "summarise this document",
            "review this document",
            "explain this document",
            "read this document",
        ]

        for phrase in pdf_only_phrases:

            if phrase in query:
                return "pdf"

        # --------------------------------------------------------
        # Empty query + PDF
        #
        # The API creates a default query for PDF-only uploads.
        # Treat it as PDF-only research.
        # --------------------------------------------------------

        if not query:
            return "pdf"

        if (
            "attached pdf" in query
            or "attached document" in query
        ):
            return "pdf"

        # --------------------------------------------------------
        # Explicit external research requests
        # --------------------------------------------------------

        external_research_phrases = [
            "compare",
            "comparison",
            "current",
            "latest",
            "recent",
            "today",
            "2026",
            "external sources",
            "outside sources",
            "web research",
            "research online",
            "search online",
            "industry trends",
            "market trends",
            "competitors",
            "competition",
        ]

        for phrase in external_research_phrases:

            if phrase in query:
                return "hybrid"

        # --------------------------------------------------------
        # If the user has a PDF and asks a specific question,
        # default to the PDF rather than randomly searching.
        # --------------------------------------------------------

        return "pdf"

    # ============================================================
    # RUN
    # ============================================================

    def run(
        self,
        state: ResearchState,
    ):

        research_mode = self.determine_mode(
            state
        )

        state["research_mode"] = research_mode

        query = state.get(
            "query",
            "",
        )

        if research_mode == "pdf":

            state["plan"] = [
                "Understand the user's request",
                "Read the attached PDF",
                "Extract important information",
                "Evaluate evidence from the document",
                "Synthesize the document findings",
                "Write the final report",
            ]

            state["current_step"] = (
                "Analyzing attached PDF"
            )

        elif research_mode == "hybrid":

            state["plan"] = [
                f"Understand: {query}",
                "Analyze the attached PDF",
                "Search authoritative external sources",
                "Extract important information",
                "Compare document and external evidence",
                "Synthesize findings",
                "Write the final report",
            ]

            state["current_step"] = (
                "Planning PDF and web research"
            )

        else:

            state["plan"] = [
                f"Understand: {query}",
                "Search authoritative sources",
                "Extract important information",
                "Summarize findings",
                "Write final report",
            ]

            state["current_step"] = "Planning"

        return state


planner = Planner()