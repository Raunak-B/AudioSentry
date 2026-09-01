from pydantic import BaseModel
from typing import Optional

class TransactionContext(BaseModel):
    transfer_value: int
    privilege_escalation: bool

class CallMetadata(BaseModel):
    call_origin_risk: str
    transaction_context: TransactionContext
    historical_fraud_indicators: list[str]

class RiskUpdate(BaseModel):
    call_id: str
    risk_score: float
    layer2_triggered: bool
    transcript_fragment: Optional[str] = None