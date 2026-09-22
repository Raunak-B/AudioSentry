import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))


import grpc
from concurrent import futures
import base64
import torch
import torch.nn as nn
import logging
import json


from app.grpc import voice_integrity_pb2 as pb2
from app.grpc import voice_integrity_pb2_grpc as pb2_grpc
from app.models.policy import load_policy
from app.models import fusion as fusion_engine
from app.models.xai import generate_heatmap
from app.audio_state import update_buffer
from app.models import acoustic
import numpy as np

dummy_model = nn.Linear(10, 1)
dummy_tensor = torch.randn(1, 1, 10, 10)

class VoiceIntegrityService(pb2_grpc.VoiceIntegrityServiceServicer):
    def _map_risk(self, score: float):
        if score > 75:
            return "High risk detected by XGBoost fusion", "FREEZE_TRANSACTION_ESCALATE_SUPERVISOR"
        elif score > 50:
            return "Medium risk detected", "REQUIRE_MFA_STEPUP"
        else:
            return "Low risk", "APPROVE"

    def AnalyzeFile(self, request, context):
        features = json.loads(request.metadata_json) if request.metadata_json else {}
        result = fusion_engine.predict_risk(features=features, policy=load_policy("strict"))
        score, reason, action = result["risk_score"], result["reason"], result["recommended_action"]
        
        response_kwargs = {
            "risk_score": int(score),
            "reason": reason,
            "recommended_action": getattr(pb2.RecommendedAction, action),
        }
        
        if score > 60:
            heatmap_b64 = generate_heatmap(dummy_model, dummy_tensor)
            heatmap_bytes = base64.b64decode(heatmap_b64.split(",")[1])
            response_kwargs["heatmap_png"] = heatmap_bytes
            
        return pb2.RiskResult(**response_kwargs)

    def StreamAudio(self, request_iterator, context):
        for chunk in request_iterator:
            try:
                # 1. Direct Float32 Decode (Frontend now sends raw PCM bytes)
                raw_array = np.frombuffer(chunk.audio_data, dtype=np.float32)
                tensor_data = torch.from_numpy(raw_array)
                update_buffer(chunk.call_id, tensor_data)
                
                # 2. Evaluate Layer 1 Acoustic Score
                a_score = acoustic.classify(tensor_data)
                
                # 3. Extract Features (imputing None for missing signals)
                features = {
                    "acoustic_score": a_score,
                    "liveness_score": 85.0, # Placeholder if still stubbed
                    "speaker_similarity": None,
                    "llm_semantic_score": None,
                    "prosody_score": None
                }
                
                result = fusion_engine.predict_risk(features=features, policy=load_policy("strict"))
                
                yield pb2.RiskUpdate(
                    call_id=chunk.call_id, 
                    risk_score=int(result["risk_score"]), 
                    layer2_triggered=int(a_score) > 60
                )
            except Exception as e:
                logging.error(f"Error processing chunk for call_id {getattr(chunk, 'call_id', 'unknown')}: {e}")
                continue

    def Enroll(self, request, context):
        return pb2.EnrollmentAck(status="enrolled", caller_id=request.caller_id)

    def DeepScan(self, request, context):
        features = json.loads(request.metadata_json) if request.metadata_json else {}
        result = fusion_engine.predict_risk(features=features, policy=load_policy("strict"))
        score, reason, action = result["risk_score"], result["reason"], result["recommended_action"]
        
        response_kwargs = {
            "risk_score": int(score),
            "reason": reason,
            "recommended_action": getattr(pb2.RecommendedAction, action),
        }
        
        if score > 60:
            heatmap_b64 = generate_heatmap(dummy_model, dummy_tensor)
            heatmap_bytes = base64.b64decode(heatmap_b64.split(",")[1])
            response_kwargs["heatmap_png"] = heatmap_bytes
            
        return pb2.RiskResult(**response_kwargs)

    def Override(self, request, context):
        return pb2.OverrideAck(status="logged", call_id=request.call_id)


def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    pb2_grpc.add_VoiceIntegrityServiceServicer_to_server(VoiceIntegrityService(), server)
    server.add_insecure_port("[::]:50051")
    server.start()
    print("gRPC VoiceIntegrityService listening on :50051")
    server.wait_for_termination()


if __name__ == "__main__":
    serve()