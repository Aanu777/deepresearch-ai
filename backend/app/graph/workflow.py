from langgraph.graph import StateGraph, END

from app.graph.state import ResearchState

from app.agents.planner import planner
from app.agents.searcher import search_agent
from app.agents.extractor import extractor
from app.agents.synthesizer import synthesizer
from app.agents.reflection import reflection_agent
from app.agents.writer import writer_agent


def planner_node(state: ResearchState):
    return planner.run(state)


def search_node(state: ResearchState):
    return search_agent.run(state)


def extractor_node(state: ResearchState):
    return extractor.run(state)


def synthesizer_node(state: ResearchState):
    return synthesizer.run(state)


def reflection_node(state: ResearchState):
    return reflection_agent.run(state)


def writer_node(state: ResearchState):
    return writer_agent.run(state)


def reflection_router(state: ResearchState):
    """
    Decide whether to continue researching or finish.
    """

    if state["quality_score"] >= 8:
        return "writer"

    if state["reflection_count"] >= 2:
        return "writer"

    return "search"


workflow = StateGraph(ResearchState)

workflow.add_node("planner", planner_node)
workflow.add_node("search", search_node)
workflow.add_node("extractor", extractor_node)
workflow.add_node("synthesizer", synthesizer_node)
workflow.add_node("reflection", reflection_node)
workflow.add_node("writer", writer_node)

workflow.set_entry_point("planner")

workflow.add_edge("planner", "search")
workflow.add_edge("search", "extractor")
workflow.add_edge("extractor", "synthesizer")
workflow.add_edge("synthesizer", "reflection")

workflow.add_conditional_edges(
    "reflection",
    reflection_router,
    {
        "search": "search",
        "writer": "writer",
    },
)

workflow.add_edge("writer", END)

graph = workflow.compile()