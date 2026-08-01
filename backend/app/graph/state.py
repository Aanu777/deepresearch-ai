from typing import List
from pydantic import BaseModel, Field


class ResearchState(BaseModel):
    query: str

    plan: List[str] = Field(default_factory=list)

    search_results: List[dict] = Field(default_factory=list)

    extracted_information: List[str] = Field(default_factory=list)

    summary: str = ""

    report: str = ""

    current_step: str = "planning"

    completed: bool = False

    error: str | None = None