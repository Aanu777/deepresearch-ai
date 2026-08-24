from threading import Lock
from typing import Dict, List

from app.models.chat import Chat


class ChatStore:
    """
    Thread-safe in-memory storage for chats.

    Every chat belongs to exactly one authenticated user.

    User-specific access methods are used by the API so that
    one user can never retrieve or modify another user's chats.
    """

    def __init__(self):

        self._chats: Dict[str, Chat] = {}

        self._lock = Lock()

    # ========================================================
    # CREATE
    # ========================================================

    def add(
        self,
        chat: Chat,
    ) -> None:

        with self._lock:

            self._chats[
                chat.chat_id
            ] = chat

    # ========================================================
    # GET BY ID
    # ========================================================

    def get(
        self,
        chat_id: str,
    ) -> Chat | None:

        with self._lock:

            return self._chats.get(
                chat_id
            )

    # ========================================================
    # GET CHAT FOR USER
    # ========================================================

    def get_for_user(
        self,
        chat_id: str,
        user_id: str,
    ) -> Chat | None:

        with self._lock:

            chat = self._chats.get(
                chat_id
            )

            if chat is None:
                return None

            if chat.user_id != user_id:
                return None

            return chat

    # ========================================================
    # UPDATE
    # ========================================================

    def update(
        self,
        chat: Chat,
    ) -> None:

        with self._lock:

            self._chats[
                chat.chat_id
            ] = chat

    # ========================================================
    # DELETE
    # ========================================================

    def remove(
        self,
        chat_id: str,
    ) -> None:

        with self._lock:

            self._chats.pop(
                chat_id,
                None,
            )

    # ========================================================
    # DELETE CHAT FOR USER
    # ========================================================

    def remove_for_user(
        self,
        chat_id: str,
        user_id: str,
    ) -> bool:

        with self._lock:

            chat = self._chats.get(
                chat_id
            )

            if chat is None:
                return False

            if chat.user_id != user_id:
                return False

            del self._chats[
                chat_id
            ]

            return True

    # ========================================================
    # EXISTS
    # ========================================================

    def exists(
        self,
        chat_id: str,
    ) -> bool:

        with self._lock:

            return (
                chat_id
                in self._chats
            )

    # ========================================================
    # EXISTS FOR USER
    # ========================================================

    def exists_for_user(
        self,
        chat_id: str,
        user_id: str,
    ) -> bool:

        with self._lock:

            chat = self._chats.get(
                chat_id
            )

            if chat is None:
                return False

            return chat.user_id == user_id

    # ========================================================
    # LIST ALL CHATS
    # ========================================================

    def all(self) -> List[Chat]:

        with self._lock:

            chats = list(
                self._chats.values()
            )

            chats.sort(
                key=lambda chat:
                chat.updated_at,
                reverse=True,
            )

            return chats

    # ========================================================
    # LIST USER'S CHATS
    # ========================================================

    def all_for_user(
        self,
        user_id: str,
    ) -> List[Chat]:

        with self._lock:

            chats = [
                chat
                for chat in self._chats.values()
                if chat.user_id == user_id
            ]

            chats.sort(
                key=lambda chat:
                chat.updated_at,
                reverse=True,
            )

            return chats

    # ========================================================
    # COUNT
    # ========================================================

    def count(self) -> int:

        with self._lock:

            return len(
                self._chats
            )

    # ========================================================
    # COUNT USER CHATS
    # ========================================================

    def count_for_user(
        self,
        user_id: str,
    ) -> int:

        with self._lock:

            return sum(
                1
                for chat in self._chats.values()
                if chat.user_id == user_id
            )

    # ========================================================
    # CLEAR
    # ========================================================

    def clear(self) -> None:

        with self._lock:

            self._chats.clear()


# ============================================================
# SINGLE STORE INSTANCE
# ============================================================

chat_store = ChatStore()