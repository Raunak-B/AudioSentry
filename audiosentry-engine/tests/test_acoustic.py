import pytest
import torch
from app.models.acoustic import BaselineAcousticClassifier

@pytest.fixture(scope="module")
def model():
    """Fixture to instantiate the model once for the test module."""
    return BaselineAcousticClassifier()

def test_model_initialization(model):
    """Verifies the BaselineAcousticClassifier instantiates correctly."""
    assert model is not None
    assert isinstance(model, BaselineAcousticClassifier)
    assert hasattr(model, "base_model")
    assert hasattr(model, "classifier_head")

def test_frozen_weights(model):
    """
    Verifies requires_grad is False for all base_model parameters,
    and True for all classifier_head parameters.
    """
    # Check that base model is frozen
    for name, param in model.base_model.named_parameters():
        assert not param.requires_grad, f"Parameter '{name}' in base_model should be frozen (requires_grad=False)."
        
    # Check that classifier head is trainable
    for name, param in model.classifier_head.named_parameters():
        assert param.requires_grad, f"Parameter '{name}' in classifier_head should be trainable (requires_grad=True)."

def test_forward_pass_shape(model):
    """
    Generates a dummy audio waveform tensor of shape (2, 16000) representing 
    a batch of 2 one-second clips at 16kHz, and asserts output logits shape is (2, 1).
    """
    batch_size = 2
    sequence_length = 16000
    
    # Create a dummy input tensor
    dummy_waveform = torch.randn(batch_size, sequence_length)
    
    # Perform forward pass
    # Using torch.no_grad() is good practice for inference/forward tests
    with torch.no_grad():
        logits = model(dummy_waveform)
        
    # Verify the output shape
    assert logits.shape == (batch_size, 1), f"Expected output shape {(batch_size, 1)}, but got {logits.shape}"
