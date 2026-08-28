import io
import sqlite3
from pathlib import Path
from typing import Optional
import numpy as np
import torch
import torchaudio
import torchaudio.transforms as T
from speechbrain.inference.speaker import EncoderClassifier

# Database goes in weights/ as per reference architecture
WEIGHTS_DIR = Path(__file__).resolve().parent.parent.parent / "weights"
WEIGHTS_DIR.mkdir(parents=True, exist_ok=True)
DB_PATH = WEIGHTS_DIR / "enrollments.db"

# Initialize SQLite database
def _init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS enrollments (
                caller_id TEXT PRIMARY KEY,
                embedding BLOB
            )
            """
        )

_init_db()

# Load the ECAPA-TDNN model from Hugging Face once at module load
classifier = EncoderClassifier.from_hparams(
    source="speechbrain/spkrec-ecapa-voxceleb",
    savedir="weights/spkrec-ecapa-voxceleb" # Saves downloaded weights to our local weights dir
)

def extract_embedding(audio_bytes: bytes) -> np.ndarray:
    """
    Extracts a speaker embedding from audio bytes using ECAPA-TDNN.
    Returns a 1D numpy array representing the voiceprint.
    """
    # Load audio from bytes
    waveform, sample_rate = torchaudio.load(io.BytesIO(audio_bytes))
    
    # The ECAPA-TDNN model expects 16kHz audio
    if sample_rate != 16000:
        resampler = T.Resample(orig_freq=sample_rate, new_freq=16000, dtype=waveform.dtype)
        waveform = resampler(waveform)

    # Move to appropriate device if needed; defaults to CPU via from_hparams above
    with torch.no_grad():
        embeddings = classifier.encode_batch(waveform)
    
    # embeddings shape is usually (batch, 1, embedding_size) e.g., (1, 1, 192)
    # Squeeze down to a 1D numpy array
    embedding_np = embeddings.squeeze().cpu().numpy()
    
    # Ensure it's explicitly float32 for consistency
    return embedding_np.astype(np.float32)

def save_embedding(caller_id: str, embedding: np.ndarray):
    """
    Persists the caller's embedding to the local SQLite database.
    Overwrites if the caller_id already exists.
    """
    # Lightweight serialization as per blueprint
    blob = embedding.tobytes()
    
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "INSERT OR REPLACE INTO enrollments (caller_id, embedding) VALUES (?, ?)",
            (caller_id, blob)
        )

def get_embedding(caller_id: str) -> Optional[np.ndarray]:
    """
    Retrieves the caller's embedding from SQLite.
    Returns None if no enrollment exists for explicit fallback handling.
    """
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute("SELECT embedding FROM enrollments WHERE caller_id = ?", (caller_id,))
        row = cursor.fetchone()
        
        if row is None:
            return None
            
        # Deserialization as per blueprint
        return np.frombuffer(row[0], dtype=np.float32)
