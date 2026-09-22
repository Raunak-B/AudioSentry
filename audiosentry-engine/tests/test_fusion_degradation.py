import copy
from app.models import fusion
from app.models.policy import load_policy


def get_base_features():
    return {
        "acoustic_score": 85.0,
        "prosody_score": 75.5,
        "speaker_similarity": 0.92,
        "liveness_score": 90.0,
        "llm_semantic_score": 60.0,
        "call_origin_risk": 0.2,
        "transfer_value": 500.0,
        "privilege_escalation": 0,
        "historical_fraud_count": 0
    }


def test_fusion_handles_missing_liveness():
    features = get_base_features()
    features["liveness_score"] = None
    policy = load_policy("balanced")
    
    result = fusion.predict_risk(features, policy)
    
    assert isinstance(result, dict)
    assert "risk_score" in result
    assert "recommended_action" in result


def test_fusion_handles_missing_prosody():
    features = get_base_features()
    features["prosody_score"] = None
    policy = load_policy("balanced")
    
    result = fusion.predict_risk(features, policy)
    
    assert isinstance(result, dict)
    assert "risk_score" in result
    assert "recommended_action" in result


def test_fusion_handles_missing_enrollment():
    features = get_base_features()
    features["speaker_similarity"] = None
    policy = load_policy("balanced")
    
    result = fusion.predict_risk(features, policy)
    
    assert isinstance(result, dict)
    assert "risk_score" in result
    assert "recommended_action" in result


def test_fusion_handles_multiple_missing_signals():
    features = get_base_features()
    features["liveness_score"] = None
    features["speaker_similarity"] = None
    policy = load_policy("balanced")
    
    result = fusion.predict_risk(features, policy)
    
    assert isinstance(result, dict)
    assert "risk_score" in result
    assert "recommended_action" in result


def test_fusion_handles_missing_crm_metadata():
    features = get_base_features()
    # Intentionally drop CRM metadata
    features["call_origin_risk"] = None
    features["transfer_value"] = None
    features["privilege_escalation"] = None
    features["historical_fraud_count"] = None
    
    policy = load_policy("balanced")
    
    result = fusion.predict_risk(features, policy)
    
    assert isinstance(result, dict)
    assert "risk_score" in result
    assert "recommended_action" in result
