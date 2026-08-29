# AudioSentry API Contracts — v1
Locked: Week 1, Day 1. Any change after this point is a `protos/`-style PR, reviewed by both developers.

## GET /risk/{call_id}
## POST /deepscan/{call_id}
Both return the same shape:
```json
{
  "risk_score": 82,
  "reason": "High risk: speaker-embedding mismatch (0.31 similarity) + liveness-challenge latency spike + high-value transfer flagged",
  "recommended_action": "FREEZE_TRANSACTION_ESCALATE_SUPERVISOR",
  "heatmap_png": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```
`heatmap_png` is only present when the acoustic layer actually flagged an anomaly.

`recommended_action` enum: `APPROVE` | `REQUIRE_MFA_STEPUP` | `INITIATE_CALLBACK` | `FREEZE_TRANSACTION_ESCALATE_SUPERVISOR`

## POST /enroll
Request: multipart form — `caller_id` (string) + `audio` (file, 10–20s clip)
Response:
```json
{ "status": "enrolled", "caller_id": "ACC-1001" }
```

## POST /analyze/file
Request: multipart form — `audio` (file) + optional `metadata` (JSON string, see below)
Response: same shape as `/risk/{call_id}`

## POST /override/{call_id}
Request:
```json
{ "reason": "confirmed false positive", "agent_id": "AGT-04" }
```
Response:
```json
{ "status": "logged", "call_id": "CALL-9911" }
```

## WS /stream/{call_id}
Server pushes a message every ~2 seconds:
```json
{ "call_id": "CALL-9911", "risk_score": 47, "layer2_triggered": false }
```

## Metadata schema (embedded in requests that need context, Section 4.6)
```json
{
  "call_origin_risk": "low | medium | high",
  "transaction_context": { "transfer_value": 480000, "privilege_escalation": true },
  "historical_fraud_indicators": ["flagged_call_2026-05-01"]
}
```