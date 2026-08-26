import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false })); // Twilio posts form-encoded
app.use(express.json());

// In-memory session state — fine for a 4-week demo, swap for Redis in production
// Shape: call_id -> { status, current_risk, policy_profile, transcript_buffer }
const sessions = new Map();

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