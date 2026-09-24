import base64
import uuid

from datetime import datetime
from io import BytesIO
from pathlib import Path
from typing import Any

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from pydantic import BaseModel

from app.core.auth import (
    AuthenticatedUser,
    get_current_user,
)

from app.core.config import settings

from app.models.chat import Chat
from app.models.message import ChatMessage

from app.services.chat_store import (
    chat_store,
)

from app.services.job_store import (
    job_store,
)

from app.services.llm_service import (
    LLMProviderError,
    llm_service,
)

from app.services.media_service import (
    media_service,
)

from app.services.message_store import (
    message_store,
)


router = APIRouter()


# ============================================================
# LIMITS
# ============================================================

MAX_ATTACHMENTS = 4

MAX_ATTACHMENT_BYTES = (
    15
    * 1024
    * 1024
)

MAX_AUDIO_BYTES = (
    30
    * 1024
    * 1024
)

MAX_EXTRACTED_TEXT = 40_000


# ============================================================
# REQUEST MODELS
# ============================================================


class SendMessageRequest(
    BaseModel
):
    content: str


class EditMessageRequest(
    BaseModel
):
    content: str


class GenerateImageRequest(
    BaseModel
):
    chat_id: str

    prompt: str

    source_message_id: (
        str | None
    ) = None


# ============================================================
# CHAT HELPERS
# ============================================================


def require_chat(
    chat_id: str,
    user_id: str,
) -> Chat:

    chat = (
        chat_store
        .get_for_user(
            chat_id,
            user_id,
        )
    )

    if chat is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "Chat not found."
            ),
        )

    return chat


def generate_chat_title(
    content: str,
) -> str:

    cleaned = (
        content.strip()
    )

    if not cleaned:

        return (
            "New Chat"
        )

    words = (
        cleaned.split()
    )

    if (
        len(words)
        > 7
    ):

        return (
            " ".join(
                words[:7]
            )
            + "..."
        )

    return cleaned


def update_chat_metadata(
    *,
    chat: Chat,
    title_source: str,
) -> None:

    chat.updated_at = (
        datetime.utcnow()
    )

    if (
        chat.title
        == "New Chat"
    ):

        chat.title = (
            generate_chat_title(
                title_source
            )
        )

    chat_store.update(
        chat
    )


# ============================================================
# TEXT MESSAGE HELPERS
# ============================================================


def create_user_message(
    *,
    chat: Chat,
    chat_id: str,
    content: str,
) -> ChatMessage:

    message = (
        ChatMessage(
            message_id=str(
                uuid.uuid4()
            ),

            chat_id=chat_id,

            role="user",

            message_type="text",

            content=content,

            created_at=(
                datetime.utcnow()
            ),
        )
    )

    message_store.add(
        message
    )

    chat.message_ids.append(
        message.message_id
    )

    chat_store.update(
        chat
    )

    return message


def create_assistant_text_message(
    *,
    chat: Chat,
    chat_id: str,
    content: str,
) -> ChatMessage:

    message = (
        ChatMessage(
            message_id=str(
                uuid.uuid4()
            ),

            chat_id=chat_id,

            role="assistant",

            message_type="text",

            content=content,

            created_at=(
                datetime.utcnow()
            ),
        )
    )

    message_store.add(
        message
    )

    chat.message_ids.append(
        message.message_id
    )

    chat_store.update(
        chat
    )

    return message


# ============================================================
# IMAGE MESSAGE HELPER
# ============================================================


def create_assistant_image_message(
    *,
    chat: Chat,
    chat_id: str,
    prompt: str,
    result: dict,
    parent_image_id: (
        str | None
    ),
) -> ChatMessage:

    image_url = (
        result.get(
            "image_url"
        )
    )

    if not (
        isinstance(
            image_url,
            str,
        )
        and image_url
    ):

        raise HTTPException(
            status_code=502,
            detail=(
                "The image provider "
                "returned no usable image."
            ),
        )

    operation = (
        result.get(
            "operation"
        )
    )

    if operation not in {
        "generation",
        "edit",
    }:

        operation = (
            "edit"
            if parent_image_id
            else "generation"
        )

    message = (
        ChatMessage(
            message_id=str(
                uuid.uuid4()
            ),

            chat_id=chat_id,

            role="assistant",

            message_type="image",

            content="",

            image_url=(
                image_url
            ),

            image_prompt=(
                prompt
            ),

            image_operation=(
                operation
            ),

            image_provider=(
                result.get(
                    "provider"
                )
                or "pollinations"
            ),

            image_model=(
                result.get(
                    "model"
                )
            ),

            image_media_type=(
                result.get(
                    "media_type"
                )
            ),

            parent_image_id=(
                parent_image_id
            ),

            created_at=(
                datetime.utcnow()
            ),
        )
    )

    message_store.add(
        message
    )

    chat.message_ids.append(
        message.message_id
    )

    chat_store.update(
        chat
    )

    return message


