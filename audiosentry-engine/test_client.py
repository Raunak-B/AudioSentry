import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'app', 'grpc')))

import grpc
from app.grpc import voice_integrity_pb2, voice_integrity_pb2_grpc

def test_grpc_server():
    print("Connecting to gRPC server on :50051...")
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = voice_integrity_pb2_grpc.VoiceIntegrityServiceStub(channel)
        
        # Use the correct proto message (empty is fine for proto3)
        request = voice_integrity_pb2.DeepScanRequest()
        
        try:
            response = stub.DeepScan(request)
            print("✅ Connection Successful!")
            print(f"Risk Score: {response.risk_score}")
            print(f"Action: {response.recommended_action}")
            print(f"Reason: {response.reason}")
        except grpc.RpcError as e:
            print(f"❌ gRPC Error: {e.details()}")

if __name__ == '__main__':
    test_grpc_server()
