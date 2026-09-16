from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/override", tags=["override"])

class OverrideRequest(BaseModel):
    notes: str
    decision: str
    timestamp: str
    agent_id: str = "agent-1"

@router.post("/{call_id}")
def override_risk(call_id: str, request: OverrideRequest):
    # Locked: Week 1, Day 1. Replace with real ML logic later.
    return {
        "status": "logged",
        "call_id": "CALL-9911"
    }
