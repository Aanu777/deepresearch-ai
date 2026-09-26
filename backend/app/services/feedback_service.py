import logging

from datetime import datetime, timezone
from typing import Any

import httpx

from app.core.config import settings


logger = logging.getLogger(__name__)


class FeedbackService:
    """
    Persistent, user-scoped conversation feedback.

    Supabase RLS remains the final ownership boundary because
    requests are made with the authenticated user's access token.
    """

    def __init__(
        self,
    ) -> None:

        self._rest_base = (
            settings
            .SUPABASE_URL
            .rstrip("/")
            + "/rest/v1"
        )

    def _headers(
        self,
        access_token: str,
    ) -> dict[str, str]:

        return {
            "apikey":
                settings
                .SUPABASE_PUBLISHABLE_KEY,

            "Authorization":
                f"Bearer {access_token}",

            "Content-Type":
                "application/json",

            "Prefer":
                (
                    "resolution=merge-duplicates,"
                    "return=minimal"
                ),
        }

    async def upsert(
        self,
        *,
        user_id: str,
        access_token: str,
        chat_id: str,
        message_id: str,
        rating: int,
        reason: str | None,
        correction: str | None,
        metadata: dict[
            str,
            Any,
        ] | None = None,
    ) -> None:

        async with httpx.AsyncClient(
            timeout=6.0
        ) as client:

            response = await client.post(
                (
                    self._rest_base
                    + "/conversation_feedback"
                    + "?on_conflict="
                    + "user_id,message_id"
                ),
                headers=self._headers(
                    access_token
                ),
                json={
                    "user_id":
                        user_id,

                    "chat_id":
                        chat_id,

                    "message_id":
                        message_id,

                    "rating":
                        rating,

                    "reason":
                        reason,

                    "correction":
                        correction,

                    "metadata":
                        metadata or {},

                    "updated_at":
                        datetime.now(
                            timezone.utc
                        ).isoformat(),
                },
            )

        if response.status_code >= 400:
            logger.warning(
                (
                    "Conversation feedback persistence "
                    "failed (status=%s, body=%s)."
                ),
                response.status_code,
                response.text[:500],
            )

            response.raise_for_status()


feedback_service = FeedbackService()
