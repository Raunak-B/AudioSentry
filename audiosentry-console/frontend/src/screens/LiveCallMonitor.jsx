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
import { lookupAccount } from '../lib/mockCrm.js';
import './LiveCallMonitor.css';

const BFF_HTTP_URL = import.meta.env.VITE_BFF_HTTP_URL || "http://localhost:4000";

export function LiveCallMonitor({ onRunDeepScan }) {
  const transcriptRef = useRef(null);
  const [alertSending, setAlertSending] = useState(false);
  const [alertStatus, setAlertStatus] = useState(null);
  const [policyProfile, setPolicyProfile] = useState("Loading...");
  const [localTranscript, setLocalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [callStarted, setCallStarted] = useState(false);
  const [micError, setMicError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let finalTrans = "";
        let interimTrans = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript + " ";
          } else {
            interimTrans += event.results[i][0].transcript;
          }
        }
        if (finalTrans) {
          setLocalTranscript(prev => prev + finalTrans);
        }
        setInterimTranscript(interimTrans);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const callId = "ACC-1001";

  const [callerProfile, setCallerProfile] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate latency
      const profile = lookupAccount(callId);
      setCallerProfile(profile);
    }
    loadProfile();
  }, [callId]);

  useEffect(() => {
    async function fetchSession() {
      try {
        let res = await fetch(`${BFF_HTTP_URL}/session/${callId}`, {
          headers: { "X-Call-ID": callId }
        });
        if (res.status === 404) {
          res = await fetch(`${BFF_HTTP_URL}/api/session/init`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "X-Call-ID": callId
            },
            body: JSON.stringify({ callId, accountId: "ACC-1001" })
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
  }, [callId]);

  // Unified WebRTC audio transmission + WebSocket risk updates[cite: 1, 3]
  const {
    risk_score,
    layer2_triggered,
    isStreaming,
    startStreaming,
    stopStreaming,
    transcriptBuffer,
    connectionState
  } = useLiveCallStream(callId, callerProfile);

  useEffect(() => {
    if (isStreaming && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Could not start speech recognition:", err);
      }
    } else if (!isStreaming && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Could not stop speech recognition:", err);
      }
    }
  }, [isStreaming]);

  useEffect(() => {
    if (transcriptRef.current) {
      setTimeout(() => {
        transcriptRef.current.scrollTo({
          top: transcriptRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [localTranscript, interimTranscript]);

  async function handleSendTestAlert() {
    setAlertSending(true);
    setAlertStatus(null);
    try {
      const res = await fetch(`${BFF_HTTP_URL}/test-alert`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Call-ID": callId
        },
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

  const handleStartCall = async () => {
    setMicError(null);
    try {
      await startStreaming();
      setCallStarted(true);
    } catch (err) {
      setMicError("Microphone access denied. Please allow microphone permissions and try again.");
    }
  };

  if (!callStarted) {
    return (
      <div className="lcm-container flex flex-col items-center justify-center" style={{ minHeight: '80vh' }}>
         <div className="neo-raised p-8 text-center max-w-md w-full">
           {micError ? (
             <>
               <ShieldAlert size={48} className="text-error mx-auto mb-4" />
               <h2 className="text-headline-md text-error mb-2">Access Denied</h2>
               <p className="text-body-md text-on-surface-variant mb-6">{micError}</p>
               <button 
                 onClick={handleStartCall}
                 className="neo-inset px-6 py-3 rounded-lg text-primary font-bold w-full"
                 style={{ border: 'none', cursor: 'pointer' }}
               >
                 Try Again
               </button>
             </>
           ) : (
             <>
               <Mic size={48} className="text-primary mx-auto mb-4" />
               <h2 className="text-headline-md text-on-surface mb-2">Ready for Call</h2>
               <p className="text-body-md text-on-surface-variant mb-6">
                 Initialize the audio stream and transcription engine to begin monitoring.
               </p>
               <button 
                 onClick={handleStartCall}
                 className="neo-raised px-6 py-3 rounded-lg text-primary font-bold w-full text-lg"
                 style={{ border: 'none', cursor: 'pointer' }}
               >
                 Start Call
               </button>
             </>
           )}
         </div>
      </div>
    );
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
              <Gavel size={16} color={
                policyProfile === 'strict' ? 'var(--color-error)' :
                  policyProfile === 'balanced' ? 'var(--color-warning, #f59e0b)' :
                    policyProfile === 'lenient' ? 'var(--color-success, #34a853)' : 'var(--color-on-surface)'
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
                <p className="text-headline-md text-on-surface">{callerProfile?.name || "Loading..."}</p>
                <p className="text-body-md text-on-surface-variant">Customer since {callerProfile?.customer_since || "..."}</p>
              </div>
            </div>

            <div className="lcm-caller-stats flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="lcm-stat-box neo-inset flex-1">
                  <p className="text-label-sm text-on-surface-variant mb-1">Auth Method</p>
                  <p className="text-label-md text-on-surface">{callerProfile?.auth_method || "..."}</p>
                </div>
                <div className="lcm-stat-box neo-inset flex-1">
                  <p className="text-label-sm text-on-surface-variant mb-1">ANI Match</p>
                  {callerProfile?.ani_match ? (
                    <p className="text-label-md text-success flex items-center gap-1">
                      Matched
                    </p>
                  ) : (
                    <p className="text-label-md text-error flex items-center gap-1">
                      <Ban size={16} /> No Match
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="lcm-stat-box neo-inset flex-1">
                  <p className="text-label-sm text-on-surface-variant mb-1">Device History</p>
                  <p className="text-label-md text-on-surface">{callerProfile?.device_history || "..."}</p>
                </div>
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
              {(localTranscript || interimTranscript) && (
                <div className="lcm-msg lcm-agent">
                  <div className="lcm-msg-avatar neo-raised text-on-surface-variant"><BrainCircuit size={20} /></div>
                  <div className="lcm-msg-content" style={{ width: '100%' }}>
                    <span className="text-label-sm text-on-surface-variant ml-2 mb-1 block">Live Feed</span>
                    <div className="lcm-bubble lcm-bubble-agent text-body-md text-on-surface" style={{ whiteSpace: 'pre-wrap' }}>
                      {localTranscript}
                      <span style={{ opacity: 0.6 }}>{interimTranscript}</span>
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