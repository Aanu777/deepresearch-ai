from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    Field,
)


# ============================================================
# CHAT MESSAGE
# ============================================================


class ChatMessage(BaseModel):

    # ========================================================
    # IDENTITY
    # ========================================================

    message_id: str

    chat_id: str

    # ========================================================
    # MESSAGE OWNER
    # ========================================================

    role: Literal[
        "user",
        "assistant",
    ]

    # ========================================================
    # MESSAGE TYPE
    # ========================================================

    message_type: Literal[
        "text",
        "image",
    ] = "text"

    # ========================================================
    # TEXT CONTENT
    # ========================================================

    content: str = ""

    # ========================================================
    # IMAGE CONTENT
    # ========================================================

    image_url: str | None = None

    image_prompt: str | None = None

    image_operation: Literal[
        "generation",
        "edit",
    ] | None = None

    image_provider: str | None = None

    image_model: str | None = None

    image_media_type: str | None = None

    # ========================================================
    # IMAGE EDIT LINEAGE
    #
    # If this image was created by editing another image,
    # this stores the message_id of that source image.
    #
    # Example:
    #
    # image A
    #   └── image B
    #         └── image C
    # ========================================================

    parent_image_id: str | None = None

    # ========================================================
    # TIMESTAMP
    # ========================================================

    created_at: datetime = Field(
        default_factory=datetime.utcnow
    )