# ============================================================
# ROLLBACK MESSAGE
# ============================================================


def rollback_message(
    *,
    chat: Chat,
    message: ChatMessage,
) -> None:

    message_store.remove(
        message.message_id
    )

    if (
        message.message_id
        in chat.message_ids
    ):

        chat.message_ids.remove(
            message.message_id
        )

    chat_store.update(
        chat
    )


# ============================================================
# LLM HISTORY
# ============================================================


def build_llm_messages(
    messages: list[
        ChatMessage
    ],
) -> list[
    dict[
        str,
        Any,
    ]
]:

    result: list[
        dict[
            str,
            Any,
        ]
    ] = []

    for message in messages:

        # ----------------------------------------------------
        # Image blobs must never be dumped into normal LLM
        # text history.
        # ----------------------------------------------------

        if (
            message.message_type
            != "text"
        ):

            continue

        if message.role not in {
            "user",
            "assistant",
        }:

            continue

        content = (
            message.content
            or ""
        ).strip()

        if not content:

            continue

        result.append(
            {
                "role": (
                    message.role
                ),

                "content": (
                    content
                ),
            }
        )

    return result


# ============================================================
# ASSISTANT CONTENT VALIDATION
# ============================================================


def normalize_assistant_content(
    content: str | None,
) -> str:

    normalized = (
        content
        or ""
    ).strip()

    if not normalized:

        raise HTTPException(
            status_code=500,
            detail=(
                "The assistant returned "
                "an empty response."
            ),
        )

    return normalized


# ============================================================
# FILE HELPERS
# ============================================================


def safe_filename(
    upload: UploadFile,
) -> str:

    filename = (
        upload.filename
        or "attachment"
    )

    return (
        Path(
            filename
        ).name
    )


def attachment_text(
    filename: str,
    content: str,
) -> str:

    content = (
        content.strip()
    )

    truncated = (
        len(content)
        > MAX_EXTRACTED_TEXT
    )

    content = (
        content[
            :MAX_EXTRACTED_TEXT
        ]
    )

    suffix = (
        "\n\n"
        "[Attachment text truncated.]"
        if truncated
        else ""
    )

    return (
        "\n\n"
        "==============================\n"
        f"ATTACHMENT: {filename}\n"
        "==============================\n"
        f"{content}"
        f"{suffix}"
    )


# ============================================================
# ATTACHMENT PARSER
# ============================================================


