import { useEffect, useRef, useState } from "react";

const ENGINE_WS_URL = import.meta.env.VITE_ENGINE_WS_URL || "ws://localhost:8000";

export function useRiskStream(callId) {
    const [risk, setRisk] = useState({ risk_score: 0, layer2_triggered: false });
    const wsRef = useRef(null);

    useEffect(() => {
        if (!callId) return;

        let cancelled = false;

        function connect() {
            const ws = new WebSocket(`${ENGINE_WS_URL}/stream/${callId}`);
            wsRef.current = ws;

            ws.onmessage = (event) => setRisk(JSON.parse(event.data));
            ws.onerror = (err) => console.error("Risk stream error", err);
            ws.onclose = () => {
                if (!cancelled) setTimeout(connect, 1500); // simple auto-reconnect
            };
        }

        connect();
        return () => {
            cancelled = true;
            wsRef.current?.close();
        };
    }, [callId]);

    return risk;
}