from datetime import datetime
from typing import List

from pydantic import BaseModel, Field


# ============================================================
# CHAT
# ============================================================

class Chat(BaseModel):

    chat_id: str

    # ========================================================
    # OWNER
    # ========================================================

    # Supabase authenticated user's UUID.
    #
    # Every chat MUST belong to exactly one user.
    #
    user_id: str

    # ========================================================
    # CHAT INFORMATION
    # ========================================================

    title: str = "New Chat"

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow
    )

    # ========================================================
    # RESEARCH JOBS
    # ========================================================

    job_ids: List[str] = Field(
        default_factory=list
    )

    # ========================================================
    # CONVERSATION MESSAGES
    # ========================================================

    message_ids: List[str] = Field(
        default_factory=list
    )