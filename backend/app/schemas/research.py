from pydantic import BaseModel, Field


class ResearchRequest(BaseModel):

    query: str = Field(
        default="",
        max_length=500,
    )


class ResearchQuestionRequest(BaseModel):

    query: str = Field(
        ...,
        min_length=1,
        max_length=500,
    )


class ResearchResponse(BaseModel):

    job_id: str

    status: str

    message: str