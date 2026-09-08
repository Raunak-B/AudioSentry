import React, { useEffect, useRef, useState } from 'react';
import {
  MoreVertical,
  Gavel,
  User,
  MicOff,
  Ban,
  ShieldAlert,
  BrainCircuit,
  Mic,
  Bell,
  Search
} from 'lucide-react';
import { RiskGauge } from '../components/RiskGauge';
import { useLiveCallStream } from '../hooks/useLiveCallStream';
import './LiveCallMonitor.css';

const BFF_HTTP_URL = import.meta.env.VITE_BFF_HTTP_URL || "http://localhost:4000";

export function LiveCallMonitor({ onRunDeepScan }) {
  const transcriptRef = useRef(null);
  const [alertSending, setAlertSending] = useState(false);
  const [alertStatus, setAlertStatus] = useState(null);

  const callId = "CALL-9911";

  // Unified WebRTC audio transmission + WebSocket risk updates[cite: 1, 3]
  const {
    risk_score,
    layer2_triggered,
    isStreaming,
    startStreaming,
    stopStreaming,
    transcriptBuffer,
    connectionState
  } = useLiveCallStream(callId);

  useEffect(() => {
    if (transcriptRef.current) {
      setTimeout(() => {
        transcriptRef.current.scrollTo({
          top: transcriptRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [transcriptBuffer]);

  async function handleSendTestAlert() {
    setAlertSending(true);
    setAlertStatus(null);
    try {
      const res = await fetch(`${BFF_HTTP_URL}/test-alert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ call_id: callId })
      });
      if (res.ok) {
        setAlertStatus("Dispatched");
      } else {
        setAlertStatus("Failed");
      }
    } catch (err) {
      console.error("Manual test alert failed to dispatch:", err);
      setAlertStatus("Error");
    } finally {
      setAlertSending(false);
      setTimeout(() => setAlertStatus(null), 3000);
    }
  }

  return (
    <div className="lcm-container">
      {/* Header */}
      <div className="lcm-header">
        <div>
          <h1 className="text-display-lg text-on-surface">Live Monitor</h1>
          <p className="text-body-lg text-on-surface-variant flex items-center gap-2 mt-2">
            <span className="lcm-pulse-dot"></span>
            Active Session: {callId}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Manual Alert Dispatch Test Button (Week 1, Days 3-5)[cite: 1] */}
          <button
            onClick={handleSendTestAlert}
            disabled={alertSending}
            className="neo-inset px-3 py-2 rounded-lg text-label-md text-on-surface-variant hover:text-primary flex items-center gap-2"
            style={{ border: 'none', cursor: alertSending ? 'not-allowed' : 'pointer' }}
            title="Trigger manual test SMS/Slack alert via Node BFF"
          >
            <Bell size={16} />
            <span>{alertStatus ? alertStatus : alertSending ? "Sending..." : "Send Test Alert"}</span>
          </button>

          {/* WebRTC Streaming Toggle for Direct Audio Ingestion[cite: 1, 2] */}
          <button
            onClick={isStreaming ? stopStreaming : startStreaming}
            className={`neo-raised px-4 py-2 rounded-lg flex items-center gap-2 ${isStreaming ? 'text-error' : 'text-primary'}`}
            style={{ border: 'none', cursor: 'pointer' }}
          >
            <Mic size={18} />
            <span className="text-label-md font-bold">
              {isStreaming ? "Stop Mic Stream" : "Start Mic Stream"}
            </span>
          </button>

          {/* Run Deep Scan Action Button[cite: 1] */}
          {onRunDeepScan && (
            <button
              onClick={() => onRunDeepScan(callId)}
              className="neo-raised px-4 py-2 rounded-lg flex items-center gap-2 text-primary font-bold"
              style={{ border: 'none', cursor: 'pointer' }}
            >
              <Search size={16} />
              <span>Run Deep Scan</span>
            </button>
          )}

          {/* Active Risk Policy Profile Badge[cite: 1] */}
          <div className="lcm-policy-badge neo-raised">
            <span className="text-label-sm text-on-surface-variant tracking-widest">POLICY TIER</span>
            <div className="lcm-policy-inner">
              <Gavel size={16} color="var(--color-error)" />
              <span className="text-label-md text-on-surface">Strict Enforcement</span>
            </div>
          </div>

          <button className="lcm-more-btn neo-raised text-on-surface-variant">
            <MoreVertical size={24} />
          </button>
        </div>
      </div>

      <div className="lcm-grid">
        {/* Left Column: Risk Gauge & Identity */}
        <div className="lcm-col-left">
          {connectionState === 'reconnecting' && (
            <div className="neo-inset px-3 py-2 mb-4 text-center text-label-sm text-error font-bold flex items-center justify-center gap-2" style={{ animation: 'pulse 2s infinite' }}>
              <ShieldAlert size={16} />
              Reconnecting... (Stale Risk Score)
            </div>
          )}
          <RiskGauge
            score={risk_score || 0}
            riskLevel={layer2_triggered || risk_score > 60 ? "Critical" : "Normal"}
          />

          <div className="mt-2 text-center">
            <span className={`text-label-sm ${layer2_triggered ? 'text-error font-bold' : 'text-on-surface-variant'}`}>
              Layer 2 Status: {layer2_triggered ? "ESCALATED (Threshold Exceeded)" : "Normal Monitoring"}
            </span>
          </div>

          <div className="lcm-caller-card neo-raised mt-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-label-md uppercase tracking-widest text-on-surface">Caller Identity</h3>
              <User className="text-on-surface-variant" size={20} />
            </div>

            <div className="lcm-caller-profile mb-6">
              <div className="lcm-caller-avatar neo-inset">
                <div className="lcm-avatar-inner text-on-surface-variant">
                  <User size={32} />
                </div>
              </div>
              <div>
                <p className="text-headline-md text-on-surface">Michael T. Chen</p>
                <p className="text-body-md text-on-surface-variant">Customer since 2018</p>
              </div>
            </div>

            <div className="lcm-caller-stats">
              <div className="lcm-stat-box neo-inset">
                <p className="text-label-sm text-on-surface-variant mb-1">Auth Method</p>
                <p className="text-label-md text-on-surface">OTP via SMS</p>
              </div>
              <div className="lcm-stat-box neo-inset">
                <p className="text-label-sm text-on-surface-variant mb-1">ANI Match</p>
                <p className="text-label-md text-error flex items-center gap-1">
                  <Ban size={16} /> No Match
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Transcript */}
        <div className="lcm-col-right neo-raised">
          <div className="lcm-transcript-header">
            <div className="flex items-center gap-4">
              <div className="lcm-transcript-icon neo-inset text-primary">
                <BrainCircuit size={20} />
              </div>
              <div>
                <h2 className="text-headline-md text-on-surface">Live Transcription</h2>
                <p className="text-label-sm text-on-surface-variant">
                  {isStreaming ? "Streaming live audio buffer..." : "Mic stream inactive"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-label-sm text-on-surface-variant">Auto-scroll</span>
              <button className="lcm-toggle neo-inset">
                <div className="lcm-toggle-knob"></div>
              </button>
            </div>
          </div>

          <div className="lcm-transcript-body neo-inset" ref={transcriptRef}>
            <span className="lcm-watermark text-display-lg">CONFIDENTIAL</span>

            <div className="lcm-messages z-10 relative space-y-6">
              <div className="flex justify-center mb-4">
                <span className="lcm-sys-event text-label-sm">Call connected at 14:02:11 PST</span>
              </div>

              {/* Dynamic Live Transcript */}
              {transcriptBuffer && (
                <div className="lcm-msg lcm-agent">
                  <div className="lcm-msg-avatar neo-raised text-on-surface-variant"><BrainCircuit size={20} /></div>
                  <div className="lcm-msg-content" style={{ width: '100%' }}>
                    <span className="text-label-sm text-on-surface-variant ml-2 mb-1 block">Live Feed</span>
                    <div className="lcm-bubble lcm-bubble-agent text-body-md text-on-surface" style={{ whiteSpace: 'pre-wrap' }}>
                      {transcriptBuffer}
                    </div>
                  </div>
                </div>
              )}

              {/* Streaming Indicator */}
              {isStreaming && (
                <div className="lcm-msg lcm-agent" style={{ opacity: 0.5 }}>
                  <div className="lcm-msg-avatar neo-raised text-on-surface-variant"><User size={20} /></div>
                  <div className="lcm-bubble lcm-bubble-agent flex gap-1 items-center">
                    <div className="lcm-dot"></div>
                    <div className="lcm-dot" style={{ animationDelay: '100ms' }}></div>
                    <div className="lcm-dot" style={{ animationDelay: '200ms' }}></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lcm-footer">
            <button className="lcm-footer-btn neo-inset text-on-surface hover:text-primary">
              <MicOff size={18} /> Mute Agent
            </button>
            <button className="lcm-footer-btn lcm-btn-alert neo-raised text-error">
              <Ban size={18} /> Intercept Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}