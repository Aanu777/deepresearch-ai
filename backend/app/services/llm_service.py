import logging
import re

from typing import Any

from openai import APIStatusError, OpenAI

from app.core.config import settings


logger = logging.getLogger(__name__)


class LLMProviderError(RuntimeError):

    def __init__(
        self,
        message: str,
        *,
        status_code: int = 503,
    ) -> None:

        super().__init__(
            message
        )

        self.status_code = (
            status_code
        )


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
            "Do not invent facts when information is uncertain. "
            "When providing source code, use standard Markdown fenced "
            "code blocks with the appropriate language tag. Never emit "
            "internal tool-call tokens, write(path=...), function-call "
            "syntax, or tool execution markup as part of a normal answer."
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

        history_limit = max(
            1,
            settings.OPENROUTER_MAX_HISTORY_MESSAGES,
        )

        system_messages = [
            message
            for message in messages
            if message.get("role") == "system"
        ]

        non_system_messages = [
            message
            for message in messages
            if message.get("role") != "system"
        ]

        if (
            len(non_system_messages)
            > history_limit
        ):
            non_system_messages = (
                non_system_messages[
                    -history_limit:
                ]
            )

        if has_system_message:
            prepared_messages.extend(
                system_messages[:1]
            )

        prepared_messages.extend(
            non_system_messages
        )

        selected_model = (
            model
            or settings.OPENROUTER_MODEL
        )

        def create_completion(
            model_name: str,
            request_messages: list[
                dict[str, Any]
            ] | None = None,
        ):
            messages_to_send = (
                request_messages
                if request_messages is not None
                else prepared_messages
            )

            return (
                self.client.chat.completions.create(
                    model=model_name,
                    messages=messages_to_send,  # type: ignore[arg-type]
                    temperature=temperature,
                    max_tokens=(
                        settings
                        .OPENROUTER_MAX_TOKENS
                    ),
                )
            )

        try:
            response = create_completion(
                selected_model
            )

        except APIStatusError as exc:

            logger.exception(
                "OpenRouter chat completion failed "
                "(model=%s, message_count=%s, status=%s).",
                selected_model,
                len(prepared_messages),
                exc.status_code,
            )

            fallback_model = (
                settings
                .OPENROUTER_FALLBACK_MODEL
            )

            if (
                exc.status_code == 402
                and fallback_model
                and selected_model
                != fallback_model
            ):
                logger.warning(
                    "Retrying OpenRouter request with "
                    "fallback model after credit failure "
                    "(primary_model=%s, fallback_model=%s).",
                    selected_model,
                    fallback_model,
                )

                selected_model = (
                    fallback_model
                )

                try:
                    response = (
                        create_completion(
                            selected_model
                        )
                    )

                except APIStatusError as fallback_exc:
                    self._raise_provider_error(
                        fallback_exc,
                        selected_model,
                        len(prepared_messages),
                    )

                except Exception as fallback_exc:
                    logger.exception(
                        "OpenRouter fallback request failed "
                        "(model=%s, message_count=%s).",
                        selected_model,
                        len(prepared_messages),
                    )

                    raise LLMProviderError(
                        (
                            "The AI service request failed. "
                            "Please try again."
                        ),
                        status_code=503,
                    ) from fallback_exc

            else:
                self._raise_provider_error(
                    exc,
                    selected_model,
                    len(prepared_messages),
                )

        except Exception as exc:

            logger.exception(
                "OpenRouter chat completion failed "
                "(model=%s, message_count=%s).",
                selected_model,
                len(prepared_messages),
            )

            raise LLMProviderError(
                (
                    "The AI service request failed. "
                    "Please try again."
                ),
                status_code=503,
            ) from exc

        try:
            content = (
                self
                ._extract_response_content(
                    response
                )
            )

            normalized = (
                self._normalize_content(
                    content
                )
            )

            if (
                not normalized
                and self._is_provider_safety_artifact(
                    content
                )
            ):
                logger.warning(
                    "OpenRouter returned provider safety metadata "
                    "instead of an assistant answer; retrying once "
                    "(model=%s).",
                    selected_model,
                )

                retry_messages = list(
                    prepared_messages
                )

                retry_instruction = {
                    "role": "system",
                    "content": (
                        "Return only the assistant answer intended "
                        "for the user. Do not output provider safety "
                        "labels, moderation metadata, classifier "
                        "results, or internal routing information."
                    ),
                }

                insert_at = (
                    1
                    if (
                        retry_messages
                        and retry_messages[0].get(
                            "role"
                        )
                        == "system"
                    )
                    else 0
                )

                retry_messages.insert(
                    insert_at,
                    retry_instruction,
                )

                try:
                    retry_response = (
                        create_completion(
                            selected_model,
                            retry_messages,
                        )
                    )

                except APIStatusError as retry_exc:
                    self._raise_provider_error(
                        retry_exc,
                        selected_model,
                        len(retry_messages),
                    )

                except Exception as retry_exc:
                    logger.exception(
                        "OpenRouter safety-artifact retry failed "
                        "(model=%s, message_count=%s).",
                        selected_model,
                        len(retry_messages),
                    )

                    raise LLMProviderError(
                        (
                            "The AI service request failed. "
                            "Please try again."
                        ),
                        status_code=503,
                    ) from retry_exc

                retry_content = (
                    self
                    ._extract_response_content(
                        retry_response
                    )
                )

                normalized = (
                    self._normalize_content(
                        retry_content
                    )
                )

                if (
                    not normalized
                    and self._is_provider_safety_artifact(
                        retry_content
                    )
                ):
                    raise LLMProviderError(
                        (
                            "The AI provider returned an unusable "
                            "response. Please try again."
                        ),
                        status_code=502,
                    )

            if not normalized:
                raise LLMProviderError(
                    (
                        "The AI provider returned an empty "
                        "response. Please try again."
                    ),
                    status_code=502,
                )

            return normalized

        except LLMProviderError:
            raise

        except Exception as exc:
            logger.exception(
                "OpenRouter response processing failed "
                "(model=%s, message_count=%s).",
                selected_model,
                len(prepared_messages),
            )

            raise LLMProviderError(
                (
                    "The AI provider returned an unusable "
                    "response. Please try again."
                ),
                status_code=502,
            ) from exc

    @staticmethod
    def _extract_response_content(
        response: Any,
    ) -> Any:

        choices = getattr(
            response,
            "choices",
            None,
        )

        if not choices:
            raise LLMProviderError(
                (
                    "The AI provider returned no response "
                    "choices. Please try again."
                ),
                status_code=502,
            )

        message = getattr(
            choices[0],
            "message",
            None,
        )

        if message is None:
            raise LLMProviderError(
                (
                    "The AI provider returned an invalid "
                    "response. Please try again."
                ),
                status_code=502,
            )

        return getattr(
            message,
            "content",
            None,
        )


    @staticmethod
    def _raise_provider_error(
        exc: APIStatusError,
        model_name: str,
        message_count: int,
    ) -> None:

        logger.exception(
            "OpenRouter chat completion failed "
            "(model=%s, message_count=%s, status=%s).",
            model_name,
            message_count,
            exc.status_code,
        )

        if exc.status_code == 402:
            raise LLMProviderError(
                (
                    "The AI service is temporarily "
                    "unavailable because no provider "
                    "capacity is available for this request."
                ),
                status_code=503,
            ) from exc

        if exc.status_code == 429:
            raise LLMProviderError(
                (
                    "The AI service is temporarily "
                    "rate-limited. Please try again."
                ),
                status_code=429,
            ) from exc

        if exc.status_code in {
            401,
            403,
        }:
            raise LLMProviderError(
                (
                    "The AI service is temporarily "
                    "unavailable because provider "
                    "authentication failed."
                ),
                status_code=503,
            ) from exc

        if exc.status_code >= 500:
            raise LLMProviderError(
                (
                    "The AI provider is temporarily "
                    "unavailable. Please try again."
                ),
                status_code=503,
            ) from exc

        raise LLMProviderError(
            (
                "The AI provider rejected "
                "the request."
            ),
            status_code=502,
        ) from exc

    _PROVIDER_SAFETY_LINE = re.compile(
        (
            r"(?im)^\s*(?:"
            r"User Safety:\s*(?:safe|unsafe)"
            r"(?:\s+Response Safety:\s*(?:safe|unsafe))?"
            r"|"
            r"Response Safety:\s*(?:safe|unsafe)"
            r"(?:\s+User Safety:\s*(?:safe|unsafe))?"
            r")\s*$"
        )
    )

    @classmethod
    def _strip_provider_safety_metadata(
        cls,
        text: str,
    ) -> str:

        return (
            cls
            ._PROVIDER_SAFETY_LINE
            .sub(
                "",
                text,
            )
            .strip()
        )

    @classmethod
    def _is_provider_safety_artifact(
        cls,
        content: Any,
    ) -> bool:

        if content is None:
            return False

        if isinstance(
            content,
            str,
        ):
            text = content

        else:
            text = str(
                content
            )

        has_safety_label = (
            "User Safety:"
            in text
            or "Response Safety:"
            in text
        )

        if not has_safety_label:
            return False

        return not (
            cls
            ._strip_provider_safety_metadata(
                text
            )
        )

    @staticmethod
    def _normalize_language_from_path(
        path: str,
    ) -> str:

        suffix = (
            path
            .rsplit(
                ".",
                1,
            )[-1]
            .lower()
            if "." in path
            else ""
        )

        return {
            "py": "python",
            "js": "javascript",
            "jsx": "jsx",
            "ts": "typescript",
            "tsx": "tsx",
            "html": "html",
            "css": "css",
            "json": "json",
            "sql": "sql",
            "sh": "bash",
            "bash": "bash",
            "ps1": "powershell",
            "md": "markdown",
            "yml": "yaml",
            "yaml": "yaml",
            "java": "java",
            "c": "c",
            "cpp": "cpp",
            "cs": "csharp",
            "rs": "rust",
            "go": "go",
        }.get(
            suffix,
            ""
        )

    @classmethod
    def _convert_leaked_tool_markup(
        cls,
        text: str,
    ) -> str:

        if (
            "<|tool_call_start|>"
            not in text
            and "write(path="
            not in text
        ):
            return text

        header = re.search(
            (
                r"(?:<\|tool_call_start\|>\s*)?"
                r"\[?write\("
                r"path=(?P<quote>['\"])"
                r"(?P<path>.+?)"
                r"(?P=quote)\s*,\s*"
                r"content=(?P<cquote>['\"])"
            ),
            text,
            flags=re.DOTALL,
        )

        if header is None:
            return (
                text
                .replace(
                    "<|tool_call_start|>",
                    ""
                )
                .replace(
                    "<|tool_call_end|>",
                    ""
                )
                .strip()
            )

        before = (
            text[
                :header.start()
            ]
            .strip()
        )

        path = (
            header
            .group(
                "path"
            )
            .strip()
        )

        content_quote = (
            header
            .group(
                "cquote"
            )
        )

        tool_end_token = (
            "<|tool_call_end|>"
        )

        tool_end = text.find(
            tool_end_token,
            header.end(),
        )

        if tool_end >= 0:
            raw_content = text[
                header.end():
                tool_end
            ]

            raw_content = re.sub(
                (
                    re.escape(
                        content_quote
                    )
                    + r"\s*\)\s*\]?\s*$"
                ),
                "",
                raw_content,
                flags=re.DOTALL,
            )

            after = (
                text[
                    tool_end
                    + len(
                        tool_end_token
                    ):
                ]
                .strip()
            )

        else:
            raw_content = text[
                header.end():
            ]

            after = ""

        decoded_content = (
            raw_content
            .replace(
                "\\r\\n",
                "\n"
            )
            .replace(
                "\\n",
                "\n"
            )
            .replace(
                "\\t",
                "\t"
            )
            .replace(
                "\\\"",
                "\""
            )
            .replace(
                "\\'",
                "'"
            )
        )

        language = (
            cls
            ._normalize_language_from_path(
                path
            )
        )

        code_block = (
            f"**{path}**\n\n"
            f"```{language}\n"
            f"{decoded_content.rstrip()}\n"
            f"```"
        )

        return (
            "\n\n".join(
                part
                for part
                in [
                    before,
                    code_block,
                    after,
                ]
                if part
            )
        )

    # ========================================================
    # NORMALIZE OUTPUT
    # ========================================================

    @classmethod
    def _normalize_content(
        cls,
        content: Any,
    ) -> str:

        if content is None:
            return ""

        if isinstance(
            content,
            str,
        ):
            return (
                cls
                ._convert_leaked_tool_markup(
                    cls
                    ._strip_provider_safety_metadata(
                        content
                    )
                )
            )

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
                cls
                ._convert_leaked_tool_markup(
                    cls
                    ._strip_provider_safety_metadata(
                        "\n".join(
                            parts
                        )
                    )
                )
            )

        return (
            cls
            ._convert_leaked_tool_markup(
                cls
                ._strip_provider_safety_metadata(
                    str(
                        content
                    )
                )
            )
        )


llm_service = LLMService()