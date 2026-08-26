from fastapi import APIRouter

router = APIRouter(prefix="/deepscan", tags=["deepscan"])

@router.post("/{call_id}")
def post_deepscan(call_id: str):
    # Locked: Week 1, Day 1. Replace with real ML logic later.
    return {
        "risk_score": 82,
        "reason": "High risk: speaker-embedding mismatch (0.31 similarity) + liveness-challenge latency spike + high-value transfer flagged",
        "recommended_action": "FREEZE_TRANSACTION_ESCALATE_SUPERVISOR",
        "heatmap_png": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    }
