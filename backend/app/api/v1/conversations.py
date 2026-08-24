import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.auth import (
    AuthenticatedUser,
    get_current_user,
)

from app.models.chat import Chat
from app.models.message import ChatMessage

from app.services.chat_store import chat_store
from app.services.message_store import message_store
from app.services.job_store import job_store
from app.services.llm_service import llm_service


router = APIRouter()


# ============================================================
# REQUEST MODELS
# ============================================================


class SendMessageRequest(BaseModel):

    content: str


# ============================================================
# CREATE NEW CHAT
# ============================================================


@router.post("/")
async def create_chat(
    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
):

    now = datetime.utcnow()

    chat = Chat(
        chat_id=str(uuid.uuid4()),

        # ----------------------------------------------------
        # Attach chat to authenticated Supabase user.
        # ----------------------------------------------------

        user_id=current_user.user_id,

        title="New Chat",

        created_at=now,

        updated_at=now,
    )

    chat_store.add(chat)

    return chat


# ============================================================
# LIST USER'S CHATS
# ============================================================


@router.get("/")
async def list_chats(
    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
):

    chats = chat_store.all_for_user(
        current_user.user_id
    )

    return {
        "total": len(chats),
        "chats": chats,
    }


# ============================================================
# GET CHAT
# ============================================================


@router.get("/{chat_id}")
async def get_chat(
    chat_id: str,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
):

    # --------------------------------------------------------
    # SECURITY:
    # Only the owner can access this chat.
    # --------------------------------------------------------

    chat = chat_store.get_for_user(
        chat_id,
        current_user.user_id,
    )

    if chat is None:

        raise HTTPException(
            status_code=404,
            detail="Chat not found.",
        )

    # --------------------------------------------------------
    # Load research jobs belonging to this chat.
    # --------------------------------------------------------

    jobs = []

    for job_id in chat.job_ids:

        job = job_store.get(
            job_id
        )

        if job is not None:
            jobs.append(job)

    # --------------------------------------------------------
    # Load conversation messages.
    # --------------------------------------------------------

    messages = message_store.get_by_chat(
        chat_id
    )

    return {
        "chat": chat,
        "jobs": jobs,
        "messages": messages,
    }


# ============================================================
# SEND MESSAGE
# ============================================================


@router.post("/{chat_id}/messages")
async def send_message(
    chat_id: str,

    request: SendMessageRequest,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
):

    # --------------------------------------------------------
    # SECURITY:
    # User can only send messages to their own chat.
    # --------------------------------------------------------

    chat = chat_store.get_for_user(
        chat_id,
        current_user.user_id,
    )

    if chat is None:

        raise HTTPException(
            status_code=404,
            detail="Chat not found.",
        )

    # --------------------------------------------------------
    # Validate message.
    # --------------------------------------------------------

    content = request.content.strip()

    if not content:

        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty.",
        )

    # ========================================================
    # SAVE USER MESSAGE
    # ========================================================

    user_message = ChatMessage(
        message_id=str(uuid.uuid4()),

        chat_id=chat_id,

        role="user",

        content=content,

        created_at=datetime.utcnow(),
    )

    message_store.add(
        user_message
    )

    chat.message_ids.append(
        user_message.message_id
    )

    # ========================================================
    # LOAD COMPLETE CONVERSATION
    # ========================================================

    conversation = message_store.get_by_chat(
        chat_id
    )

    # ========================================================
    # BUILD LLM MESSAGE HISTORY
    # ========================================================

    llm_messages = []

    for message in conversation:

        if message.role not in {
            "user",
            "assistant",
        }:

            continue

        if not message.content:

            continue

        llm_messages.append(
            {
                "role": message.role,
                "content": message.content,
            }
        )

    # ========================================================
    # GENERATE ASSISTANT RESPONSE
    # ========================================================

    try:

        assistant_content = (
            llm_service.generate_chat(
                llm_messages
            )
        )

    except Exception as exc:

        # ----------------------------------------------------
        # Roll back user message if generation fails.
        # ----------------------------------------------------

        message_store.remove(
            user_message.message_id
        )

        if (
            user_message.message_id
            in chat.message_ids
        ):

            chat.message_ids.remove(
                user_message.message_id
            )

        chat_store.update(
            chat
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to generate the assistant response."
            ),
        ) from exc

    # ========================================================
    # VALIDATE ASSISTANT RESPONSE
    # ========================================================

    assistant_content = (
        assistant_content or ""
    ).strip()

    if not assistant_content:

        message_store.remove(
            user_message.message_id
        )

        if (
            user_message.message_id
            in chat.message_ids
        ):

            chat.message_ids.remove(
                user_message.message_id
            )

        chat_store.update(
            chat
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "The assistant returned an empty response."
            ),
        )

    # ========================================================
    # SAVE ASSISTANT MESSAGE
    # ========================================================

    assistant_message = ChatMessage(
        message_id=str(uuid.uuid4()),

        chat_id=chat_id,

        role="assistant",

        content=assistant_content,

        created_at=datetime.utcnow(),
    )

    message_store.add(
        assistant_message
    )

    chat.message_ids.append(
        assistant_message.message_id
    )

    # ========================================================
    # UPDATE CHAT
    # ========================================================

    chat.updated_at = datetime.utcnow()

    # --------------------------------------------------------
    # Generate useful title from first user message.
    # --------------------------------------------------------

    if chat.title == "New Chat":

        words = content.split()

        if len(words) > 7:

            chat.title = (
                " ".join(words[:7])
                + "..."
            )

        else:

            chat.title = content

    chat_store.update(
        chat
    )

    # ========================================================
    # RESPONSE
    # ========================================================

    return {
        "chat": chat,
        "user_message": user_message,
        "assistant_message": assistant_message,
    }


# ============================================================
# GET CHAT MESSAGES
# ============================================================


@router.get("/{chat_id}/messages")
async def get_messages(
    chat_id: str,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
):

    # --------------------------------------------------------
    # SECURITY:
    # Only the owner can retrieve messages.
    # --------------------------------------------------------

    chat = chat_store.get_for_user(
        chat_id,
        current_user.user_id,
    )

    if chat is None:

        raise HTTPException(
            status_code=404,
            detail="Chat not found.",
        )

    messages = message_store.get_by_chat(
        chat_id
    )

    return {
        "chat_id": chat_id,
        "total": len(messages),
        "messages": messages,
    }


# ============================================================
# DELETE CHAT
# ============================================================


@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: str,

    current_user: AuthenticatedUser = Depends(
        get_current_user
    ),
):

    # --------------------------------------------------------
    # SECURITY:
    # Only the owner can delete the chat.
    # --------------------------------------------------------

    chat = chat_store.get_for_user(
        chat_id,
        current_user.user_id,
    )

    if chat is None:

        raise HTTPException(
            status_code=404,
            detail="Chat not found.",
        )

    # --------------------------------------------------------
    # Delete messages.
    # --------------------------------------------------------

    message_store.delete_chat(
        chat_id
    )

    # --------------------------------------------------------
    # Delete chat.
    # --------------------------------------------------------

    chat_store.remove_for_user(
        chat_id,
        current_user.user_id,
    )

    return {
        "success": True,
        "message": "Chat deleted successfully.",
    }
