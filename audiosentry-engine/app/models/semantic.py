import json
import os
import openai

client = openai.OpenAI(api_key=os.environ.get("LLM_API_KEY"))

_SYSTEM_PROMPT = """You are a fraud-detection assistant. You will be given a phone call TRANSCRIPT ONLY — never audio. Score it 0-100 for social-engineering risk based on: urgency language, secrecy requests, pressure to bypass normal verification steps, and requests to skip standard process. Reply with strict JSON only, no prose, no markdown: {"semantic_risk_score": <0-100>, "flags": ["<short phrase>", ...]}"""

def analyze_transcript(transcript: str) -> dict:
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": transcript}
        ],
        max_tokens=200,
        response_format={"type": "json_object"}
    )
    
    response_content = response.choices[0].message.content
    return json.loads(response_content)
