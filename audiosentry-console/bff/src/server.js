import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { lookupAccount } from "./mockCrm.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// In-memory session state — fine for a 4-week demo, swap for Redis in production
// Shape: call_id -> { status, current_risk, policy_profile, transcript_buffer }
const sessions = new Map();
const alertThrottleCache = new Map();

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
    const callId = req.headers["x-call-id"] || req.body.callId;
    const { accountId = "ACC-1001" } = req.body;

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

    console.log(JSON.stringify({
        call_id: callId,
        message: `Session initialized with policy: ${policyProfile}`
    }));
    res.json({ status: "initialized", callId, policy_profile: policyProfile });
});

app.get("/session/:call_id", (req, res) => {
    const session = sessions.get(req.params.call_id);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
});

async function sendSlackAlert({ call_id, acoustic_score, metadata }) {
    if (!process.env.SLACK_WEBHOOK_URL) {
        console.warn(JSON.stringify({
            call_id,
            message: "No SLACK_WEBHOOK_URL set in .env; skipping Slack dispatch."
        }));
        return null;
    }

    try {
        const payload = {
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "🚨 High-Risk Synthetic Audio Detected",
                        emoji: true
                    }
                },
                {
                    type: "section",
                    fields: [
                        {
                            type: "mrkdwn",
                            text: `*Call ID:*\n${call_id}`
                        },
                        {
                            type: "mrkdwn",
                            text: `*Acoustic Score:*\n${acoustic_score}`
                        }
                    ]
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*Metadata:*\n\`\`\`${JSON.stringify(metadata, null, 2)}\`\`\``
                    }
                }
            ]
        };

        const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error(JSON.stringify({
                call_id,
                message: `Slack Alert failed with status ${response.status}: ${response.statusText}`
            }));
        }
        return response;
    } catch (error) {
        console.error(JSON.stringify({
            call_id,
            message: `Slack Alert failed: ${error.message}`
        }));
        return null;
    }
}

// --- Week 1, Days 3-5: Manual Test Alert Route ---
app.post("/test-alert", async (req, res) => {
    const callId = req.headers["x-call-id"] || req.body.call_id || "UNKNOWN";
    const session = sessions.get(callId);
    const riskScore = session ? session.current_risk : "N/A";
    const reason = "Manual test alert triggered via console.";
    
    console.log(JSON.stringify({
        call_id: callId,
        message: "Dispatching manual test alerts..."
    }));
    await sendSlackAlert({
        call_id: callId,
        acoustic_score: riskScore,
        metadata: { reason, session_status: session ? session.status : "unknown" }
    });

    res.json({ status: "alerts_dispatched" });
});

// --- Final Analysis Payload Handler from Engine ---
app.post("/webhooks/engine", (req, res) => {
    const { call_id, acoustic_score, metadata } = req.body;

    const session = sessions.get(call_id);
    if (session) {
        session.current_risk = acoustic_score;
    }

    if (acoustic_score > 0.85) {
        const now = Date.now();
        const lastAlertTime = alertThrottleCache.get(call_id) || 0;

        // Throttle Slack alerts to once every 60 seconds per call_id
        if (now - lastAlertTime > 60000) {
            alertThrottleCache.set(call_id, now);
            // Fire-and-forget async execution
            sendSlackAlert({ call_id, acoustic_score, metadata }).catch(err => {
                console.error(JSON.stringify({
                    call_id,
                    message: `Fire-and-forget Slack alert failed: ${err.message}`
                }));
            });
        } else {
            console.log(JSON.stringify({
                call_id,
                message: `Throttled Slack alert (last alert was ${Math.round((now - lastAlertTime) / 1000)}s ago)`
            }));
        }
    }

    res.json({ status: "received" });
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "audiosentry-bff" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`AudioSentry BFF listening on :${PORT}`));