async def build_attachment_parts(
    uploads: list[
        UploadFile
    ],
) -> tuple[
    list[
        dict[
            str,
            Any,
        ]
    ],
    bool,
]:

    if not uploads:

        raise HTTPException(
            status_code=400,
            detail=(
                "At least one attachment "
                "is required."
            ),
        )

    if (
        len(uploads)
        > MAX_ATTACHMENTS
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                f"A maximum of "
                f"{MAX_ATTACHMENTS} "
                "attachments is allowed."
            ),
        )

    content_parts: list[
        dict[
            str,
            Any,
        ]
    ] = []

    contains_image = False

    for upload in uploads:

        filename = (
            safe_filename(
                upload
            )
        )

        extension = (
            Path(
                filename
            )
            .suffix
            .lower()
        )

        raw = (
            await upload.read()
        )

        if not raw:

            raise HTTPException(
                status_code=400,
                detail=(
                    f"{filename} "
                    "is empty."
                ),
            )

        if (
            len(raw)
            > MAX_ATTACHMENT_BYTES
        ):

            raise HTTPException(
                status_code=413,
                detail=(
                    f"{filename} "
                    "exceeds the "
                    "15 MB limit."
                ),
            )

        # ====================================================
        # IMAGE
        # ====================================================

        if extension in {
            ".png",
            ".jpg",
            ".jpeg",
            ".webp",
        }:

            contains_image = (
                True
            )

            mime_type = (
                upload.content_type
            )

            if not (
                mime_type
                and mime_type.startswith(
                    "image/"
                )
            ):

                mime_type = {
                    ".png":
                        "image/png",

                    ".jpg":
                        "image/jpeg",

                    ".jpeg":
                        "image/jpeg",

                    ".webp":
                        "image/webp",
                }[
                    extension
                ]

            encoded = (
                base64.b64encode(
                    raw
                ).decode(
                    "utf-8"
                )
            )

            content_parts.append(
                {
                    "type":
                        "text",

                    "text": (
                        f"Attached image: "
                        f"{filename}"
                    ),
                }
            )

            content_parts.append(
                {
                    "type":
                        "image_url",

                    "image_url": {
                        "url": (
                            f"data:"
                            f"{mime_type};"
                            f"base64,"
                            f"{encoded}"
                        ),
                    },
                }
            )

            continue

        # ====================================================
        # PDF
        # ====================================================

        if (
            extension
            == ".pdf"
        ):

            try:

                from pypdf import (
                    PdfReader,
                )

                reader = (
                    PdfReader(
                        BytesIO(
                            raw
                        )
                    )
                )

                pages: list[
                    str
                ] = []

                for page in (
                    reader.pages
                ):

                    try:

                        page_text = (
                            page.extract_text()
                            or ""
                        ).strip()

                    except Exception:

                        page_text = ""

                    if page_text:

                        pages.append(
                            page_text
                        )

                extracted = (
                    "\n\n"
                    .join(
                        pages
                    )
                    .strip()
                )

            except Exception as exc:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Could not read "
                        f"{filename}: "
                        f"{exc}"
                    ),
                ) from exc

            if not extracted:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"No readable text "
                        f"was found in "
                        f"{filename}."
                    ),
                )

            content_parts.append(
                {
                    "type":
                        "text",

                    "text": (
                        attachment_text(
                            filename,
                            extracted,
                        )
                    ),
                }
            )

            continue

        # ====================================================
        # TEXT / MARKDOWN
        # ====================================================

        if extension in {
            ".txt",
            ".md",
            ".markdown",
        }:

            try:

                extracted = (
                    raw.decode(
                        "utf-8"
                    )
                )

            except UnicodeDecodeError:

                extracted = (
                    raw.decode(
                        "utf-8",
                        errors="replace",
                    )
                )

            extracted = (
                extracted.strip()
            )

            if not extracted:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"{filename} "
                        "contains no "
                        "readable text."
                    ),
                )

            content_parts.append(
                {
                    "type":
                        "text",

                    "text": (
                        attachment_text(
                            filename,
                            extracted,
                        )
                    ),
                }
            )

            continue

        # ====================================================
        # DOCX
        # ====================================================

        if (
            extension
            == ".docx"
        ):

            try:

                from docx import (
                    Document,
                )

                document = (
                    Document(
                        BytesIO(
                            raw
                        )
                    )
                )

                paragraphs = [
                    paragraph.text
                    for paragraph
                    in document.paragraphs
                    if (
                        paragraph.text
                        .strip()
                    )
                ]

                extracted = (
                    "\n"
                    .join(
                        paragraphs
                    )
                    .strip()
                )

            except ImportError as exc:

                raise HTTPException(
                    status_code=500,
                    detail=(
                        "DOCX support "
                        "requires the "
                        "python-docx package."
                    ),
                ) from exc

            except Exception as exc:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Could not read "
                        f"{filename}: "
                        f"{exc}"
                    ),
                ) from exc

            if not extracted:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"{filename} "
                        "contains no "
                        "readable text."
                    ),
                )

            content_parts.append(
                {
                    "type":
                        "text",

                    "text": (
                        attachment_text(
                            filename,
                            extracted,
                        )
                    ),
                }
            )

            continue

        raise HTTPException(
            status_code=415,
            detail=(
                f"{filename} "
                "is not a supported "
                "attachment."
            ),
        )

    return (
        content_parts,
        contains_image,
    )


# ============================================================
# IMAGE MESSAGE LOOKUP
# ============================================================


