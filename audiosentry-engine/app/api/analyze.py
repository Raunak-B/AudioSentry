from fastapi import APIRouter, Form, UploadFile, File, HTTPException
from typing import Optional
from app.api.schemas import CallMetadata
from app.models.policy import select_policy_for_metadata
from app.models import fusion

router = APIRouter(prefix="/analyze", tags=["analyze"])

@router.post("/file")
def analyze_file(audio: UploadFile = File(...), metadata: Optional[str] = Form(None)):
    meta_dict = {}
    if metadata:
        try:
            parsed_metadata = CallMetadata.model_validate_json(metadata)
            meta_dict = parsed_metadata.model_dump()
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Invalid metadata: {str(e)}")

    active_policy = select_policy_for_metadata(meta_dict)
    result = fusion.predict_risk(features={}, policy=active_policy)
    
    return {
        **result,
        "heatmap_png": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    }
