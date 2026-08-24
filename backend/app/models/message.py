from datetime import datetime

from pydantic import BaseModel, Field


# ============================================================
# CHAT MESSAGE
# ============================================================

class ChatMessage(BaseModel):

    # --------------------------------------------------------
    # Identity
    # --------------------------------------------------------

    message_id: str

    chat_id: str

    # --------------------------------------------------------
    # Message content
    # --------------------------------------------------------

    role: str
    content: str

    # --------------------------------------------------------
    # Timestamp
    # --------------------------------------------------------

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )