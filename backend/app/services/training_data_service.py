from __future__ import annotations

import hashlib
import json
import re

from datetime import datetime, timezone
from typing import Any

import httpx

from app.core.config import settings


class TrainingDataService:
    """
    User-scoped, opt-in training-example pipeline.

    Examples are captured only from explicit user corrections.
    RLS remains the final ownership boundary because every request
    uses the authenticated user's Supabase access token.
    """

    _EMAIL = re.compile(
        r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b",
        re.IGNORECASE,
    )

    _PHONE = re.compile(
        r"(?<!\d)(?:\+?\d[\d\s().-]{7,}\d)(?!\d)"
    )

    _CNIC = re.compile(
        r"\b\d{5}-\d{7}-\d\b"
    )

    _CARD = re.compile(
        r"(?<!\d)(?:\d[ -]*?){13,19}(?!\d)"
    )

    _BEARER = re.compile(
        r"(?i)\bBearer\s+[A-Za-z0-9._~+/=-]{12,}"
    )

    _SECRET_ASSIGNMENT = re.compile(
        (
            r"(?i)\b("
            r"api[_ -]?key|"
            r"access[_ -]?token|"
            r"refresh[_ -]?token|"
            r"password|"
            r"passwd|"
            r"secret"
            r")\b"
            r"(\s*[:=]\s*)"
            r"(['\"]?)"
            r"([^\s'\"]{4,})"
            r"\3"
        )
    )

    _PRIVATE_KEY = re.compile(
        (
            r"-----BEGIN [A-Z ]*PRIVATE KEY-----"
            r".*?"
            r"-----END [A-Z ]*PRIVATE KEY-----"
        ),
        re.DOTALL,
    )

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

    @staticmethod
    def _normalize(
        text: str,
    ) -> str:

        return re.sub(
            r"\s+",
            " ",
            text,
        ).strip()

    def redact(
        self,
        text: str,
    ) -> tuple[
        str,
        int,
    ]:

        value = text
        count = 0

        replacements = (
            (
                self._PRIVATE_KEY,
                "[REDACTED_PRIVATE_KEY]",
            ),
            (
                self._BEARER,
                "Bearer [REDACTED_TOKEN]",
            ),
            (
                self._EMAIL,
                "[REDACTED_EMAIL]",
            ),
            (
                self._CNIC,
                "[REDACTED_CNIC]",
            ),
            (
                self._CARD,
                "[REDACTED_PAYMENT_NUMBER]",
            ),
            (
                self._PHONE,
                "[REDACTED_PHONE]",
            ),
        )

        for pattern, replacement in replacements:
            value, replaced = pattern.subn(
                replacement,
                value,
            )

            count += replaced

        def redact_secret(
            match: re.Match[str],
        ) -> str:

            nonlocal count
            count += 1

            return (
                match.group(1)
                + match.group(2)
                + "[REDACTED_SECRET]"
            )

        value = (
            self._SECRET_ASSIGNMENT
            .sub(
                redact_secret,
                value,
            )
        )

        return (
            value.strip(),
            count,
        )

    def prepare_example(
        self,
        *,
        source_type: str,
        source_id: str,
        prompt: str,
        rejected_response: str,
        target_response: str,
        feedback_reason: str | None,
        metadata: dict[
            str,
            Any,
        ] | None = None,
    ) -> dict[str, Any] | None:

        raw_prompt = (
            self._normalize(
                prompt
            )
        )

        raw_rejected = (
            rejected_response
            .strip()
        )

        raw_target = (
            target_response
            .strip()
        )

        if (
            len(raw_prompt) < 4
            or len(raw_target) < 4
        ):
            return None

        if (
            len(raw_prompt) > 12000
            or len(raw_rejected) > 12000
            or len(raw_target) > 8000
        ):
            return None

        if (
            self._normalize(
                raw_rejected
            ).casefold()
            == self._normalize(
                raw_target
            ).casefold()
        ):
            return None

        prompt_clean, prompt_redactions = (
            self.redact(
                raw_prompt
            )
        )

        rejected_clean, rejected_redactions = (
            self.redact(
                raw_rejected
            )
        )

        target_clean, target_redactions = (
            self.redact(
                raw_target
            )
        )

        total_redactions = (
            prompt_redactions
            + rejected_redactions
            + target_redactions
        )

        content_hash = (
            hashlib
            .sha256(
                (
                    source_type
                    + "\n"
                    + prompt_clean
                    + "\n"
                    + target_clean
                ).encode(
                    "utf-8"
                )
            )
            .hexdigest()
        )

        quality_score = max(
            0.75,
            1.0
            - min(
                0.20,
                (
                    total_redactions
                    * 0.025
                ),
            ),
        )

        return {
            "source_type":
                source_type,

            "source_id":
                source_id,

            "prompt":
                prompt_clean,

            "rejected_response":
                rejected_clean,

            "target_response":
                target_clean,

            "feedback_reason":
                feedback_reason,

            "content_hash":
                content_hash,

            "redaction_count":
                total_redactions,

            "quality_score":
                round(
                    quality_score,
                    3,
                ),

            "metadata":
                metadata or {},
        }

    async def capture(
        self,
        *,
        user_id: str,
        access_token: str,
        source_type: str,
        source_id: str,
        prompt: str,
        rejected_response: str,
        target_response: str,
        feedback_reason: str | None,
        metadata: dict[
            str,
            Any,
        ] | None = None,
    ) -> bool:

        example = (
            self.prepare_example(
                source_type=(
                    source_type
                ),
                source_id=(
                    source_id
                ),
                prompt=prompt,
                rejected_response=(
                    rejected_response
                ),
                target_response=(
                    target_response
                ),
                feedback_reason=(
                    feedback_reason
                ),
                metadata=metadata,
            )
        )

        if example is None:
            return False

        payload = {
            "user_id":
                user_id,

            **example,

            "updated_at":
                datetime.now(
                    timezone.utc
                ).isoformat(),
        }

        async with httpx.AsyncClient(
            timeout=6.0
        ) as client:

            response = await client.post(
                (
                    self._rest_base
                    + "/training_examples"
                    + "?on_conflict="
                    + "user_id,content_hash"
                ),
                headers=self._headers(
                    access_token,
                    prefer=(
                        "resolution=merge-duplicates,"
                        "return=minimal"
                    ),
                ),
                json=payload,
            )

        response.raise_for_status()

        return True

    async def list_examples(
        self,
        *,
        access_token: str,
    ) -> list[
        dict[str, Any]
    ]:

        async with httpx.AsyncClient(
            timeout=8.0
        ) as client:

            response = await client.get(
                (
                    self._rest_base
                    + "/training_examples"
                    + "?select="
                    + "id,source_type,source_id,prompt,"
                    + "rejected_response,target_response,"
                    + "feedback_reason,content_hash,"
                    + "redaction_count,quality_score,"
                    + "metadata,created_at,updated_at"
                    + "&order=created_at.asc"
                ),
                headers=self._headers(
                    access_token
                ),
            )

        response.raise_for_status()

        payload = response.json()

        if not isinstance(
            payload,
            list,
        ):
            return []

        return [
            row
            for row in payload
            if isinstance(
                row,
                dict,
            )
        ]

    async def remove_source_examples(
        self,
        *,
        access_token: str,
        source_type: str,
        source_id: str,
    ) -> None:

        async with httpx.AsyncClient(
            timeout=6.0
        ) as client:

            response = await client.delete(
                (
                    self._rest_base
                    + "/training_examples"
                    + "?source_type=eq."
                    + source_type
                    + "&source_id=eq."
                    + source_id
                ),
                headers=self._headers(
                    access_token,
                    prefer="return=minimal",
                ),
            )

        response.raise_for_status()

    async def delete_example(
        self,
        *,
        access_token: str,
        example_id: str,
    ) -> None:

        async with httpx.AsyncClient(
            timeout=6.0
        ) as client:

            response = await client.delete(
                (
                    self._rest_base
                    + "/training_examples"
                    + "?id=eq."
                    + example_id
                ),
                headers=self._headers(
                    access_token,
                    prefer="return=minimal",
                ),
            )

        response.raise_for_status()

    async def clear_examples(
        self,
        *,
        access_token: str,
    ) -> None:

        async with httpx.AsyncClient(
            timeout=8.0
        ) as client:

            response = await client.delete(
                (
                    self._rest_base
                    + "/training_examples"
                    + "?id=not.is.null"
                ),
                headers=self._headers(
                    access_token,
                    prefer="return=minimal",
                ),
            )

        response.raise_for_status()

    @staticmethod
    def split_for_hash(
        content_hash: str,
    ) -> str:

        try:
            bucket = (
                int(
                    content_hash[
                        :8
                    ],
                    16,
                )
                % 10
            )

        except Exception:
            bucket = 0

        return (
            "validation"
            if bucket < 2
            else "train"
        )

    def export_dataset(
        self,
        examples: list[
            dict[str, Any]
        ],
        *,
        dataset_format: str,
    ) -> dict[str, Any]:

        train: list[
            str
        ] = []

        validation: list[
            str
        ] = []

        redactions = 0

        for row in examples:

            prompt = str(
                row.get(
                    "prompt",
                    "",
                )
            )

            target = str(
                row.get(
                    "target_response",
                    "",
                )
            )

            rejected = str(
                row.get(
                    "rejected_response",
                    "",
                )
                or ""
            )

            if not (
                prompt.strip()
                and target.strip()
            ):
                continue

            metadata = {
                "source_type":
                    row.get(
                        "source_type"
                    ),

                "feedback_reason":
                    row.get(
                        "feedback_reason"
                    ),

                "quality_score":
                    row.get(
                        "quality_score"
                    ),

                "content_hash":
                    row.get(
                        "content_hash"
                    ),
            }

            if dataset_format == "sft":
                record = {
                    "messages": [
                        {
                            "role":
                                "user",

                            "content":
                                prompt,
                        },
                        {
                            "role":
                                "assistant",

                            "content":
                                target,
                        },
                    ],

                    "metadata":
                        metadata,
                }

            elif dataset_format == "preference":
                if not rejected.strip():
                    continue

                record = {
                    "prompt":
                        prompt,

                    "chosen":
                        target,

                    "rejected":
                        rejected,

                    "metadata":
                        metadata,
                }

            else:
                raise ValueError(
                    (
                        "Unsupported dataset format: "
                        + dataset_format
                    )
                )

            line = json.dumps(
                record,
                ensure_ascii=False,
            )

            split = self.split_for_hash(
                str(
                    row.get(
                        "content_hash",
                        "",
                    )
                )
            )

            if split == "validation":
                validation.append(
                    line
                )

            else:
                train.append(
                    line
                )

            redactions += int(
                row.get(
                    "redaction_count",
                    0,
                )
                or 0
            )

        # Keep tiny datasets trainable while preserving deterministic
        # validation behavior as soon as there is enough data.
        if (
            not train
            and validation
        ):
            train.append(
                validation.pop(
                    0
                )
            )

        manifest = {
            "schema_version":
                1,

            "format":
                dataset_format,

            "total_examples":
                (
                    len(
                        train
                    )
                    + len(
                        validation
                    )
                ),

            "train_examples":
                len(
                    train
                ),

            "validation_examples":
                len(
                    validation
                ),

            "redactions":
                redactions,

            "generated_at":
                datetime.now(
                    timezone.utc
                ).isoformat(),
        }

        return {
            "manifest":
                manifest,

            "train_jsonl":
                (
                    "\n".join(
                        train
                    )
                    + (
                        "\n"
                        if train
                        else ""
                    )
                ),

            "validation_jsonl":
                (
                    "\n".join(
                        validation
                    )
                    + (
                        "\n"
                        if validation
                        else ""
                    )
                ),
        }


training_data_service = TrainingDataService()
