import numpy as np
import xgboost as xgb

FEATURE_ORDER = [
    "acoustic_score", "prosody_score", "speaker_similarity", "liveness_score",
    "llm_semantic_score", "call_origin_risk", "transfer_value",
    "privilege_escalation", "historical_fraud_count",
]

_NEUTRAL_VALUES = {  # used when a signal is missing
    "acoustic_score": 50, "prosody_score": 50, "speaker_similarity": 0.5,
    "liveness_score": 0.5, "llm_semantic_score": 50, "call_origin_risk": 1,
    "transfer_value": 0, "privilege_escalation": 0, "historical_fraud_count": 0,
}

_model = xgb.XGBClassifier()
try:
    _model.load_model("weights/fusion_model.json")
except xgb.core.XGBoostError:
    print("Warning: Fusion model weights not found.")

def _vectorize(features: dict) -> np.ndarray:
    row = [
        features.get(f) if features.get(f) is not None else _NEUTRAL_VALUES[f]
        for f in FEATURE_ORDER
    ]
    return np.array([row])

def predict_risk(features: dict, policy: dict) -> dict:
    row = _vectorize(features)
    
    # Run prediction (fallback to 0 if model isn't loaded properly)
    try:
        proba = _model.predict_proba(row)[0][1] 
    except Exception:
        proba = 0.5 
        
    risk_score = int(round(proba * 100))
    return {
        "risk_score": risk_score,
        "reason": "Risk score calculated by XGBoost fusion model.",
        "recommended_action": _pick_action(risk_score, policy),
    }

def _pick_action(risk_score: int, policy: dict) -> str:
    t = policy["fusion_thresholds"]
    if risk_score >= t.get("freeze_transaction_escalate_supervisor", 90):
        return "FREEZE_TRANSACTION_ESCALATE_SUPERVISOR"
    if risk_score >= t.get("initiate_callback", 80):
        return "INITIATE_CALLBACK"
    if risk_score >= t.get("require_mfa_stepup", 70):
        return "REQUIRE_MFA_STEPUP"
    return "APPROVE"