def require_image_message(
    *,
    message_id: str,
    chat_id: str,
) -> ChatMessage:

    message = (
        message_store.get(
            message_id
        )
    )

    if message is None:

        raise HTTPException(
            status_code=404,
            detail=(
                "Source image "
                "could not be found."
            ),
        )

    if (
        message.chat_id
        != chat_id
    ):

        raise HTTPException(
            status_code=404,
            detail=(
                "Source image "
                "could not be found "
                "in this conversation."
            ),
        )

    if (
        message.message_type
        != "image"
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "The selected message "
                "is not an image."
            ),
        )

    if not (
        message.image_url
        and message.image_url.strip()
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "The selected image "
                "has no usable source."
            ),
        )

    return message


# ============================================================
# AUDIO TRANSCRIPTION
# ============================================================


@router.post(
    "/transcribe"
)
async def transcribe_audio(
    audio: UploadFile = File(
        ...
    ),

    current_user: (
        AuthenticatedUser
    ) = Depends(
        get_current_user
    ),
):

    del current_user

    raw = (
        await audio.read()
    )

    if not raw:

        raise HTTPException(
            status_code=400,
            detail=(
                "Audio recording "
                "is empty."
            ),
        )

    if (
        len(raw)
        > MAX_AUDIO_BYTES
    ):

        raise HTTPException(
            status_code=413,
            detail=(
                "Audio recording "
                "exceeds the "
                "30 MB limit."
            ),
        )

    filename = (
        safe_filename(
            audio
        )
    )

    try:

        transcript = (
            await media_service
            .transcribe_audio(
                raw,

                filename=(
                    filename
                ),

                content_type=(
                    audio.content_type
                ),
            )
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(
                exc
            ),
        ) from exc

    except Exception as exc:

        raise HTTPException(
            status_code=502,
            detail=str(
                exc
            ),
        ) from exc

    return {
        "text":
            transcript,
    }


# ============================================================
# GENERATE / EDIT IMAGE
# ============================================================


@router.post(
    "/generate-image"
)
async def generate_image(
    request:
        GenerateImageRequest,

    current_user: (
        AuthenticatedUser
    ) = Depends(
        get_current_user
    ),
):

    chat = (
        require_chat(
            request.chat_id,
            current_user.user_id,
        )
    )

    prompt = (
        request.prompt
        .strip()
    )

    if not prompt:

        raise HTTPException(
            status_code=400,
            detail=(
                "Image prompt "
                "cannot be empty."
            ),
        )

    if (
        len(prompt)
        > 4000
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Image prompt "
                "is too long."
            ),
        )

    source_message: (
        ChatMessage | None
    ) = None

    if (
        request
        .source_message_id
    ):

        source_message = (
            require_image_message(
                message_id=(
                    request
                    .source_message_id
                ),

                chat_id=(
                    request.chat_id
                ),
            )
        )

    # ========================================================
    # SAVE USER IMAGE PROMPT
    # ========================================================

    user_message = (
        create_user_message(
            chat=chat,

            chat_id=(
                request.chat_id
            ),

            content=(
                prompt
            ),
        )
    )

    # ========================================================
    # PROVIDER
    # ========================================================

    try:

        if source_message:

            result = (
                await media_service
                .edit_image(
                    prompt=(
                        prompt
                    ),

                    source_image=(
                        source_message
                        .image_url
                        or ""
                    ),
                )
            )

        else:

            result = (
                await media_service
                .generate_image(
                    prompt
                )
            )

    except ValueError as exc:

        rollback_message(
            chat=chat,

            message=(
                user_message
            ),
        )

        raise HTTPException(
            status_code=400,
            detail=str(
                exc
            ),
        ) from exc

    except Exception as exc:

        rollback_message(
            chat=chat,

            message=(
                user_message
            ),
        )

        raise HTTPException(
            status_code=502,
            detail=str(
                exc
            ),
        ) from exc

    # ========================================================
    # SAVE ASSISTANT IMAGE
    # ========================================================

    try:

        assistant_message = (
            create_assistant_image_message(
                chat=chat,

                chat_id=(
                    request.chat_id
                ),

                prompt=(
                    prompt
                ),

                result=(
                    result
                ),

                parent_image_id=(
                    source_message
                    .message_id
                    if source_message
                    else None
                ),
            )
        )

    except Exception:

        rollback_message(
            chat=chat,

            message=(
                user_message
            ),
        )

        raise

    update_chat_metadata(
        chat=chat,
        title_source=prompt,
    )

    return {
        "chat":
            chat,

        "user_message":
            user_message,

        "assistant_message":
            assistant_message,
    }


