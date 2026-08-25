import React from 'react';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';
import './DeepScanCard.css';

export function DeepScanCard({ title, score, details }) {
  const isHighRisk = score > 70;
  const isMedRisk = score > 40 && score <= 70;
  
  const scoreColor = isHighRisk ? 'var(--color-error)' : isMedRisk ? 'var(--color-primary-container)' : '#34a853';

  return (
    <div className="deep-scan-card neo-raised">
      <div className="dsc-header">
        <h3 className="text-headline-md">{title}</h3>
        <div className="dsc-score-badge" style={{ color: scoreColor, backgroundColor: `${scoreColor}1A` }}>
          <Activity size={16} />
          <span className="text-label-md">{score}/100</span>
        </div>
      </div>
      
      <div className="dsc-content neo-inset">
        {details.map((detail, idx) => (
          <div key={idx} className="dsc-detail-row">
            <span className="text-label-sm text-on-surface-variant">{detail.label}</span>
            <span className="text-label-md" style={{ color: detail.alert ? 'var(--color-error)' : 'var(--color-on-surface)' }}>
              {detail.value}
            </span>
          </div>
        ))}
      </div>
      
      <div className="dsc-footer">
        <button className="neo-button-primary dsc-btn">
          <Cpu size={18} />
          View ML Inference
        </button>
      </div>
    </div>
  );
}
