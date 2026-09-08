import { useEffect, useRef, useState } from "react";

const ENGINE_WS_URL = import.meta.env.VITE_ENGINE_WS_URL || "ws://localhost:8000";

export function useLiveCallStream(callId) {
    const [risk, setRisk] = useState({ risk_score: 0, layer2_triggered: false });
    const [transcriptBuffer, setTranscriptBuffer] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [connectionState, setConnectionState] = useState("connecting"); // connecting, connected, reconnecting, disconnected

    const wsRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioStreamRef = useRef(null);
    const reconnectAttempt = useRef(0);

    // 1. Maintain WebSocket Connection for Risk Updates[cite: 1]
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
    }, [callId]);

    // 2. Microphone Capture & Audio Transmission via WebRTC
    async function startStreaming() {
        if (!callId || isStreaming) return;

        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioStreamRef.current = stream;

            // Initialize MediaRecorder for 2-second rolling windows per architecture[cite: 1, 3]
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            recorder.ondataavailable = async (event) => {
                if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
                    // Send binary audio chunks directly over the active WS connection
                    const buffer = await event.data.arrayBuffer();
                    wsRef.current.send(buffer);
                }
            };

            // Start recording and emit chunks every 2000ms
            recorder.start(2000);
            mediaRecorderRef.current = recorder;
            setIsStreaming(true);

        } catch (err) {
            console.error("Microphone access denied or unavailable:", err);
            setIsStreaming(false);
        }
    }

    function stopStreaming() {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach(track => track.stop());
        }
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