# ============================================================
# CREATE CHAT
# ============================================================


@router.post("/")
async def create_chat(
    current_user: (
        AuthenticatedUser
    ) = Depends(
        get_current_user
    ),
):

    now = (
        datetime.utcnow()
    )

    chat = (
        Chat(
            chat_id=str(
                uuid.uuid4()
            ),

            user_id=(
                current_user
                .user_id
            ),

            title=(
                "New Chat"
            ),

            created_at=(
                now
            ),

            updated_at=(
                now
            ),
        )
    )

    chat_store.add(
        chat
    )

    return chat


# ============================================================
# LIST CHATS
# ============================================================


@router.get("/")
async def list_chats(
    current_user: (
        AuthenticatedUser
    ) = Depends(
        get_current_user
    ),
):

    chats = (
        chat_store
        .all_for_user(
            current_user
            .user_id
        )
    )

    return {
        "total":
            len(
                chats
            ),

        "chats":
            chats,
    }


# ============================================================
# GET CHAT
# ============================================================


@router.get(
    "/{chat_id}"
)
async def get_chat(
    chat_id: str,

    current_user: (
        AuthenticatedUser
    ) = Depends(
        get_current_user
    ),
):

    chat = (
        require_chat(
            chat_id,
            current_user.user_id,
        )
    )

    jobs = []

    for job_id in (
        chat.job_ids
    ):

        job = (
            job_store.get(
                job_id
            )
        )

        if job is not None:

            jobs.append(
                job
            )

    messages = (
        message_store
        .get_by_chat(
            chat_id
        )
    )

    return {
        "chat":
            chat,

        "jobs":
            jobs,

        "messages":
            messages,
    }


# ============================================================
# NORMAL TEXT MESSAGE
# ============================================================


@router.post(
    "/{chat_id}/messages"
)
async def send_message(
    chat_id: str,

    request:
        SendMessageRequest,

    current_user: (
        AuthenticatedUser
    ) = Depends(
        get_current_user
    ),
):

    chat = (
        require_chat(
            chat_id,
            current_user.user_id,
        )
    )

    content = (
        request.content
        .strip()
    )

    if not content:

        raise HTTPException(
            status_code=400,
            detail=(
                "Message cannot "
                "be empty."
            ),
        )

    user_message = (
        create_user_message(
            chat=chat,

            chat_id=(
                chat_id
            ),

            content=(
                content
            ),
        )
    )

    conversation = (
        message_store
        .get_by_chat(
            chat_id
        )
    )

    llm_messages = (
        build_llm_messages(
            conversation
        )
    )

    try:

        assistant_content = (
            llm_service
            .generate_chat(
                llm_messages
            )
        )

    except Exception as exc:

        rollback_message(
            chat=chat,

            message=(
                user_message
            ),
        )

        if isinstance(
            exc,
            LLMProviderError,
        ):
            raise HTTPException(
                status_code=(
                    exc.status_code
                ),
                detail=str(
                    exc
                ),
            ) from exc

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to generate "
                "the assistant response."
            ),
        ) from exc

    try:

        assistant_content = (
            normalize_assistant_content(
                assistant_content
            )
        )

    except HTTPException:

        rollback_message(
            chat=chat,

            message=(
                user_message
            ),
        )

        raise

    assistant_message = (
        create_assistant_text_message(
            chat=chat,

            chat_id=(
                chat_id
            ),

            content=(
                assistant_content
            ),
        )
    )

    update_chat_metadata(
        chat=chat,
        title_source=content,
    )

    return {
        "chat":
            chat,

        "user_message":
            user_message,

        "assistant_message":
            assistant_message,
    }


# ============================================================
# EDIT USER MESSAGE + REGENERATE
#
# This preserves the previous working text-edit behaviour.
#
# Editing an earlier message removes the conversation branch
# after it and regenerates the assistant response.
#
# If regeneration fails, the original branch is restored.
# ============================================================


