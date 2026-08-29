import asyncio
import io
import torchaudio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .api import risk, deepscan, enroll, analyze, override
from app.models.acoustic import classify
from app.models.policy import load_policy

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
    
    policy = load_policy("balanced")
    threshold = policy.get("layer1_escalation_threshold", 60)

    try:
        while True:
            audio_bytes = await websocket.receive_bytes()
            waveform, sample_rate = torchaudio.load(io.BytesIO(audio_bytes))
            risk_score = classify(waveform.squeeze().numpy())
            
            layer2_triggered = risk_score >= threshold
            
            await websocket.send_json({
                "call_id": call_id,
                "risk_score": risk_score,
                "layer2_triggered": layer2_triggered
            })
    except WebSocketDisconnect:
        pass
