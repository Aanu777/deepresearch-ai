from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    message_id: str

    chat_id: str

    role: Literal["user", "assistant", "system"]

    content: str

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )