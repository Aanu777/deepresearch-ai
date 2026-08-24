from fastapi import WebSocket


class ConnectionManager:

    def __init__(self):
        self.connections = {}

    async def connect(self, job_id: str, websocket: WebSocket):
        await websocket.accept()
        self.connections[job_id] = websocket

    def disconnect(self, job_id: str):
        if job_id in self.connections:
            del self.connections[job_id]

    async def send_progress(
        self,
        job_id: str,
        progress: int,
        step: str,
    ):
        websocket = self.connections.get(job_id)

        if websocket:

            await websocket.send_json(
                {
                    "progress": progress,
                    "step": step,
                }
            )


manager = ConnectionManager()