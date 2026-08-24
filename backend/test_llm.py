from app.services.llm_service import llm_service

response = llm_service.generate(
    "Explain autonomous research agents in 100 words."
)

print(response)