import os
import json
import glob
import torch
import torch.nn as nn
import torch.optim as optim
import torchaudio
import numpy as np
from sklearn.metrics import roc_curve
from app.models.acoustic import get_classifier

# Define our lightweight training directories
DATA_DIR = "data/train"
REAL_DIR = os.path.join(DATA_DIR, "real")
FAKE_DIR = os.path.join(DATA_DIR, "fake")
WEIGHTS_PATH = "weights/acoustic_head.pt"

class SpoofDataset(torch.utils.data.Dataset):
    def __init__(self):
        self.files = []
        self.labels = []
        
        for path in glob.glob(os.path.join(REAL_DIR, "*.wav")):
            self.files.append(path)
            self.labels.append(0.0) # 0 = real
            
        for path in glob.glob(os.path.join(FAKE_DIR, "*.wav")):
            self.files.append(path)
            self.labels.append(1.0) # 1 = synthetic
            
    def __len__(self):
        return len(self.files)

    def __getitem__(self, idx):
        waveform, sr = torchaudio.load(self.files[idx])
        
        # Resample to 16kHz (Wav2Vec2 requirement)
        if sr != 16000:
            resampler = torchaudio.transforms.Resample(sr, 16000)
            waveform = resampler(waveform)
            
        # Ensure mono channel
        if waveform.shape[0] > 1:
            waveform = waveform.mean(dim=0, keepdim=True)
            
        return waveform, self.labels[idx]

def train():
    os.makedirs(REAL_DIR, exist_ok=True)
    os.makedirs(FAKE_DIR, exist_ok=True)
    
    dataset = SpoofDataset()
    if len(dataset) == 0:
        print(f"Error: No data found. Drop .wav files into {REAL_DIR} and {FAKE_DIR}")
        return

    # Batch size 1 avoids padding complexities with variable length audio
    loader = torch.utils.data.DataLoader(dataset, batch_size=1, shuffle=True)
    
    model = get_classifier()
    model.train()
    
    # Use BCEWithLogitsLoss because your model outputs raw logits
    criterion = nn.BCEWithLogitsLoss()
    optimizer = optim.Adam(model.classifier_head.parameters(), lr=1e-3)
    
    print(f"Starting training on {len(dataset)} samples...")
    
    for epoch in range(5): # 5 epochs is plenty to overfit a tiny dataset
        epoch_loss = 0
        all_preds = []
        all_labels = []
        
        for waveform, label in loader:
            optimizer.zero_grad()
            
            # Squeeze channel dim: (1, 1, seq_len) -> (1, seq_len)
            if waveform.dim() == 3:
                waveform = waveform.squeeze(1)
                
            logits = model(waveform)
            loss = criterion(logits.squeeze(-1), label.float())
            
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
            # Calculate probability for EER via sigmoid
            prob = torch.sigmoid(logits).item()
            all_preds.append(prob)
            all_labels.append(label.item())
            
        print(f"Epoch {epoch+1}/5 | Loss: {epoch_loss/len(loader):.4f}")

    # Calculate Equal Error Rate (EER)
    fpr, tpr, thresholds = roc_curve(all_labels, all_preds)
    fnr = 1 - tpr
    eer = fpr[np.nanargmin(np.absolute(fnr - fpr))]
    
    print(f"\nTraining Complete. Equal Error Rate (EER): {eer:.4f}")
    
    # Save the trained head weights
    os.makedirs("weights", exist_ok=True)
    torch.save(model.classifier_head.state_dict(), WEIGHTS_PATH)
    
    with open("weights/results.json", "w") as f:
        json.dump({"eer": eer, "samples": len(dataset)}, f)
        
    print(f"Weights saved to {WEIGHTS_PATH}")

if __name__ == "__main__":
    train()