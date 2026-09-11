import io
import torchaudio
from fastapi import APIRouter, Form, UploadFile, File, HTTPException
from typing import Optional
from app.api.schemas import CallMetadata
from app.models.policy import select_policy_for_metadata
from app.models import fusion
from app.models.acoustic import classify

router = APIRouter(prefix="/analyze", tags=["analyze"])

@router.post("/file")
async def analyze_file(audio: UploadFile = File(...), metadata: Optional[str] = Form(None)):
    meta_dict = {}
    if metadata:
        try:
            parsed_metadata = CallMetadata.model_validate_json(metadata)
            meta_dict = parsed_metadata.model_dump()
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Invalid metadata: {str(e)}")

    # 1. Read audio bytes and run Layer 1 acoustic inference
    try:
        audio_bytes = await audio.read()
        waveform, sr = torchaudio.load(io.BytesIO(audio_bytes))
        acoustic_score = classify(waveform.numpy(), sample_rate=sr)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process audio file: {str(e)}")

    # 2. Build feature vector for fusion
    features = {
        "acoustic_score": acoustic_score,
        "transfer_value": meta_dict.get("transfer_amount", 0),
        "privilege_escalation": 1 if meta_dict.get("requires_elevated_access") else 0,
    }

    # 3. Predict final risk and select action
    active_policy = select_policy_for_metadata(meta_dict)
    result = fusion.predict_risk(features=features, policy=active_policy)
    
    return {
        **result,
        "features_extracted": {
            "acoustic_score": acoustic_score,
        },
        "heatmap_png": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    }