import React from 'react';
import { AlertTriangle } from 'lucide-react';
import './RiskGauge.css';

export function RiskGauge({ score = 72, riskLevel = "Critical" }) {
  // Circumference = 2 * PI * 46 = 289
  const circumference = 289;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="risk-gauge-container neo-raised">
      <div className="risk-gauge-glow"></div>
      <h2 className="text-headline-md w-full text-left mb-8 z-10" style={{position: 'relative'}}>Real-time Threat Level</h2>
      
      <div className="risk-dial">
        <div className="risk-track neo-inset">
          <svg className="risk-svg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" className="risk-svg-bg" />
            <defs>
              <linearGradient id="risk-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34a853" />
                <stop offset="50%" stopColor="#fbbc04" />
                <stop offset="100%" stopColor="var(--color-error)" />
              </linearGradient>
              <filter id="neo-arc-shadow">
                <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#dbdad9" floodOpacity="0.8" />
                <feDropShadow dx="-2" dy="-2" stdDeviation="3" floodColor="#ffffff" floodOpacity="0.9" />
              </filter>
            </defs>
            <circle 
              cx="50" cy="50" r="46" 
              className="risk-svg-value"
              style={{ strokeDashoffset }}
            />
          </svg>
        </div>
        
        <div className="risk-hub neo-raised">
          <span className="text-label-sm uppercase" style={{color: 'var(--color-on-surface-variant)', letterSpacing: '0.1em'}}>Risk Score</span>
          <span className="text-display-lg" style={{color: 'var(--color-error)', lineHeight: 1}}>{score}</span>
          <span className="risk-badge text-label-md">
            <AlertTriangle size={14} /> {riskLevel}
          </span>
        </div>
      </div>

      <div className="risk-indicators">
        <Indicator icon="record_voice_over" label={<>Voice<br/>Biometrics</>} active={true} />
        <Indicator icon="language" label={<>Geo<br/>Velocity</>} active={true} />
        <Indicator icon="devices" label={<>Device<br/>Trust</>} active={false} isPrimary />
      </div>
    </div>
  );
}

function Indicator({ icon, label, active, isPrimary }) {
  const dotColor = active ? 'var(--color-error)' : '#34a853';
  const iconColor = isPrimary ? 'var(--color-primary)' : 'var(--color-on-surface-variant)';
  
  return (
    <div className="risk-indicator">
      <div className="risk-indicator-icon neo-inset" style={{ color: iconColor }}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <span className="text-label-sm" style={{ textAlign: 'center', color: iconColor }}>{label}</span>
      <span className="risk-indicator-dot" style={{ backgroundColor: dotColor }}></span>
    </div>
  );
}
