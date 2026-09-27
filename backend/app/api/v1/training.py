from typing import Literal
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from app.core.auth import (
    AuthenticatedUser,
    get_current_user,
)

from app.services.training_data_service import (
    training_data_service,
)


router = APIRouter()


@router.get("/")
async def training_overview(
    current_user: (
        AuthenticatedUser
    ) = Depends(
        get_current_user
    ),
):

    try:
        examples = (
            await training_data_service
            .list_examples(
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
                "Unable to load the private "
                "training dataset right now."
            ),
        ) from exc

    conversation_count = sum(
        1
        for row in examples
        if (
            row.get(
                "source_type"
            )
            == "conversation"
        )
    )

    research_count = sum(
        1
        for row in examples
        if (
            row.get(
                "source_type"
            )
            == "research"
        )
    )

    redactions = sum(
        int(
            row.get(
                "redaction_count",
                0,
            )
            or 0
        )
        for row in examples
    )

    qualities = [
        float(
            row.get(
                "quality_score",
                0.0,
            )
            or 0.0
        )
        for row in examples
    ]

    samples = [
        {
            "id":
                row.get(
                    "id"
                ),

            "source_type":
                row.get(
                    "source_type"
                ),

            "prompt":
                row.get(
                    "prompt"
                ),

            "target_response":
                row.get(
                    "target_response"
                ),

            "feedback_reason":
                row.get(
                    "feedback_reason"
                ),

            "quality_score":
                row.get(
                    "quality_score"
                ),

            "redaction_count":
                row.get(
                    "redaction_count"
                ),

            "created_at":
                row.get(
                    "created_at"
                ),
        }
        for row in reversed(
            examples[
                -20:
            ]
        )
    ]

    return {
        "total_examples":
            len(
                examples
            ),

        "conversation_examples":
            conversation_count,

        "research_examples":
            research_count,

        "redactions":
            redactions,

        "average_quality":
            (
                round(
                    (
                        sum(
                            qualities
                        )
                        / len(
                            qualities
                        )
                    ),
                    3,
                )
                if qualities
                else 0.0
            ),

        "samples":
            samples,
    }


@router.get("/export")
async def export_training_dataset(
    format: Literal[
        "sft",
        "preference",
    ] = Query(
        default="sft"
    ),

    current_user: (
        AuthenticatedUser
    ) = Depends(
        get_current_user
    ),
):

    try:
        examples = (
            await training_data_service
            .list_examples(
                access_token=(
                    current_user
                    .access_token
                ),
            )
        )

        return (
            training_data_service
            .export_dataset(
                examples,
                dataset_format=(
                    format
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
            status_code=503,
            detail=(
                "Unable to export the private "
                "training dataset right now."
            ),
        ) from exc


@router.delete("/{example_id}")
async def delete_training_example(
    example_id: UUID,

    current_user: (
        AuthenticatedUser
    ) = Depends(
        get_current_user
    ),
):

    try:
        await (
            training_data_service
            .delete_example(
                access_token=(
                    current_user
                    .access_token
                ),
                example_id=str(
                    example_id
                ),
            )
        )

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail=(
                "Unable to delete the training "
                "example right now."
            ),
        ) from exc

    return {
        "deleted":
            True,
    }


@router.delete("/")
async def clear_training_dataset(
    current_user: (
        AuthenticatedUser
    ) = Depends(
        get_current_user
    ),
):

    try:
        await (
            training_data_service
            .clear_examples(
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
                "Unable to clear the private "
                "training dataset right now."
            ),
        ) from exc

    return {
        "cleared":
            True,
    }
