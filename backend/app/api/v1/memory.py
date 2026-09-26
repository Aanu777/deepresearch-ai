from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from app.core.auth import (
    AuthenticatedUser,
    get_current_user,
)

from app.services.memory_service import (
    memory_service,
)


router = APIRouter()


@router.get("/")
async def list_memories(
    current_user: (
        AuthenticatedUser
    ) = Depends(
        get_current_user
    ),
):

    try:
        memories = (
            await memory_service
            .list_memories(
                access_token=(
                    current_user
                    .access_token
                ),
            )
        )

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to load memories "
                "right now."
            ),
        ) from exc

    return {
        "memories":
            memories,
    }


@router.delete("/{memory_id}")
async def delete_memory(
    memory_id: UUID,

    current_user: (
        AuthenticatedUser
    ) = Depends(
        get_current_user
    ),
):

    try:
        await memory_service.delete_memory(
            access_token=(
                current_user
                .access_token
            ),
            memory_id=str(
                memory_id
            ),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to delete memory "
                "right now."
            ),
        ) from exc

    return {
        "deleted":
            True,
    }


@router.delete("/")
async def clear_memories(
    current_user: (
        AuthenticatedUser
    ) = Depends(
        get_current_user
    ),
):

    try:
        await memory_service.clear_memories(
            user_id=(
                current_user
                .user_id
            ),
            access_token=(
                current_user
                .access_token
            ),
        )

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to clear memories "
                "right now."
            ),
        ) from exc

    return {
        "cleared":
            True,
    }
