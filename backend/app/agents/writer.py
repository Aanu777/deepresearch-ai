from app.graph.state import ResearchState
from app.services.llm_service import llm_service


class WriterAgent:

    def run(
        self,
        state: ResearchState,
    ):

        research_mode = state.get(
            "research_mode",
            "web",
        )

        # ========================================================
        # PDF REPORT
        # ========================================================

        if research_mode == "pdf":

            prompt = f"""
You are a professional document-analysis report writer.

The user uploaded a PDF and requested an analysis
of the actual document.

User request:

{state.get("query", "")}

Document analysis:

{state.get("summary", "")}

Write a professional Markdown report based ONLY
on the analysis of the uploaded PDF.

Do NOT introduce unrelated web research.

Do NOT discuss generic AI PDF tools unless the
uploaded document itself discusses them.

Do NOT invent information.

The report should contain:

# Executive Summary

# Key Findings

# Detailed Analysis

# Important Information

# Conclusions

If a section is not applicable to the document,
omit it rather than inventing content.

Return ONLY the final report.
"""

        # ========================================================
        # HYBRID REPORT
        # ========================================================

        elif research_mode == "hybrid":

            prompt = f"""
You are a professional research report writer.

User request:

{state.get("query", "")}

Research synthesis:

{state.get("summary", "")}

Write a complete professional Markdown report.

Clearly distinguish information derived from
the uploaded PDF from information obtained from
external research.

Do not invent information.

Use this structure:

# Executive Summary

# Key Findings

# Detailed Analysis

# Comparison / External Context

# Limitations

# Conclusion

Return ONLY the final report.
"""

        # ========================================================
        # NORMAL WEB REPORT
        # ========================================================

        else:

            prompt = f"""
You are a professional research report writer.

Write a complete report using Markdown.

Topic:

{state.get("query", "")}

Research Summary:

{state.get("summary", "")}

The report should contain:

# Executive Summary

# Key Findings

# Technical Analysis

# Future Outlook

# Conclusion

Write professionally.

Return ONLY the final report.
"""

        # ========================================================
        # GENERATE
        # ========================================================

        report = llm_service.generate(
            prompt
        )

        state["report"] = report

        state["completed"] = True

        state["current_step"] = "Finished"

        return state


writer_agent = WriterAgent()