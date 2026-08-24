import uuid
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.models.chat import Chat
from app.models.chat_message import ChatMessage

from app.services.chat_store import chat_store
from app.services.chat_message_store import (
    chat_message_store,
)

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
async def create_chat():

    now = datetime.utcnow()

    chat = Chat(
        chat_id=str(uuid.uuid4()),
        title="New Chat",
        created_at=now,
        updated_at=now,
    )

    chat_store.add(chat)

    return chat


# ============================================================
# LIST ALL CHATS
# ============================================================


@router.get("/")
async def list_chats():

    chats = chat_store.all()

    # --------------------------------------------------------
    # Newest chats first
    # --------------------------------------------------------

    chats.sort(
        key=lambda chat: chat.updated_at,
        reverse=True,
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
):

    chat = chat_store.get(chat_id)

    if chat is None:

        raise HTTPException(
            status_code=404,
            detail="Chat not found.",
        )

    # --------------------------------------------------------
    # Research jobs
    # --------------------------------------------------------

    jobs = []

    for job_id in chat.job_ids:

        job = job_store.get(job_id)

        if job is not None:
            jobs.append(job)

    # --------------------------------------------------------
    # Conversation messages
    # --------------------------------------------------------

    messages = (
        chat_message_store.get_by_chat(
            chat_id
        )
    )

    return {
        "chat": chat,
        "jobs": jobs,
        "messages": messages,
    }


# ============================================================
# SEND CONVERSATION MESSAGE
# ============================================================


@router.post("/{chat_id}/messages")
async def send_message(
    chat_id: str,
    request: SendMessageRequest,
):

    # --------------------------------------------------------
    # Verify chat
    # --------------------------------------------------------

    chat = chat_store.get(chat_id)

    if chat is None:

        raise HTTPException(
            status_code=404,
            detail="Chat not found.",
        )

    # --------------------------------------------------------
    # Validate message
    # --------------------------------------------------------

    content = request.content.strip()

    if not content:

        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty.",
        )

    # --------------------------------------------------------
    # Save user message
    # --------------------------------------------------------

    user_message = ChatMessage(
        message_id=str(uuid.uuid4()),
        chat_id=chat_id,
        role="user",
        content=content,
        created_at=datetime.utcnow(),
    )

    chat_message_store.add(
        user_message
    )

    # --------------------------------------------------------
    # Load conversation history
    #
    # This includes the message we just added.
    # --------------------------------------------------------

    history = (
        chat_message_store.get_by_chat(
            chat_id
        )
    )

    llm_messages = []

    for message in history:

        llm_messages.append(
            {
                "role": message.role,
                "content": message.content,
            }
        )

    # --------------------------------------------------------
    # Generate AI response
    # --------------------------------------------------------

    try:

        assistant_content = (
            llm_service.generate_chat(
                llm_messages
            )
        )

    except Exception as exc:

        # ----------------------------------------------------
        # If the model fails, remove the user message so the
        # conversation doesn't contain a message that never
        # received a response.
        # ----------------------------------------------------

        messages = (
            chat_message_store.get_by_chat(
                chat_id
            )
        )

        if messages:

            messages.pop()

        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate response: {exc}",
        )

    # --------------------------------------------------------
    # Save assistant message
    # --------------------------------------------------------

    assistant_message = ChatMessage(
        message_id=str(uuid.uuid4()),
        chat_id=chat_id,
        role="assistant",
        content=assistant_content,
        created_at=datetime.utcnow(),
    )

    chat_message_store.add(
        assistant_message
    )

    # --------------------------------------------------------
    # Update chat timestamp
    # --------------------------------------------------------

    chat.updated_at = datetime.utcnow()

    # --------------------------------------------------------
    # Automatically name the chat from first message
    # --------------------------------------------------------

    if chat.title == "New Chat":

        title = content.replace(
            "\n",
            " ",
        ).strip()

        if len(title) > 50:

            title = (
                title[:47]
                + "..."
            )

        if title:

            chat.title = title

    chat_store.update(chat)

    # --------------------------------------------------------
    # Return both messages
    # --------------------------------------------------------

    return {
        "chat": chat,
        "user_message": user_message,
        "assistant_message": assistant_message,
    }


# ============================================================
# DELETE CHAT
# ============================================================


@router.delete("/{chat_id}")
async def delete_chat(
    chat_id: str,
):

    chat = chat_store.get(
        chat_id
    )

    if chat is None:

        raise HTTPException(
            status_code=404,
            detail="Chat not found.",
        )

    # --------------------------------------------------------
    # Delete conversation messages
    # --------------------------------------------------------

    chat_message_store.delete_chat(
        chat_id
    )

    # --------------------------------------------------------
    # Delete chat
    #
    # Research jobs are intentionally preserved for now.
    # --------------------------------------------------------

    chat_store.remove(
        chat_id
    )

    return {
        "success": True,
        "message": "Chat deleted successfully.",
    }