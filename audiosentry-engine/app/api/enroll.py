from fastapi import APIRouter, Form, UploadFile, File

router = APIRouter(prefix="/enroll", tags=["enroll"])

@router.post("/")
def enroll_caller(caller_id: str = Form(...), audio: UploadFile = File(...)):
    # Locked: Week 1, Day 1. Replace with real ML logic later.
    return {
        "status": "enrolled", 
        "caller_id": "ACC-1001"
    }