@router.patch(
    "/{chat_id}/messages/{message_id}"
)
async def edit_message(
    chat_id: str,

    message_id: str,

    request:
        EditMessageRequest,

    current_user: (
        AuthenticatedUser
    ) = Depends(
        get_current_user
    ),
):

    chat = (
        require_chat(
            chat_id,
            current_user.user_id,
        )
    )

    content = (
        request.content
        .strip()
    )

    if not content:

        raise HTTPException(
            status_code=400,
            detail=(
                "Message cannot "
                "be empty."
            ),
        )

    conversation = (
        message_store
        .get_by_chat(
            chat_id
        )
    )

    target_index: (
        int | None
    ) = None

    for (
        index,
        message,
    ) in enumerate(
        conversation
    ):

        if (
            message.message_id
            == message_id
        ):

            target_index = (
                index
            )

            break

    if (
        target_index
        is None
    ):

        raise HTTPException(
            status_code=404,
            detail=(
                "Message not found."
            ),
        )

    target_message = (
        conversation[
            target_index
        ]
    )

    if (
        target_message.role
        != "user"
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Only user messages "
                "can be edited."
            ),
        )

    if (
        target_message
        .message_type
        != "text"
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Only text messages "
                "can be edited."
            ),
        )

    # ========================================================
    # SAVE ORIGINAL BRANCH FOR ROLLBACK
    # ========================================================

    old_branch = (
        conversation[
            target_index:
        ]
    )

    old_message_ids = (
        list(
            chat.message_ids
        )
    )

    old_title = (
        chat.title
    )

    old_updated_at = (
        chat.updated_at
    )

    # ========================================================
    # REMOVE OLD BRANCH
    # ========================================================

    for message in (
        old_branch
    ):

        message_store.remove(
            message.message_id
        )

    remaining_messages = (
        conversation[
            :target_index
        ]
    )

    chat.message_ids = [
        message.message_id
        for message
        in remaining_messages
    ]

    chat_store.update(
        chat
    )

    # ========================================================
    # CREATE EDITED USER MESSAGE
    # ========================================================

    edited_message = (
        ChatMessage(
            message_id=str(
                uuid.uuid4()
            ),

            chat_id=(
                chat_id
            ),

            role=(
                "user"
            ),

            message_type=(
                "text"
            ),

            content=(
                content
            ),

            created_at=(
                datetime.utcnow()
            ),
        )
    )

    message_store.add(
        edited_message
    )

    chat.message_ids.append(
        edited_message
        .message_id
    )

    chat_store.update(
        chat
    )

    # ========================================================
    # BUILD NEW BRANCH
    # ========================================================

    new_conversation = (
        message_store
        .get_by_chat(
            chat_id
        )
    )

    llm_messages = (
        build_llm_messages(
            new_conversation
        )
    )

    # ========================================================
    # REGENERATE
    # ========================================================

    try:

        assistant_content = (
            llm_service
            .generate_chat(
                llm_messages
            )
        )

        assistant_content = (
            normalize_assistant_content(
                assistant_content
            )
        )

    except Exception as exc:

        # ====================================================
        # ROLLBACK TO ORIGINAL BRANCH
        # ====================================================

        message_store.remove(
            edited_message
            .message_id
        )

        for message in (
            old_branch
        ):

            message_store.add(
                message
            )

        chat.message_ids = (
            old_message_ids
        )

        chat.title = (
            old_title
        )

        chat.updated_at = (
            old_updated_at
        )

        chat_store.update(
            chat
        )

        if isinstance(
            exc,
            LLMProviderError,
        ):
            raise HTTPException(
                status_code=(
                    exc.status_code
                ),
                detail=str(
                    exc
                ),
            ) from exc

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to regenerate "
                "the assistant response."
            ),
        ) from exc

    # ========================================================
    # SAVE REGENERATED ASSISTANT MESSAGE
    # ========================================================

    assistant_message = (
        create_assistant_text_message(
            chat=chat,

            chat_id=(
                chat_id
            ),

            content=(
                assistant_content
            ),
        )
    )

    # ========================================================
    # RECALCULATE CHAT TITLE
    # ========================================================

    updated_messages = (
        message_store
        .get_by_chat(
            chat_id
        )
    )

    first_user_message: (
        ChatMessage | None
    ) = None

    for message in (
        updated_messages
    ):

        if (
            message.role
            == "user"
            and
            message.message_type
            == "text"
        ):

            first_user_message = (
                message
            )

            break

    if (
        first_user_message
    ):

        chat.title = (
            generate_chat_title(
                first_user_message
                .content
            )
        )

    chat.updated_at = (
        datetime.utcnow()
    )

    chat_store.update(
        chat
    )

    return {
        "chat":
            chat,

        "messages": (
            message_store
            .get_by_chat(
                chat_id
            )
        ),

        "edited_message":
            edited_message,

        "assistant_message":
            assistant_message,
    }


