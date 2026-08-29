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

export async function sendSlackAlert(message) {
    try {
        return await fetch(process.env.SLACK_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: message }),
        });
    } catch (error) {
        console.error("Slack Alert failed:", error.message);
        return null;
    }
}