from typing import Any

from openai import OpenAI

from app.core.config import settings


class LLMService:

    def __init__(self):

        self.client = OpenAI(
            api_key=settings.OPENROUTER_API_KEY,
            base_url="https://openrouter.ai/api/v1",
        )

        self.default_system_prompt = (
            "You are DeepResearch AI, a capable research "
            "and general-purpose assistant. "
            "Be accurate, clear, useful, and well structured. "
            "Do not invent facts when information is uncertain."
        )

    # ========================================================
    # NORMAL PROMPT
    # ========================================================

    def generate(
        self,
        prompt: str,
    ) -> str:

        return self.generate_chat(
            [
                {
                    "role": "user",
                    "content": prompt,
                }
            ]
        )

    # ========================================================
    # CONVERSATION / MULTIMODAL CHAT
    # ========================================================

    def generate_chat(
        self,
        messages: list[dict[str, Any]],
        model: str | None = None,
        temperature: float = 0.2,
    ) -> str:

        prepared_messages: list[
            dict[str, Any]
        ] = []

        # ----------------------------------------------------
        # Add a system message unless the caller already
        # supplied one.
        # ----------------------------------------------------

        has_system_message = any(
            message.get("role") == "system"
            for message in messages
        )

        if not has_system_message:

            prepared_messages.append(
                {
                    "role": "system",
                    "content": self.default_system_prompt,
                }
            )

        prepared_messages.extend(
            messages
        )

        response = (
            self.client.chat.completions.create(
                model=(
                    model
                    or settings.OPENROUTER_MODEL
                ),
                messages=prepared_messages,  # type: ignore[arg-type]
                temperature=temperature,
            )
        )

        content = (
            response
            .choices[0]
            .message
            .content
        )

        return self._normalize_content(
            content
        )

    # ========================================================
    # NORMALIZE OUTPUT
    # ========================================================

    @staticmethod
    def _normalize_content(
        content: Any,
    ) -> str:

        if content is None:
            return ""

        if isinstance(
            content,
            str,
        ):
            return content.strip()

        # Some multimodal providers may return
        # structured response parts.
        if isinstance(
            content,
            list,
        ):

            parts: list[str] = []

            for item in content:

                if isinstance(
                    item,
                    str,
                ):
                    parts.append(
                        item
                    )
                    continue

                if isinstance(
                    item,
                    dict,
                ):

                    text = (
                        item.get("text")
                        or item.get("content")
                    )

                    if isinstance(
                        text,
                        str,
                    ):
                        parts.append(
                            text
                        )

            return (
                "\n".join(parts)
                .strip()
            )

        return str(
            content
        ).strip()


llm_service = LLMService()