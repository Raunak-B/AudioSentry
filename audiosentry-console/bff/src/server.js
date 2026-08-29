import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { sendSmsAlert, sendSlackAlert } from "./alerts.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false })); // Twilio posts form-encoded
app.use(express.json());

// In-memory session state — fine for a 4-week demo, swap for Redis in production
// Shape: call_id -> { status, current_risk, policy_profile, transcript_buffer }
const sessions = new Map();

// --- Week 2, Days 6-8: BFF Session State Management ---
app.post("/session/init", (req, res) => {
    const { call_id, account_id } = req.body;

    sessions.set(call_id, {
        status: "active",
        current_risk: 0,
        policy_profile: "balanced",
        accountId: account_id,
        transcript_buffer: "",
    });

    console.log(`Session initialized for call: ${call_id}`);
    res.json({ status: "initialized", call_id });
});

app.get("/session/:call_id", (req, res) => {
    const session = sessions.get(req.params.call_id);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
});

// --- Week 1, Days 3-5: Manual Test Alert Route ---
app.post("/test-alert", async (req, res) => {
    const testMessage = "TEST: AudioSentry manual alert triggered.";

    console.log("Dispatching manual test alerts...");
    await sendSlackAlert(testMessage);

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