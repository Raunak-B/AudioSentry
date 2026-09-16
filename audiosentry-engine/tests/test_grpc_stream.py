import grpc
import time
import sys
import os

# Ensure app is in path, and app/grpc is in path for protoc generated files
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'app', 'grpc')))

from app.grpc import voice_integrity_pb2 as pb2
from app.grpc import voice_integrity_pb2_grpc as pb2_grpc

def generate_audio_chunks(file_path):
    call_id = "test_stream_001"
    chunk_size = 32000
    timestamp_ms = 0

    with open(file_path, 'rb') as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            
            yield pb2.AudioChunk(
                call_id=call_id,
                audio_data=chunk,
                timestamp_ms=timestamp_ms
            )
            timestamp_ms += 1000  # 1 second per 32000 bytes
            time.sleep(0.5) # simulate live stream, sleep 0.5s for faster testing but still simulate streaming

def run():
    channel = grpc.insecure_channel('localhost:50051')
    stub = pb2_grpc.VoiceIntegrityServiceStub(channel)
    
    file_path = os.path.join(os.path.dirname(__file__), 'fixtures', 'adversarial_clips', 'adversarial_clip_00_Albert.wav')
    
    print(f"Streaming from {file_path}")
    responses = stub.StreamAudio(generate_audio_chunks(file_path))
    
    try:
        for response in responses:
            print(f"RiskUpdate -> call_id: {response.call_id}, risk_score: {response.risk_score}, layer2_triggered: {response.layer2_triggered}")
    except grpc.RpcError as e:
        print(f"gRPC Error: {e.code()} - {e.details()}")

if __name__ == '__main__':
    run()
