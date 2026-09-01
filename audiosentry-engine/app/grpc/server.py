import grpc
from concurrent import futures

from app.grpc import voice_integrity_pb2 as pb2
from app.grpc import voice_integrity_pb2_grpc as pb2_grpc
from app.models.policy import load_policy

# Mock fusion until Week 3
def _mock_predict_risk():
    return {
        "risk_score": 82,
        "reason": "High risk: speaker-embedding mismatch (0.31 similarity) + liveness-challenge latency spike + high-value transfer flagged",
        "recommended_action": "FREEZE_TRANSACTION_ESCALATE_SUPERVISOR",
    }

class VoiceIntegrityService(pb2_grpc.VoiceIntegrityServiceServicer):
    def AnalyzeFile(self, request, context):
        result = _mock_predict_risk()
        return pb2.RiskResult(
            risk_score=result["risk_score"],
            reason=result["reason"],
            recommended_action=getattr(pb2.RecommendedAction, result["recommended_action"]),
        )

    def StreamAudio(self, request_iterator, context):
        for chunk in request_iterator:
            score = 47
             
            yield pb2.RiskUpdate(
                call_id=chunk.call_id, 
                risk_score=score, 
                layer2_triggered=score > 60,
                transcript_fragment=chunk.transcript_fragment 
            )

    def Enroll(self, request, context):
        return pb2.EnrollmentAck(status="enrolled", caller_id=request.caller_id)

    def DeepScan(self, request, context):
        result = _mock_predict_risk()
        return pb2.RiskResult(
            risk_score=result["risk_score"],
            reason=result["reason"],
            recommended_action=getattr(pb2.RecommendedAction, result["recommended_action"]),
        )

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