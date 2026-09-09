import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sendSmsAlert, sendSlackAlert } from "./alerts.js";
import { lookupAccount } from "./mockCrm.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false })); // Twilio posts form-encoded
app.use(express.json());

// In-memory session state — fine for a 4-week demo, swap for Redis in production
// Shape: call_id -> { status, current_risk, policy_profile, transcript_buffer }
const sessions = new Map();

export function initializeSession(callId, initialData = {}) {
    const session = {
        status: "active",
        current_risk: 0,
        policy_profile: "balanced",
        transcript_buffer: "",
        ...initialData
    };
    sessions.set(callId, session);
    return session;
}

// --- Week 2, Days 6-8: BFF Session State Management ---
app.post("/api/session/init", (req, res) => {
    const { callId, accountId = "ACC-1001" } = req.body;

    const account = lookupAccount(accountId);
    let policyProfile = "lenient";
    
    if (account && account.transaction_context) {
        const { privilege_escalation, transfer_value } = account.transaction_context;
        if (privilege_escalation === true || transfer_value > 100000) {
            policyProfile = "strict";
        } else if (transfer_value > 1000) {
            policyProfile = "balanced";
        }
    }

    initializeSession(callId, {
        policy_profile: policyProfile,
        accountId: accountId,
    });

    console.log(`Session initialized for call: ${callId} with policy: ${policyProfile}`);
    res.json({ status: "initialized", callId, policy_profile: policyProfile });
});

app.get("/session/:call_id", (req, res) => {
    const session = sessions.get(req.params.call_id);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
});

// --- Week 1, Days 3-5: Manual Test Alert Route ---
app.post("/test-alert", async (req, res) => {
    const callId = req.body.call_id || "UNKNOWN";
    const session = sessions.get(callId);
    const riskScore = session ? session.current_risk : "N/A";
    const reason = "Manual test alert triggered via console.";
    
    const testMessage = `TEST: AudioSentry manual alert triggered for ${callId} (Risk: ${riskScore}).`;

    console.log("Dispatching manual test alerts...");
    await sendSlackAlert(callId, riskScore, reason);

    if (process.env.ALERT_PHONE_NUMBER) {
        await sendSmsAlert(process.env.ALERT_PHONE_NUMBER, testMessage);
    } else {
        console.warn("No ALERT_PHONE_NUMBER set in .env; skipping SMS dispatch.");
    }

    res.json({ status: "alerts_dispatched" });
});

// --- Day 1-2 Scaffold: Twilio Webhook (Currently bypassed due to trial limits) ---
app.post("/webhooks/twilio", (req, res) => {
    console.log("Twilio webhook hit:", req.body);
    // TwiML response: tell Twilio to start streaming this call's audio to our WS
    res.type("text/xml");
    res.send(
        `<Response><Start><Stream url="wss://${process.env.PUBLIC_WS_HOST}/stream" /></Start></Response>`
    );
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "audiosentry-bff" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`AudioSentry BFF listening on :${PORT}`));