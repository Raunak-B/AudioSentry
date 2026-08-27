import React from 'react';
import { AlertBanner } from '../components/AlertBanner';

export function AlertBannerStates() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-display-lg text-on-surface">Alert Banners</h1>
        <p className="text-body-lg text-on-surface-variant mt-2">
          Component states for system notifications and alerts.
        </p>
      </div>

      <div className="neo-inset p-8 rounded-[24px] flex flex-col gap-6">
        <AlertBanner 
          type="info"
          title="System Update Scheduled"
          message="The Sentinel AI models will be updated at 02:00 AM UTC. No downtime is expected."
          onDismiss={() => {}}
        />
        
        <AlertBanner 
          type="success"
          title="Voiceprint Enrolled Successfully"
          message="Michael T. Chen's voice biometric data has been securely hashed and stored."
          onDismiss={() => {}}
        />

        <AlertBanner 
          type="warning"
          title="Elevated Stress Detected"
          message="Caller is exhibiting signs of cognitive load. Proceed with caution."
          onDismiss={() => {}}
        />

        <AlertBanner 
          type="error"
          title="Deepfake Probability High (94%)"
          message="Synthetic audio artifacts detected in the 2kHz-4kHz range. Immediate intercept recommended."
          onDismiss={() => {}}
        />
      </div>
    </div>
  );
}
