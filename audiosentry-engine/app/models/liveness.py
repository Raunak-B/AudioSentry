import time
import random

CHALLENGE_PHRASES = [
    "blue elephant seven",
    "orange river forty-two",
    "purple kite nineteen",
    "silver compass eighty-one"
]

def generate_challenge() -> dict:
    return {
        "phrase": random.choice(CHALLENGE_PHRASES),
        "issued_at": time.time()
    }

def score_response(issued_at: float, received_at: float, transcript_match: bool) -> float:
    latency = received_at - issued_at
    
    # Calculate latency penalty: scale between 2.5s and 7.5s to 0.0-1.0
    if latency <= 2.5:
        latency_penalty = 0.0
    elif latency >= 7.5:
        latency_penalty = 1.0
    else:
        latency_penalty = (latency - 2.5) / (7.5 - 2.5)
        
    # Calculate match penalty
    match_penalty = 0.0 if transcript_match else 0.6
    
    # Sum penalties, cap at 1.0, and round to 2 decimal places
    total_penalty = min(1.0, latency_penalty + match_penalty)
    
    return round(total_penalty, 2)
