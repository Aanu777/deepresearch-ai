from __future__ import annotations

import base64
import binascii

from pathlib import Path
from urllib.parse import quote

import httpx

from app.core.config import (
    settings,
)


# ============================================================
# PROVIDER URLS
# ============================================================

DEEPGRAM_LISTEN_URL = (
    "https://api.deepgram.com/v1/listen"
)

POLLINATIONS_BASE_URL = (
    "https://gen.pollinations.ai"
)


# ============================================================
# MEDIA SERVICE
# ============================================================


class MediaService:

    # ========================================================
    # SPEECH TO TEXT — DEEPGRAM
    # ========================================================

    async def transcribe_audio(
        self,
        audio_bytes: bytes,
        *,
        filename: str,
        content_type: str | None,
    ) -> str:

        if not audio_bytes:

            raise ValueError(
                "The audio recording is empty."
            )

        audio_content_type = (
            self._audio_content_type(
                filename=filename,
                content_type=content_type,
            )
        )

        headers = {
            "Authorization": (
                "Token "
                f"{settings.DEEPGRAM_API_KEY}"
            ),

            "Content-Type": (
                audio_content_type
            ),
        }

        params = {
            "model": (
                settings
                .DEEPGRAM_STT_MODEL
            ),

            "smart_format": (
                "true"
            ),

            "punctuate": (
                "true"
            ),
        }

        try:

            async with httpx.AsyncClient(
                timeout=httpx.Timeout(
                    120.0,
                    connect=15.0,
                )
            ) as client:

                response = (
                    await client.post(
                        DEEPGRAM_LISTEN_URL,
                        headers=headers,
                        params=params,
                        content=audio_bytes,
                    )
                )

        except httpx.TimeoutException as exc:

            raise RuntimeError(
                "Deepgram transcription timed out."
            ) from exc

        except httpx.HTTPError as exc:

            raise RuntimeError(
                "Could not connect to Deepgram."
            ) from exc

        if not response.is_success:

            raise RuntimeError(
                self._provider_error(
                    response=response,
                    provider="Deepgram",
                    fallback=(
                        "Audio transcription failed."
                    ),
                )
            )

        try:

            payload = (
                response.json()
            )

        except ValueError as exc:

            raise RuntimeError(
                "Deepgram returned an "
                "invalid response."
            ) from exc

        transcript = (
            self._extract_deepgram_transcript(
                payload
            )
        )

        if not transcript:

            raise RuntimeError(
                "No speech could be detected "
                "in the recording."
            )

        return transcript

    # ========================================================
    # TEXT → IMAGE — POLLINATIONS
    # ========================================================

    async def generate_image(
        self,
        prompt: str,
    ) -> dict:

        prompt = (
            prompt.strip()
        )

        if not prompt:

            raise ValueError(
                "Image prompt cannot be empty."
            )

        encoded_prompt = (
            quote(
                prompt,
                safe="",
            )
        )

        url = (
            f"{POLLINATIONS_BASE_URL}"
            f"/image/{encoded_prompt}"
        )

        params = {
            "model": (
                settings
                .POLLINATIONS_IMAGE_MODEL
            ),
        }

        try:

            async with httpx.AsyncClient(
                timeout=httpx.Timeout(
                    180.0,
                    connect=20.0,
                ),
                follow_redirects=True,
            ) as client:

                response = (
                    await client.get(
                        url,
                        headers=(
                            self
                            ._pollinations_headers()
                        ),
                        params=params,
                    )
                )

        except httpx.TimeoutException as exc:

            raise RuntimeError(
                "Pollinations image generation "
                "timed out."
            ) from exc

        except httpx.HTTPError as exc:

            raise RuntimeError(
                "Could not connect to "
                "Pollinations."
            ) from exc

        if not response.is_success:

            raise RuntimeError(
                self._provider_error(
                    response=response,
                    provider="Pollinations",
                    fallback=(
                        "Image generation failed."
                    ),
                )
            )

        return (
            self._binary_image_response(
                response=response,
                model=(
                    settings
                    .POLLINATIONS_IMAGE_MODEL
                ),
                operation="generation",
            )
        )

    # ========================================================
    # IMAGE → IMAGE — POLLINATIONS
    # ========================================================

    async def edit_image(
        self,
        *,
        prompt: str,
        source_image: str,
    ) -> dict:

        prompt = (
            prompt.strip()
        )

        source_image = (
            source_image.strip()
        )

        if not prompt:

            raise ValueError(
                "Image edit prompt cannot be empty."
            )

        if not source_image:

            raise ValueError(
                "A source image is required."
            )

        # ----------------------------------------------------
        # Convert our existing data URL back into bytes.
        #
        # Example input:
        #
        # data:image/jpeg;base64,/9j/4AAQ...
        # ----------------------------------------------------

        (
            image_bytes,
            media_type,
            extension,
        ) = (
            self._decode_image_source(
                source_image
            )
        )

        filename = (
            f"deepresearch-source"
            f".{extension}"
        )

        files = {
            "image": (
                filename,
                image_bytes,
                media_type,
            )
        }

        form_data = {
            "prompt": (
                prompt
            ),

            "model": (
                settings
                .POLLINATIONS_IMAGE_EDIT_MODEL
            ),

            "size": (
                "1024x1024"
            ),

            "response_format": (
                "b64_json"
            ),
        }

        try:

            async with httpx.AsyncClient(
                timeout=httpx.Timeout(
                    240.0,
                    connect=20.0,
                ),
                follow_redirects=True,
            ) as client:

                response = (
                    await client.post(
                        (
                            f"{POLLINATIONS_BASE_URL}"
                            "/v1/images/edits"
                        ),
                        headers=(
                            self
                            ._pollinations_headers()
                        ),
                        data=form_data,
                        files=files,
                    )
                )

        except httpx.TimeoutException as exc:

            raise RuntimeError(
                "Pollinations image editing "
                "timed out."
            ) from exc

        except httpx.HTTPError as exc:

            raise RuntimeError(
                "Could not connect to "
                "Pollinations image editing."
            ) from exc

        if not response.is_success:

            raise RuntimeError(
                self._provider_error(
                    response=response,
                    provider="Pollinations",
                    fallback=(
                        "Image editing failed."
                    ),
                )
            )

        try:

            payload = (
                response.json()
            )

        except ValueError as exc:

            raise RuntimeError(
                "Pollinations returned an "
                "invalid image-edit response."
            ) from exc

        return (
            self._parse_openai_image_response(
                payload=payload,
                fallback_model=(
                    settings
                    .POLLINATIONS_IMAGE_EDIT_MODEL
                ),
                operation="edit",
            )
        )

    # ========================================================
    # DECODE SOURCE IMAGE
    # ========================================================

    @staticmethod
    def _decode_image_source(
        source: str,
    ) -> tuple[
        bytes,
        str,
        str,
    ]:

        # ----------------------------------------------------
        # Current Conversation V2 uses data URLs.
        # ----------------------------------------------------

        if not source.startswith(
            "data:image/"
        ):

            raise ValueError(
                "The current image cannot be "
                "edited because its source format "
                "is unsupported."
            )

        try:

            metadata, encoded = (
                source.split(
                    ",",
                    1,
                )
            )

        except ValueError as exc:

            raise ValueError(
                "The source image data is invalid."
            ) from exc

        if (
            ";base64"
            not in metadata
        ):

            raise ValueError(
                "The source image is not "
                "base64 encoded."
            )

        media_type = (
            metadata
            .removeprefix(
                "data:"
            )
            .split(
                ";",
                1,
            )[0]
        )

        supported_types = {
            "image/jpeg": (
                "jpg"
            ),

            "image/jpg": (
                "jpg"
            ),

            "image/png": (
                "png"
            ),

            "image/webp": (
                "webp"
            ),
        }

        extension = (
            supported_types.get(
                media_type
            )
        )

        if not extension:

            raise ValueError(
                "The source image format "
                "cannot be edited."
            )

        try:

            image_bytes = (
                base64.b64decode(
                    encoded,
                    validate=True,
                )
            )

        except (
            binascii.Error,
            ValueError,
        ) as exc:

            raise ValueError(
                "The source image data "
                "could not be decoded."
            ) from exc

        if not image_bytes:

            raise ValueError(
                "The source image is empty."
            )

        return (
            image_bytes,
            media_type,
            extension,
        )

    # ========================================================
    # OPENAI IMAGE RESPONSE
    # ========================================================

    @staticmethod
    def _parse_openai_image_response(
        *,
        payload: dict,
        fallback_model: str,
        operation: str,
    ) -> dict:

        data = (
            payload.get(
                "data"
            )
            or []
        )

        if not data:

            raise RuntimeError(
                "Pollinations returned "
                "no image."
            )

        first = (
            data[0]
        )

        if not isinstance(
            first,
            dict,
        ):

            raise RuntimeError(
                "Pollinations returned "
                "invalid image data."
            )

        image_base64 = (
            first.get(
                "b64_json"
            )
        )

        if (
            isinstance(
                image_base64,
                str,
            )
            and image_base64
        ):

            media_type = (
                first.get(
                    "media_type"
                )
                or "image/png"
            )

            image_url = (
                f"data:{media_type};"
                f"base64,{image_base64}"
            )

            return {
                "image_url": (
                    image_url
                ),

                "media_type": (
                    media_type
                ),

                "model": (
                    payload.get(
                        "model"
                    )
                    or fallback_model
                ),

                "provider": (
                    "pollinations"
                ),

                "operation": (
                    operation
                ),
            }

        remote_url = (
            first.get(
                "url"
            )
        )

        if (
            isinstance(
                remote_url,
                str,
            )
            and remote_url
        ):

            return {
                "image_url": (
                    remote_url
                ),

                "media_type": (
                    "image/png"
                ),

                "model": (
                    payload.get(
                        "model"
                    )
                    or fallback_model
                ),

                "provider": (
                    "pollinations"
                ),

                "operation": (
                    operation
                ),
            }

        raise RuntimeError(
            "Pollinations returned no "
            "usable image."
        )

    # ========================================================
    # POLLINATIONS AUTH
    # ========================================================

    @staticmethod
    def _pollinations_headers():
        return {
            "Authorization": (
                "Bearer "
                f"{settings.POLLINATIONS_API_KEY}"
            )
        }

    # ========================================================
    # BINARY GENERATION RESPONSE
    # ========================================================

    @staticmethod
    def _binary_image_response(
        *,
        response: httpx.Response,
        model: str,
        operation: str,
    ) -> dict:

        image_bytes = (
            response.content
        )

        if not image_bytes:

            raise RuntimeError(
                "Pollinations returned "
                "an empty image."
            )

        content_type = (
            response.headers
            .get(
                "content-type",
                "image/jpeg",
            )
            .split(";")[0]
            .strip()
        )

        if not (
            content_type.startswith(
                "image/"
            )
        ):

            raise RuntimeError(
                "Pollinations returned an "
                "unexpected response."
            )

        encoded_image = (
            base64.b64encode(
                image_bytes
            ).decode(
                "ascii"
            )
        )

        return {
            "image_url": (
                f"data:{content_type};"
                f"base64,{encoded_image}"
            ),

            "media_type": (
                content_type
            ),

            "model": (
                model
            ),

            "provider": (
                "pollinations"
            ),

            "operation": (
                operation
            ),
        }

    # ========================================================
    # DEEPGRAM RESPONSE
    # ========================================================

    @staticmethod
    def _extract_deepgram_transcript(
        payload: dict,
    ) -> str:

        try:

            channels = (
                payload
                .get(
                    "results",
                    {}
                )
                .get(
                    "channels",
                    []
                )
            )

            if not channels:

                return ""

            alternatives = (
                channels[0]
                .get(
                    "alternatives",
                    []
                )
            )

            if not alternatives:

                return ""

            transcript = (
                alternatives[0]
                .get(
                    "transcript",
                    ""
                )
            )

            if not isinstance(
                transcript,
                str,
            ):

                return ""

            return (
                transcript.strip()
            )

        except (
            AttributeError,
            IndexError,
            TypeError,
        ):

            return ""

    # ========================================================
    # AUDIO MIME TYPE
    # ========================================================

    @staticmethod
    def _audio_content_type(
        *,
        filename: str,
        content_type: str | None,
    ) -> str:

        if (
            content_type
            and content_type.startswith(
                "audio/"
            )
        ):

            return (
                content_type
            )

        extension = (
            Path(
                filename
            )
            .suffix
            .lower()
        )

        mime_types = {
            ".webm": (
                "audio/webm"
            ),

            ".ogg": (
                "audio/ogg"
            ),

            ".wav": (
                "audio/wav"
            ),

            ".mp3": (
                "audio/mpeg"
            ),

            ".m4a": (
                "audio/mp4"
            ),

            ".mp4": (
                "audio/mp4"
            ),

            ".aac": (
                "audio/aac"
            ),

            ".flac": (
                "audio/flac"
            ),
        }

        return (
            mime_types.get(
                extension,
                "application/octet-stream",
            )
        )

    # ========================================================
    # PROVIDER ERROR
    # ========================================================

    @staticmethod
    def _provider_error(
        *,
        response: httpx.Response,
        provider: str,
        fallback: str,
    ) -> str:

        message: str | None = (
            None
        )

        try:

            payload = (
                response.json()
            )

            if isinstance(
                payload,
                dict,
            ):

                detail = (
                    payload.get(
                        "detail"
                    )
                )

                error = (
                    payload.get(
                        "error"
                    )
                )

                direct_message = (
                    payload.get(
                        "message"
                    )
                )

                if isinstance(
                    detail,
                    str,
                ):

                    message = (
                        detail
                    )

                elif isinstance(
                    direct_message,
                    str,
                ):

                    message = (
                        direct_message
                    )

                elif isinstance(
                    error,
                    str,
                ):

                    message = (
                        error
                    )

                elif isinstance(
                    error,
                    dict,
                ):

                    nested = (
                        error.get(
                            "message"
                        )
                        or error.get(
                            "detail"
                        )
                    )

                    if isinstance(
                        nested,
                        str,
                    ):

                        message = (
                            nested
                        )

        except ValueError:

            pass

        if not message:

            try:

                text = (
                    response.text
                    .strip()
                )

            except Exception:

                text = ""

            if text:

                message = (
                    text[:500]
                )

        if not message:

            message = (
                fallback
            )

        return (
            f"{provider}: "
            f"{message} "
            f"(HTTP "
            f"{response.status_code})"
        )


media_service = MediaService()