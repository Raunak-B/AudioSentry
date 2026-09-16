import xgboost as xgb
import numpy as np
import os

os.makedirs("weights", exist_ok=True)

# 9 features matching FEATURE_ORDER
X = np.array([
    [70, 60, 0.85, 0.2, 55, 2, 5000, 0, 0],
    [90, 80, 0.10, 0.9, 85, 3, 200000, 1, 1],
])
y = np.array([0, 1])

dtrain = xgb.DMatrix(X, label=y)
params = {"objective": "binary:logistic", "max_depth": 3}
model = xgb.train(params, dtrain, num_boost_round=5)

model.save_model("weights/fusion_model.json")
print("9-feature dummy model saved!")
