export const MOCK_CRM = {
  "ACC-1001": {
    call_origin_risk: "low",
    transaction_context: { transfer_value: 250, privilege_escalation: false },
    historical_fraud_indicators: []
  },
  "ACC-2002": {
    call_origin_risk: "high",
    transaction_context: { transfer_value: 480000, privilege_escalation: true },
    historical_fraud_indicators: ["flagged_call_2026-05-01"]
  },
  "ACC-3003": {
    call_origin_risk: "medium",
    transaction_context: { transfer_value: 12000, privilege_escalation: false },
    historical_fraud_indicators: []
  }
};

export function lookupAccount(accountId) {
  return MOCK_CRM[accountId] || null;
}
