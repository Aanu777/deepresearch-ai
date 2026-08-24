from app.graph.state import ResearchState
from app.graph.workflow import graph

state = ResearchState(
    query="Future of autonomous research agents"
)

result = graph.invoke(state)

print("\n============================")
print("FINAL REPORT")
print("============================\n")

print(result["report"])