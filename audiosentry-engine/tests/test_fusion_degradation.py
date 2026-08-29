import pytest
from app.models.policy import load_policy
from app.models.fusion import predict_risk

def test_fusion_handles_missing_enrollment():
    policy = load_policy("balanced")
    
    features = {
        "acoustic_score": 85.0,
        "prosody_score": 92.0,
        "speaker_similarity": None,  # Simulating an unknown caller
        "liveness_score": 75.0,
        "llm_semantic_score": 88.0,
        "call_origin_risk": 15.0,
        "transfer_value": 500.0,
        "privilege_escalation": 0.0,
        "historical_fraud_count": 0.0
    }
    
    result = predict_risk(features, policy)
    
    assert "risk_score" in result
    
    valid_actions = {
        "APPROVE",
        "REQUIRE_MFA_STEPUP",
        "INITIATE_CALLBACK",
        "FREEZE_TRANSACTION_ESCALATE_SUPERVISOR"
    }
    assert result.get("recommended_action") in valid_actions
