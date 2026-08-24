from app.graph.state import ResearchState
from app.tools.search import search_tool


class SearchAgent:

    def run(
        self,
        state: ResearchState,
    ):

        research_mode = state.get(
            "research_mode",
            "web",
        )

        # ========================================================
        # PDF-ONLY MODE
        # ========================================================

        if research_mode == "pdf":

            state["search_results"] = []

            state["current_step"] = (
                "Using attached PDF as primary source"
            )

            return state

        # ========================================================
        # WEB / HYBRID MODE
        # ========================================================

        results = search_tool.search(
            state["query"]
        )

        state["search_results"] = (
            results.get(
                "results",
                [],
            )
        )

        if research_mode == "hybrid":

            state["current_step"] = (
                "Searching external sources alongside PDF"
            )

        else:

            state["current_step"] = (
                "Searching external sources"
            )

        return state


search_agent = SearchAgent()