import React, { useEffect, useRef, useState } from 'react';
import {
  MoreVertical,
  Gavel,
  User,
  MicOff,
  Ban,
  ShieldAlert,
  BrainCircuit,
  Bot
} from 'lucide-react';
import { RiskGauge } from '../components/RiskGauge';
import { useLiveCallStream } from '../hooks/useLiveCallStream';
import './LiveCallMonitor.css';

const BFF_HTTP_URL = import.meta.env.VITE_BFF_HTTP_URL || "http://localhost:4000";

export function ComplianceBotSandbox() {
  const transcriptRef = useRef(null);
  const [activeCallId, setActiveCallId] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [policyProfile, setPolicyProfile] = useState("Loading...");

  useEffect(() => {
    if (!activeCallId) return;

    async function fetchSession() {
      try {
        let res = await fetch(`${BFF_HTTP_URL}/session/${activeCallId}`);
        if (res.status === 404) {
          res = await fetch(`${BFF_HTTP_URL}/api/session/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callId: activeCallId, accountId: activeCallId })
          });
        }
        if (res.ok) {
          const data = await res.json();
          setPolicyProfile(data.policy_profile || "Unknown");
        }
      } catch (err) {
        console.error("Failed to fetch session policy:", err);
      }
    }
    fetchSession();
  }, [activeCallId]);

  const {
    risk_score,
    layer2_triggered,
    transcriptBuffer,
    connectionState
  } = useLiveCallStream(activeCallId || "UNKNOWN");

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

  async function handleSimulateBot() {
    setIsSimulating(true);
    try {
      const res = await fetch(`${BFF_HTTP_URL}/simulate-bot`, { method: 'POST' });
      const data = await res.json();
      if (data.status === "streaming_started") {
        setActiveCallId(data.call_id);
      } else {
        setIsSimulating(false); // Only re-enable if it failed
      }
    } catch (err) {
      console.error("Simulation failed:", err);
      setIsSimulating(false);
    }
  }

  return (
    <div className="lcm-container">
      {/* Header */}
      <div className="lcm-header">
        <div>
          <h1 className="text-display-lg text-on-surface">Compliance Bot Sandbox (Teams/Zoom)</h1>
          <p className="text-body-lg text-on-surface-variant flex items-center gap-2 mt-2">
            <span className={activeCallId ? "lcm-pulse-dot" : "w-2 h-2 rounded-full bg-surface-dim"}></span>
            Active Session: {activeCallId || "None"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateBot}
            disabled={isSimulating || activeCallId}
            className={`neo-button-primary px-6 py-3 rounded-xl flex items-center gap-2 ${activeCallId ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Bot size={20} />
            <span>{activeCallId ? "Simulation Running..." : isSimulating ? "Connecting..." : "Simulate Meeting Bot"}</span>
          </button>

          {/* Active Risk Policy Profile Badge */}
          <div className="lcm-policy-badge neo-raised">
            <span className="text-label-sm text-on-surface-variant tracking-widest">POLICY TIER</span>
            <div className="lcm-policy-inner">
              <Gavel size={16} color={
                policyProfile === 'strict' ? '#DC2626' :
                  policyProfile === 'balanced' ? '#D97706' :
                    policyProfile === 'lenient' ? '#16A34A' : 'var(--color-on-surface)'
              } />
              <span className="text-label-md text-on-surface capitalize">{policyProfile} Enforcement</span>
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
            <div className="neo-inset px-4 py-2 mb-4 text-center text-label-sm text-[#DC2626] font-bold flex items-center justify-center gap-2" style={{ animation: 'pulse 2s infinite' }}>
              <ShieldAlert size={16} />
              Reconnecting... (Stale Risk Score)
            </div>
          )}
          <RiskGauge
            score={risk_score || 0}
            riskLevel={layer2_triggered || risk_score > 60 ? "Critical" : "Normal"}
          />

          <div className="mt-2 text-center">
            <span className={`text-label-sm ${layer2_triggered ? 'text-[#DC2626] font-bold' : 'text-on-surface-variant'}`}>
              Layer 2 Status: {layer2_triggered ? "ESCALATED (Threshold Exceeded)" : "Normal Monitoring"}
            </span>
          </div>

          <div className="lcm-caller-card neo-raised mt-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-label-md uppercase tracking-widest text-on-surface">Bot Identity</h3>
              <Bot className="text-on-surface-variant" size={20} />
            </div>

            <div className="lcm-caller-profile mb-6">
              <div className="lcm-caller-avatar neo-inset">
                <div className="lcm-avatar-inner text-on-surface-variant">
                  <Bot size={32} />
                </div>
              </div>
              <div>
                <p className="text-headline-md text-on-surface">Compliance Notetaker</p>
                <p className="text-body-md text-on-surface-variant">Meeting Bot • v2.1</p>
              </div>
            </div>

            <div className="lcm-caller-stats">
              <div className="lcm-stat-box neo-inset">
                <p className="text-label-sm text-on-surface-variant mb-1">Platform</p>
                <p className="text-label-md text-on-surface">Microsoft Teams</p>
              </div>
              <div className="lcm-stat-box neo-inset">
                <p className="text-label-sm text-on-surface-variant mb-1">Ingress Auth</p>
                <p className="text-label-md text-[#DC2626] flex items-center gap-2">
                  <Ban size={16} /> Unknown Host
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
                  {activeCallId ? "Streaming bot audio buffer..." : "Awaiting bot join..."}
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
              {activeCallId && (
                <div className="flex justify-center mb-4">
                  <span className="lcm-sys-event text-label-sm">Bot joined meeting at {new Date().toLocaleTimeString()}</span>
                </div>
              )}

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
              {activeCallId && (
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
              <MicOff size={18} /> Kick Bot
            </button>
            <button className="lcm-footer-btn lcm-btn-alert neo-raised text-[#DC2626]">
              <Ban size={18} /> Kill Meeting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
