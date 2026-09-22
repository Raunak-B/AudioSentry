import { useEffect, useRef, useState } from "react";
import { usePCMStream } from "./usePCMStream";

const ENGINE_WS_URL = import.meta.env.VITE_ENGINE_WS_URL || "ws://localhost:8000";

export function useLiveCallStream(callId, crmMetadata) {
    const [risk, setRisk] = useState({ risk_score: 0, layer2_triggered: false });
    const [transcriptBuffer, setTranscriptBuffer] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [connectionState, setConnectionState] = useState("connecting"); // connecting, connected, reconnecting, disconnected

    const wsRef = useRef(null);
    const reconnectAttempt = useRef(0);
    const { startStream, stopPCMStream } = usePCMStream();

    // 1. Maintain WebSocket Connection for Risk Updates[cite: 1]
    useEffect(() => {
        if (!callId || !crmMetadata) return;
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

                // Send the initial JSON configuration payload with CRM metadata
                ws.send(JSON.stringify({
                    type: "config",
                    call_id: callId,
                    metadata: crmMetadata
                }));
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setRisk(data);
                    if (data.transcript) {
                        setTranscriptBuffer(prev => prev + data.transcript + " ");
                    }
                } catch (err) {
                    console.error("Failed to parse risk payload:", err);
                }
            };

            ws.onerror = (err) => console.error("Risk stream WS error:", err);
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
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [callId, crmMetadata]);

    // 2. Microphone Capture & Audio Transmission via Web Audio API
    async function startStreaming() {
        if (!callId || isStreaming) return;

        try {
            await startStream((pcmBuffer) => {
                if (wsRef.current?.readyState === WebSocket.OPEN) {
                    wsRef.current.send(pcmBuffer);
                }
            });
            setIsStreaming(true);

        } catch (err) {
            console.error("Microphone access denied or unavailable:", err);
            setIsStreaming(false);
            throw err;
        }
    }

    function stopStreaming() {
        stopPCMStream();
        setIsStreaming(false);
    }

    // 3. Cleanup media tracks on unmount to prevent memory/hardware leaks
    useEffect(() => {
        return () => {
            stopStreaming();
        };
    }, []);

    return {
        risk_score: risk.risk_score || 0,
        layer2_triggered: risk.layer2_triggered || false,
        isStreaming,
        startStreaming,
        stopStreaming,
        transcriptBuffer,
        connectionState,
    };
}