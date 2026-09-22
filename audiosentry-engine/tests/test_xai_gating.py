from unittest.mock import patch, MagicMock
from app.api.deepscan import post_deepscan
from app.api.schemas import CallMetadata

def get_dummy_metadata():
    return CallMetadata(
        call_origin_risk="low",
        transaction_context={"transfer_value": 0, "privilege_escalation": False},
        historical_fraud_indicators=[]
    )

@patch('app.api.deepscan.classify')
@patch('app.api.deepscan.get_buffer')
@patch('app.api.deepscan.generate_heatmap')
def test_xai_gating_bypasses_low_risk_samples(mock_gen_heatmap, mock_get_buffer, mock_classify):
    mock_get_buffer.return_value = MagicMock()
    mock_classify.return_value = 40.0 # Below default layer1_escalation_threshold (60)
    
    result = post_deepscan("dummy_call_id", get_dummy_metadata())
    
    mock_gen_heatmap.assert_not_called()
    assert result["heatmap_png"] is None

@patch('app.api.deepscan.classify')
@patch('app.api.deepscan.get_buffer')
@patch('app.api.deepscan.generate_heatmap')
def test_xai_gating_triggers_high_risk_samples(mock_gen_heatmap, mock_get_buffer, mock_classify):
    mock_get_buffer.return_value = MagicMock()
    mock_classify.return_value = 90.0 # Above threshold
    mock_gen_heatmap.return_value = "base64_heatmap_string"
    
    result = post_deepscan("dummy_call_id", get_dummy_metadata())
    
    mock_gen_heatmap.assert_called_once()
    assert result["heatmap_png"] == "base64_heatmap_string"
