import React, { useEffect, useRef } from 'react';
import { MoreVertical, Gavel, User, MicOff, Ban, ShieldAlert, BrainCircuit } from 'lucide-react';
import { RiskGauge } from '../components/RiskGauge';
import './LiveCallMonitor.css';

export function LiveCallMonitor() {
  const transcriptRef = useRef(null);

  useEffect(() => {
    if (transcriptRef.current) {
      setTimeout(() => {
        transcriptRef.current.scrollTo({
          top: transcriptRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 500);
    }
  }, []);

  return (
    <div className="lcm-container">
      {/* Header */}
      <div className="lcm-header">
        <div>
          <h1 className="text-display-lg text-on-surface">Live Monitor</h1>
          <p className="text-body-lg text-on-surface-variant flex items-center gap-2 mt-2">
            <span className="lcm-pulse-dot"></span>
            Active Session: INB-7729-A
          </p>
        </div>
        <div className="flex items-center gap-4">
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
        {/* Left Column */}
        <div className="lcm-col-left">
          <RiskGauge score={72} riskLevel="Critical" />
          
          <div className="lcm-caller-card neo-raised">
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

        {/* Right Column (Transcript) */}
        <div className="lcm-col-right neo-raised">
          <div className="lcm-transcript-header">
            <div className="flex items-center gap-4">
              <div className="lcm-transcript-icon neo-inset text-primary">
                <BrainCircuit size={20} />
              </div>
              <div>
                <h2 className="text-headline-md text-on-surface">Live Transcription</h2>
                <p className="text-label-sm text-on-surface-variant">Powered by Sentinel AI</p>
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
              
              {/* Agent Bubble */}
              <div className="lcm-msg lcm-agent">
                <div className="lcm-msg-avatar neo-raised text-on-surface-variant"><User size={20} /></div>
                <div className="lcm-msg-content">
                  <span className="text-label-sm text-on-surface-variant ml-2 mb-1 block">Agent Sarah</span>
                  <div className="lcm-bubble lcm-bubble-agent text-body-md text-on-surface">
                    Thank you for calling Platinum Support. Am I speaking with Michael Chen?
                  </div>
                </div>
              </div>

              {/* Customer Bubble */}
              <div className="lcm-msg lcm-customer flex-row-reverse">
                <div className="lcm-msg-avatar neo-raised text-on-surface-variant"><User size={20} /></div>
                <div className="lcm-msg-content items-end">
                  <span className="text-label-sm text-on-surface-variant mr-2 mb-1 block">Caller</span>
                  <div className="lcm-bubble lcm-bubble-customer neo-raised text-body-md text-on-surface text-right">
                    Yes, this is Michael. I need to push a wire transfer through immediately. It's urgent.
                  </div>
                </div>
              </div>

              {/* Customer Bubble with Risk Highlight */}
              <div className="lcm-msg lcm-customer flex-row-reverse">
                <div className="lcm-msg-avatar lcm-avatar-alert text-error"><ShieldAlert size={20} /></div>
                <div className="lcm-msg-content items-end">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="lcm-risk-tag bg-error text-on-error">High Stress Detected</span>
                    <span className="text-label-sm text-on-surface-variant">Caller</span>
                  </div>
                  <div className="lcm-bubble lcm-bubble-customer lcm-bubble-alert neo-raised text-body-md text-on-surface text-right">
                    Look, I don't have time for this. I verified in the app. Just authorize the $45,000 transfer to the account I just added.
                  </div>
                  <div className="lcm-inline-analysis text-error">
                    <BrainCircuit size={14} />
                    <span className="text-label-sm">Urgency tactic & new payee mentioned</span>
                  </div>
                </div>
              </div>
              
              {/* Typing indicator */}
              <div className="lcm-msg lcm-agent" style={{opacity: 0.5}}>
                <div className="lcm-msg-avatar neo-raised text-on-surface-variant"><User size={20} /></div>
                <div className="lcm-bubble lcm-bubble-agent flex gap-1 items-center">
                  <div className="lcm-dot"></div>
                  <div className="lcm-dot" style={{animationDelay: '100ms'}}></div>
                  <div className="lcm-dot" style={{animationDelay: '200ms'}}></div>
                </div>
              </div>
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
