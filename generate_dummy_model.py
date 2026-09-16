import xgboost as xgb
import numpy as np
import os

# Create weights directory if it doesn't exist
os.makedirs("audiosentry-engine/weights", exist_ok=True)

# Create some dummy training data matching our 3 features
# Features: [liveness_score, speaker_similarity, is_enrolled]
X = np.array([
    [85.0, 0.92, 1.0],  # Low risk
    [40.0, 0.30, 1.0],  # High risk
    [85.0, 0.0, 0.0],   # Medium risk (unenrolled)
])
y = np.array([0.1, 0.9, 0.6]) # Dummy target risk probabilities

# Train a basic Booster
dtrain = xgb.DMatrix(X, label=y)
params = {"objective": "reg:squarederror", "max_depth": 3}
model = xgb.train(params, dtrain, num_boost_round=10)

# Save to the exact path fusion.py expects
model_path = "audiosentry-engine/weights/fusion_model.json"
model.save_model(model_path)
print(f"Dummy model successfully saved to {model_path}")