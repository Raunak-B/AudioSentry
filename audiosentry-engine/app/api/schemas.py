from pydantic import BaseModel

class TransactionContext(BaseModel):
    transfer_value: int
    privilege_escalation: bool

class CallMetadata(BaseModel):
    call_origin_risk: str
    transaction_context: TransactionContext
    historical_fraud_indicators: list[str]