# ============================================================
# MESSAGE + ATTACHMENTS
# ============================================================


@router.post(
    "/{chat_id}/messages-with-attachments"
)
async def send_message_with_attachments(
    chat_id: str,

    content: str = Form(
        default=""
    ),

    files: (
        list[
            UploadFile
        ]
        | None
    ) = File(
        default=None
    ),

    current_user: (
        AuthenticatedUser
    ) = Depends(
        get_current_user
    ),
):

    chat = (
        require_chat(
            chat_id,
            current_user.user_id,
        )
    )

    uploads = (
        files
        or []
    )

    (
        attachment_parts,
        contains_image,
    ) = (
        await build_attachment_parts(
            uploads
        )
    )

    user_content = (
        content.strip()
    )

    display_content = (
        user_content
        or (
            "Analyze the "
            "attached files."
        )
    )

    previous_messages = (
        message_store
        .get_by_chat(
            chat_id
        )
    )

    llm_messages = (
        build_llm_messages(
            previous_messages
        )
    )

    user_message = (
        create_user_message(
            chat=chat,

            chat_id=(
                chat_id
            ),

            content=(
                display_content
            ),
        )
    )

    multimodal_content: list[
        dict[
            str,
            Any,
        ]
    ] = [
        {
            "type":
                "text",

            "text": (
                user_content
                or (
                    "Analyze the "
                    "attached files "
                    "and answer based "
                    "on their contents."
                )
            ),
        }
    ]

    multimodal_content.extend(
        attachment_parts
    )

    llm_messages.append(
        {
            "role":
                "user",

            "content":
                multimodal_content,
        }
    )

    model_override: (
        str | None
    ) = None

    if contains_image:

        model_override = (
            settings
            .OPENROUTER_VISION_MODEL
        )

    try:

        assistant_content = (
            llm_service
            .generate_chat(
                llm_messages,

                model=(
                    model_override
                ),
            )
        )

    except Exception as exc:

        rollback_message(
            chat=chat,

            message=(
                user_message
            ),
        )

        if isinstance(
            exc,
            LLMProviderError,
        ):
            raise HTTPException(
                status_code=(
                    exc.status_code
                ),
                detail=str(
                    exc
                ),
            ) from exc

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to analyze "
                "the attachment."
            ),
        ) from exc

    try:

        assistant_content = (
            normalize_assistant_content(
                assistant_content
            )
        )

    except HTTPException:

        rollback_message(
            chat=chat,

            message=(
                user_message
            ),
        )

        raise

    assistant_message = (
        create_assistant_text_message(
            chat=chat,

            chat_id=(
                chat_id
            ),

            content=(
                assistant_content
            ),
        )
    )

    update_chat_metadata(
        chat=chat,
        title_source=display_content,
    )

    return {
        "chat":
            chat,

        "user_message":
            user_message,

        "assistant_message":
            assistant_message,
    }


# ============================================================
# GET MESSAGES
# ============================================================


@router.get(
    "/{chat_id}/messages"
)
async def get_messages(
    chat_id: str,

    current_user: (
        AuthenticatedUser
    ) = Depends(
        get_current_user
    ),
):

    require_chat(
        chat_id,
        current_user.user_id,
    )

    messages = (
        message_store
        .get_by_chat(
            chat_id
        )
    )

    return {
        "chat_id":
            chat_id,

        "total":
            len(
                messages
            ),

        "messages":
            messages,
    }


# ============================================================
# DELETE CHAT
# ============================================================


@router.delete(
    "/{chat_id}"
)
async def delete_chat(
    chat_id: str,

    current_user: (
        AuthenticatedUser
    ) = Depends(
        get_current_user
    ),
):

    require_chat(
        chat_id,
        current_user.user_id,
    )

    message_store.delete_chat(
        chat_id
    )

    chat_store.remove_for_user(
        chat_id,
        current_user.user_id,
    )

    return {
        "success":
            True,

        "message": (
            "Chat deleted "
            "successfully."
        ),
    }