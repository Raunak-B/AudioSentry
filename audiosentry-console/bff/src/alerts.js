import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

// Note: If your Twilio trial account is completely blocked due to the KYC restrictions, 
// the client will initialize, but sendSmsAlert will gracefully fail and log to the console.
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendSmsAlert(toNumber, message) {
    try {
        return await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_FROM_NUMBER,
            to: toNumber,
        });
    } catch (error) {
        console.error("SMS Alert bypassed/failed (Check Twilio Trial Status):", error.message);
        return null;
    }
}

export async function sendSlackAlert(callId, riskScore, reason) {
    if (!process.env.SLACK_WEBHOOK_URL) {
        console.warn("No SLACK_WEBHOOK_URL set in .env; skipping Slack dispatch.");
        return null;
    }

    try {
        const payload = {
            text: `🚨 *AudioSentry Alert*\n*Call ID:* ${callId}\n*Risk Score:* ${riskScore}\n*Reason:* ${reason}`
        };

        const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error(`Slack Alert failed with status ${response.status}: ${response.statusText}`);
        }
        return response;
    } catch (error) {
        console.error("Slack Alert failed (gracefully caught):", error.message);
        return null;
    }
}