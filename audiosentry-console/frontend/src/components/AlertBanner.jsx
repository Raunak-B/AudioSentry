import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';
import './AlertBanner.css';

export function AlertBanner({ type = 'info', title, message, onDismiss }) {
  const config = {
    info: { icon: Info, color: 'var(--color-tertiary)', bg: 'var(--color-tertiary-container)' },
    success: { icon: CheckCircle, color: '#34a853', bg: 'rgba(52, 168, 83, 0.1)' },
    warning: { icon: AlertTriangle, color: 'var(--color-primary-container)', bg: 'rgba(255, 140, 0, 0.1)' },
    error: { icon: AlertCircle, color: 'var(--color-error)', bg: 'var(--color-error-container)' }
  };

  const { icon: Icon, color, bg } = config[type] || config.info;

  return (
    <div className="alert-banner neo-raised" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="alert-icon" style={{ color }}>
        <Icon size={24} />
      </div>
      <div className="alert-content">
        <h4 className="text-label-md" style={{ color: 'var(--color-on-surface)' }}>{title}</h4>
        {message && <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>{message}</p>}
      </div>
      {onDismiss && (
        <button className="alert-dismiss" onClick={onDismiss} style={{ color: 'var(--color-on-surface-variant)' }}>
          <X size={20} />
        </button>
      )}
    </div>
  );
}
