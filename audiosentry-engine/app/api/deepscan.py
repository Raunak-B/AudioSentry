from fastapi import APIRouter
from app.api.schemas import CallMetadata
from app.models.policy import select_policy_for_metadata, load_policy
from app.models import fusion
from app.models.xai import generate_heatmap
from app.models.acoustic import get_classifier, classify
import torch
from app.audio_state import get_buffer

router = APIRouter(prefix="/deepscan", tags=["deepscan"])

@router.post("/{call_id}")
def post_deepscan(call_id: str, metadata: CallMetadata):
    meta_dict = metadata.model_dump()
    
    try:
        call_origin_risk = float(meta_dict.get("call_origin_risk", 1.0))
    except ValueError:
        call_origin_risk = 1.0

    features = {
        "call_origin_risk": call_origin_risk,
        "transfer_value": meta_dict.get("transaction_context", {}).get("transfer_value", 0),
        "privilege_escalation": 1 if meta_dict.get("transaction_context", {}).get("privilege_escalation") else 0,
        "historical_fraud_count": len(meta_dict.get("historical_fraud_indicators", [])),
    }
    
    result = fusion.predict_risk(features, policy=load_policy("balanced"))
    
    heatmap_png = None
    
    real_tensor = get_buffer(call_id)
    if real_tensor is not None:
        # Evaluate acoustic risk specifically, isolated from metadata
        acoustic_score = classify(real_tensor)
        policy = load_policy("balanced")
        
        if acoustic_score > policy.get("layer1_escalation_threshold", 60):
            heatmap_png = generate_heatmap(get_classifier(), real_tensor.unsqueeze(0))
    
    return {
        "risk_score": result["risk_score"],
        "reason": result["reason"],
        "recommended_action": result["recommended_action"],
        "heatmap_png": heatmap_png
    }
