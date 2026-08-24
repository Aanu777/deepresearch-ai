from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websocket.manager import manager

router = APIRouter()


@router.websocket("/ws/{job_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    job_id: str,
):
    """
    WebSocket endpoint for live research updates.
    """

    await manager.connect(job_id, websocket)

    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()

    except WebSocketDisconnect:
        manager.disconnect(job_id)

    except Exception:
        manager.disconnect(job_id)