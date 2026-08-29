FEATURE_ORDER = [
    "acoustic_score",
    "prosody_score",
    "speaker_similarity",
    "liveness_score",
    "llm_semantic_score",
    "call_origin_risk",
    "transfer_value",
    "privilege_escalation",
    "historical_fraud_count"
]

def _pick_action(risk_score: int, policy: dict) -> str:
    thresholds = policy.get("fusion_thresholds", {})
    
    if risk_score >= thresholds.get("freeze_transaction_escalate_supervisor", float('inf')):
        return "FREEZE_TRANSACTION_ESCALATE_SUPERVISOR"
    elif risk_score >= thresholds.get("initiate_callback", float('inf')):
        return "INITIATE_CALLBACK"
    elif risk_score >= thresholds.get("require_mfa_stepup", float('inf')):
        return "REQUIRE_MFA_STEPUP"
        
    return "APPROVE"

def predict_risk(features: dict, policy: dict) -> dict:
    # Placeholder for Week 3 XGBoost logic
    risk_score = 82
    reason = "Placeholder reason (Week 2 stub)"
    
    recommended_action = _pick_action(risk_score, policy)
    
    return {
        "risk_score": risk_score,
        "reason": reason,
        "recommended_action": recommended_action
    }
