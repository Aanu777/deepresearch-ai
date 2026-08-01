from app.graph.state import ResearchState
from app.agents.planner import planner

state = ResearchState(
    query="Future of autonomous AI agents"
)

state = planner.run(state)

print(state.model_dump())