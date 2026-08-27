import torch
import torch.nn as nn
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
