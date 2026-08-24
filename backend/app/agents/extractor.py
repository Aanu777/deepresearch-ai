from uuid import uuid4

from app.graph.state import ResearchState


class Extractor:

    def run(
        self,
        state: ResearchState,
    ):

        extracted = []
        evidence = []

        research_mode = state.get(
            "research_mode",
            "web",
        )

        # =========================================================
        # EXTRACT WEB RESEARCH
        # =========================================================

        if research_mode in (
            "web",
            "hybrid",
        ):

            for article in state.get(
                "search_results",
                [],
            ):

                if not isinstance(
                    article,
                    dict,
                ):
                    continue

                title = (
                    article.get("title")
                    or "Unknown Source"
                )

                content = (
                    article.get("content")
                    or ""
                )

                url = (
                    article.get("url")
                    or ""
                )

                extracted.append(
                    {
                        "title": title,
                        "summary": content,
                        "url": url,
                        "source_type": "web",
                    }
                )

                evidence.append(
                    {
                        "id": str(uuid4()),
                        "source_title": title,
                        "source_url": url,
                        "claim": content,
                        "supporting_text": content,
                        "relevance": 1.0,
                        "confidence": 0.8,
                        "research_step": "search",
                        "source_type": "web",
                    }
                )

        # =========================================================
        # EXTRACT ATTACHED PDF
        # =========================================================

        pdf_text = (
            state.get("pdf_text") or ""
        ).strip()

        pdf_filename = (
            state.get("pdf_filename")
            or "Attached PDF"
        )

        if pdf_text:

            extracted.append(
                {
                    "title": pdf_filename,
                    "summary": pdf_text,
                    "url": "",
                    "source_type": "pdf",
                }
            )

            evidence.append(
                {
                    "id": str(uuid4()),
                    "source_title": pdf_filename,
                    "source_url": "",
                    "claim": pdf_text,
                    "supporting_text": pdf_text,
                    "relevance": 1.0,
                    "confidence": 0.95,
                    "research_step": "pdf_extraction",
                    "source_type": "pdf",
                }
            )

        # =========================================================
        # SAVE
        # =========================================================

        state["extracted_information"] = extracted

        state["evidence"] = evidence

        # =========================================================
        # STATUS
        # =========================================================

        if pdf_text and research_mode == "pdf":

            state["current_step"] = (
                "Extracting information from attached PDF"
            )

        elif pdf_text and research_mode == "hybrid":

            state["current_step"] = (
                "Extracting PDF and web sources"
            )

        else:

            state["current_step"] = (
                "Extracting web sources"
            )

        return state


extractor = Extractor()