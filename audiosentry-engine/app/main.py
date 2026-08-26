import asyncio
import random
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from .api import risk, deepscan, enroll, analyze, override

app = FastAPI(title="AudioSentry Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(risk.router)
app.include_router(deepscan.router)
app.include_router(enroll.router)
app.include_router(analyze.router)
app.include_router(override.router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "audiosentry-engine"}

@app.websocket("/stream/{call_id}")
async def websocket_endpoint(websocket: WebSocket, call_id: str):
    await websocket.accept()
    risk_score = 10
    try:
        while True:
            # Week 1 Days 3-5: replace with real Layer 1 model output
            layer2_triggered = risk_score > 60
            await websocket.send_json({
                "call_id": call_id,
                "risk_score": risk_score,
                "layer2_triggered": layer2_triggered
            })
            
            risk_score = min(100, risk_score + random.randint(5, 15))
            await asyncio.sleep(2)
    except Exception:
        pass
