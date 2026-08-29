from fastapi import APIRouter
from app.api.schemas import CallMetadata
from app.models.policy import select_policy_for_metadata
from app.models import fusion

router = APIRouter(prefix="/deepscan", tags=["deepscan"])

@router.post("/{call_id}")
def post_deepscan(call_id: str, metadata: CallMetadata):
    meta_dict = metadata.model_dump()
    active_policy = select_policy_for_metadata(meta_dict)
    
    result = fusion.predict_risk(features={}, policy=active_policy)
    
    return {
        **result,
        "heatmap_png": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
    }
