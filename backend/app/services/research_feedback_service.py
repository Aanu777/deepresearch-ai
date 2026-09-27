import logging

from datetime import datetime, timezone
from typing import Any

import httpx

from app.core.config import settings


logger = logging.getLogger(__name__)


class ResearchFeedbackService:
    """
    Persistent report-quality feedback and lightweight
    per-user source-domain learning.

    Domain preferences are advisory only. They never hard-block
    sources and never become a required dependency for research.
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
        *,
        prefer: str | None = None,
    ) -> dict[str, str]:

        headers = {
            "apikey":
                settings
                .SUPABASE_PUBLISHABLE_KEY,

            "Authorization":
                f"Bearer {access_token}",

            "Content-Type":
                "application/json",
        }

        if prefer:
            headers[
                "Prefer"
            ] = prefer

        return headers

    async def upsert(
        self,
        *,
        user_id: str,
        access_token: str,
        job_id: str,
        rating: int,
        reason: str | None,
        correction: str | None,
        source_domains: list[str],
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
                    + "/research_feedback"
                    + "?on_conflict="
                    + "user_id,job_id"
                ),
                headers=self._headers(
                    access_token,
                    prefer=(
                        "resolution=merge-duplicates,"
                        "return=minimal"
                    ),
                ),
                json={
                    "user_id":
                        user_id,

                    "job_id":
                        job_id,

                    "rating":
                        rating,

                    "reason":
                        reason,

                    "correction":
                        correction,

                    "source_domains":
                        source_domains,

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
                    "Research feedback persistence failed "
                    "(status=%s, body=%s)."
                ),
                response.status_code,
                response.text[:500],
            )

            response.raise_for_status()

    def preferred_domains(
        self,
        *,
        access_token: str,
        limit: int = 3,
    ) -> list[str]:

        try:
            with httpx.Client(
                timeout=4.0
            ) as client:

                response = client.get(
                    (
                        self._rest_base
                        + "/research_feedback"
                        + "?select="
                        + "rating,reason,source_domains"
                        + "&order=updated_at.desc"
                        + "&limit=100"
                    ),
                    headers=self._headers(
                        access_token
                    ),
                )

            response.raise_for_status()

            rows = response.json()

            if not isinstance(
                rows,
                list,
            ):
                return []

            scores: dict[
                str,
                int,
            ] = {}

            for row in rows:

                if not isinstance(
                    row,
                    dict,
                ):
                    continue

                rating = row.get(
                    "rating"
                )

                reason = row.get(
                    "reason"
                )

                domains = row.get(
                    "source_domains",
                    [],
                )

                if not isinstance(
                    domains,
                    list,
                ):
                    continue

                if rating == 1:
                    delta = 1

                elif (
                    rating == -1
                    and reason
                    == "bad_sources"
                ):
                    delta = -1

                else:
                    continue

                for domain in domains:

                    if not isinstance(
                        domain,
                        str,
                    ):
                        continue

                    normalized = (
                        domain
                        .strip()
                        .lower()
                        .removeprefix(
                            "www."
                        )
                    )

                    if not normalized:
                        continue

                    scores[
                        normalized
                    ] = (
                        scores.get(
                            normalized,
                            0,
                        )
                        + delta
                    )

            ranked = sorted(
                (
                    (
                        domain,
                        score,
                    )
                    for domain, score
                    in scores.items()
                    if score > 0
                ),
                key=lambda item: (
                    -item[1],
                    item[0],
                ),
            )

            return [
                domain
                for domain, _
                in ranked[
                    :max(
                        0,
                        limit,
                    )
                ]
            ]

        except Exception:
            logger.exception(
                "Research source preference lookup failed."
            )

            return []


research_feedback_service = ResearchFeedbackService()
