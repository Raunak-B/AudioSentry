from fastapi import APIRouter, Form, UploadFile, File, HTTPException
from app.models.speaker import extract_embedding, save_embedding

router = APIRouter(prefix="/enroll", tags=["enroll"])

@router.post("")
async def enroll_caller(caller_id: str = Form(...), audio: UploadFile = File(...)):
    try:
        audio_bytes = await audio.read()
        embedding = extract_embedding(audio_bytes)
        save_embedding(caller_id, embedding)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process enrollment: {str(e)}")

    return {
        "status": "enrolled", 
        "caller_id": caller_id
    }
