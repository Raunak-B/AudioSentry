import { useEffect, useRef, useState } from "react";

const ENGINE_WS_URL = import.meta.env.VITE_ENGINE_WS_URL || "ws://localhost:8000";

export function useRiskStream(callId) {
    const [risk, setRisk] = useState({ risk_score: 0, layer2_triggered: false });
    const [transcriptBuffer, setTranscriptBuffer] = useState("");
    const [connectionState, setConnectionState] = useState("connecting"); // connecting, connected, reconnecting, disconnected
    const wsRef = useRef(null);
    const reconnectAttempt = useRef(0);

    useEffect(() => {
        if (!callId) return;

        let cancelled = false;

        function connect() {
            if (cancelled) return;
            setConnectionState(reconnectAttempt.current === 0 ? "connecting" : "reconnecting");
            const ws = new WebSocket(`${ENGINE_WS_URL}/stream/${callId}`);
            wsRef.current = ws;

            ws.onopen = () => {
                if (cancelled) return;
                setConnectionState("connected");
                reconnectAttempt.current = 0; // reset on success
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                setRisk(data);
                if (data.transcript) {
                    setTranscriptBuffer(prev => prev + data.transcript + " ");
                }
            };
            ws.onerror = (err) => console.error("Risk stream error", err);
            ws.onclose = () => {
                if (cancelled) return;
                setConnectionState("disconnected");
                const backoff = Math.min(1000 * Math.pow(2, reconnectAttempt.current), 10000);
                reconnectAttempt.current += 1;
                setTimeout(connect, backoff);
            };
        }

        connect();
        return () => {
            cancelled = true;
            wsRef.current?.close();
        };
    }, [callId]);

    return { risk, transcriptBuffer, connectionState };
}