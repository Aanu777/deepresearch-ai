from threading import Lock
from typing import Dict, List

from app.models.message import ChatMessage


class MessageStore:
    """
    Thread-safe in-memory storage for conversation messages.

    Messages are stored individually and linked to their
    chat through chat_id.

    Later this can be replaced with SQLite/PostgreSQL/Redis
    without changing the rest of the application.
    """

    def __init__(self):

        self._messages: Dict[
            str,
            ChatMessage
        ] = {}

        self._lock = Lock()

    # ========================================================
    # CREATE
    # ========================================================

    def add(
        self,
        message: ChatMessage,
    ) -> None:

        with self._lock:

            self._messages[
                message.message_id
            ] = message

    # ========================================================
    # GET MESSAGE
    # ========================================================

    def get(
        self,
        message_id: str,
    ) -> ChatMessage | None:

        with self._lock:

            return self._messages.get(
                message_id
            )

    # ========================================================
    # GET CHAT MESSAGES
    # ========================================================

    def get_by_chat(
        self,
        chat_id: str,
    ) -> List[ChatMessage]:

        with self._lock:

            messages = [
                message
                for message in self._messages.values()
                if message.chat_id == chat_id
            ]

            # ------------------------------------------------
            # Oldest → newest
            #
            # This order is important because the LLM needs
            # to receive the conversation chronologically.
            # ------------------------------------------------

            messages.sort(
                key=lambda message:
                message.created_at
            )

            return messages

    # ========================================================
    # UPDATE
    # ========================================================

    def update(
        self,
        message: ChatMessage,
    ) -> None:

        with self._lock:

            if message.message_id in self._messages:

                self._messages[
                    message.message_id
                ] = message

    # ========================================================
    # DELETE MESSAGE
    # ========================================================

    def remove(
        self,
        message_id: str,
    ) -> None:

        with self._lock:

            self._messages.pop(
                message_id,
                None,
            )

    # ========================================================
    # DELETE ALL MESSAGES FROM CHAT
    # ========================================================

    def delete_chat(
        self,
        chat_id: str,
    ) -> None:

        with self._lock:

            message_ids = [
                message_id
                for message_id, message
                in self._messages.items()
                if message.chat_id == chat_id
            ]

            for message_id in message_ids:

                self._messages.pop(
                    message_id,
                    None,
                )

    # ========================================================
    # EXISTS
    # ========================================================

    def exists(
        self,
        message_id: str,
    ) -> bool:

        with self._lock:

            return (
                message_id
                in self._messages
            )

    # ========================================================
    # COUNT
    # ========================================================

    def count(self) -> int:

        with self._lock:

            return len(
                self._messages
            )

    # ========================================================
    # CHAT MESSAGE COUNT
    # ========================================================

    def count_by_chat(
        self,
        chat_id: str,
    ) -> int:

        with self._lock:

            return sum(
                1
                for message
                in self._messages.values()
                if message.chat_id == chat_id
            )

    # ========================================================
    # CLEAR
    # ========================================================

    def clear(self) -> None:

        with self._lock:

            self._messages.clear()


# ============================================================
# SINGLE STORE INSTANCE
# ============================================================

message_store = MessageStore()