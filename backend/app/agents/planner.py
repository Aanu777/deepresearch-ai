from app.graph.state import ResearchState


class Planner:

    def run(self, state: ResearchState):

        state.plan = [
            f"Understand: {state.query}",
            "Search authoritative sources",
            "Extract important information",
            "Summarize findings",
            "Write final report",
        ]

        state.current_step = "searching"

        return state


planner = Planner()