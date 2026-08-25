import React from 'react';
import { DeepScanCard } from '../components/DeepScanCard';
import { CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import './DeepScanResults.css';

export function DeepScanResults() {
  const models = [
    {
      title: "Voiceprint Authenticator",
      score: 98,
      details: [
        { label: "Pitch Contour Match", value: "99%" },
        { label: "Timbre Signature", value: "97%" },
        { label: "Background Noise Profile", value: "Nominal", alert: false }
      ]
    },
    {
      title: "Synthetic Speech Detector",
      score: 12,
      details: [
        { label: "Vocoder Artifacts", value: "None Detected" },
        { label: "Phase Discontinuity", value: "0.02s (Normal)" },
        { label: "Deepfake Probability", value: "1.2%", alert: false }
      ]
    },
    {
      title: "Behavioral Stress Analyzer",
      score: 85,
      details: [
        { label: "Micro-tremors", value: "Elevated", alert: true },
        { label: "Speech Rate Variance", value: "High (+20%)", alert: true },
        { label: "Cognitive Load", value: "Significant", alert: true }
      ]
    }
  ];

  return (
    <div className="dsr-container">
      <div className="dsr-header">
        <div>
          <h1 className="text-display-lg text-on-surface">Deep Scan Results</h1>
          <p className="text-body-lg text-on-surface-variant mt-2">
            Analysis complete for Session: INB-7729-A
          </p>
        </div>
        <div className="dsr-status neo-raised">
          <ShieldCheck size={24} className="text-primary" />
          <span className="text-headline-md text-on-surface">Verified Authentic</span>
        </div>
      </div>

      <div className="dsr-grid">
        {models.map((model, idx) => (
          <DeepScanCard 
            key={idx}
            title={model.title}
            score={model.score}
            details={model.details}
          />
        ))}
      </div>

      <div className="dsr-summary neo-inset">
        <h3 className="text-headline-md mb-4">Overall Assessment</h3>
        <p className="text-body-lg text-on-surface-variant">
          The caller's biometric signature matches the enrolled profile with 98% confidence. No synthetic audio artifacts were detected. However, behavioral analysis indicates significant stress and cognitive load, suggesting the caller may be operating under duress or engaging in a high-stakes transaction. 
        </p>
        <div className="dsr-actions mt-6">
          <button className="neo-button-primary">Approve Transaction</button>
          <button className="neo-raised text-error px-6 py-2" style={{ borderRadius: 'var(--rounded-full)', fontWeight: 600 }}>Require Video Auth</button>
        </div>
      </div>
    </div>
  );
}
