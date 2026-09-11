import os
import torch
import torch.nn as nn
import numpy as np
from transformers import Wav2Vec2Model

class BaselineAcousticClassifier(nn.Module):
    def __init__(self, model_name: str = "facebook/wav2vec2-base"):
        """
        Initializes the BaselineAcousticClassifier.
        Args:
            model_name (str): The Hugging Face model hub name for the base wav2vec2 model.
        """
        super(BaselineAcousticClassifier, self).__init__()
        
        # Initialize the base wav2vec2 model
        self.base_model = Wav2Vec2Model.from_pretrained(model_name)
        
        # Freeze all weights in the base wav2vec2 model
        for param in self.base_model.parameters():
            param.requires_grad = False
            
        # The hidden size of the wav2vec2-base model is 768
        hidden_size = self.base_model.config.hidden_size
        
        # Custom linear classification head for binary classification
        self.classifier_head = nn.Sequential(
            nn.Linear(hidden_size, 256),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(256, 1)  # output logits for binary classification (real vs. AI-generated)
        )

    def forward(self, input_waveform: torch.Tensor) -> torch.Tensor:
        """
        Forward pass for the acoustic classifier.
        Args:
            input_waveform (torch.Tensor): Raw 1D audio waveform tensors of shape (batch_size, sequence_length)
        Returns:
            torch.Tensor: Classification logits of shape (batch_size, 1)
        """
        # Pass raw waveforms through the frozen base model
        # outputs.last_hidden_state shape: (batch_size, sequence_length, hidden_size)
        outputs = self.base_model(input_values=input_waveform)
        
        # Average pooling over the sequence dimension to obtain a fixed-size representation
        # shape: (batch_size, hidden_size)
        pooled_output = outputs.last_hidden_state.mean(dim=1)
        
        # Pass through the custom classification head to produce logits
        # shape: (batch_size, 1)
        logits = self.classifier_head(pooled_output)
        
        return logits


# --- Wrapper Logic for main.py & Testing Integration ---

# Global singleton instance to avoid reloading the model on every single audio chunk
_model = None
_WEIGHTS_PATH = "weights/acoustic_head.pt"

def get_classifier():
    global _model
    if _model is None:
        _model = BaselineAcousticClassifier()
        if os.path.exists(_WEIGHTS_PATH):
            _model.classifier_head.load_state_dict(torch.load(_WEIGHTS_PATH, weights_only=True))
            print("Loaded trained acoustic head weights.")
        else:
            print("Warning: No trained weights found. Outputting random predictions.")
        _model.eval()
    return _model

def classify(waveform_input, sample_rate: int = 16000) -> float:
    """
    Wrapper function expected by main.py and stress tests. 
    Accepts a 1D numpy array (or tensor) waveform and returns a risk score between 0 and 100.
    """
    model = get_classifier()
    
    # Convert numpy arrays to torch tensors
    if isinstance(waveform_input, np.ndarray):
        waveform_tensor = torch.from_numpy(waveform_input)
    else:
        waveform_tensor = waveform_input
        
    # Ensure dtype is float32 for the model
    waveform_tensor = waveform_tensor.float()
    
    # Ensure the tensor has a batch dimension of 1: shape (1, sequence_length)
    if waveform_tensor.dim() == 1:
        waveform_tensor = waveform_tensor.unsqueeze(0)
        
    with torch.no_grad():
        logits = model(waveform_tensor)
        # Apply sigmoid to convert logit to a probability between 0 and 1
        probability = torch.sigmoid(logits).item()
        
    # Scale to a 0-100 risk score
    risk_score = round(probability * 100, 1)
    return risk_score