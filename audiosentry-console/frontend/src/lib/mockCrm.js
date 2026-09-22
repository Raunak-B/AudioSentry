export const MOCK_CRM = {
  "ACC-1001": {
    name: "Michael T. Chen",
    customer_since: "2018",
    auth_method: "OTP via SMS",
    ani_match: false,
    call_origin_risk: "low",
    transaction_context: { transfer_value: 250, privilege_escalation: false },
    historical_fraud_indicators: [],
    device_history: "Known iPhone 13",
    recent_high_risk: false
  },
  "ACC-2002": {
    name: "Sarah Jenkins",
    customer_since: "2023",
    auth_method: "Biometric (FaceID)",
    ani_match: true,
    call_origin_risk: "high",
    transaction_context: { transfer_value: 480000, privilege_escalation: true },
    historical_fraud_indicators: ["flagged_call_2026-05-01"],
    device_history: "Unrecognized Android",
    recent_high_risk: true
  },
  "ACC-3003": {
    name: "Robert D. Williams",
    customer_since: "2010",
    auth_method: "Password",
    ani_match: true,
    call_origin_risk: "medium",
    transaction_context: { transfer_value: 12000, privilege_escalation: false },
    historical_fraud_indicators: [],
    device_history: "Known Desktop",
    recent_high_risk: false
  }
};

export function lookupAccount(accountId) {
  return MOCK_CRM[accountId] || null;
}
