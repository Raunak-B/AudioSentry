import React, { useState } from 'react';
import { Mic, CheckCircle, RefreshCcw } from 'lucide-react';
import './Enrollment.css';

export function Enrollment() {
  const [step, setStep] = useState(1);

  return (
    <div className="enroll-container">
      <div className="mb-8">
        <h1 className="text-display-lg text-on-surface">Voiceprint Enrollment</h1>
        <p className="text-body-lg text-on-surface-variant mt-2">
          Guide the customer through the secure voice biometric setup.
        </p>
      </div>

      <div className="enroll-content neo-raised">
        <div className="enroll-stepper">
          {[1, 2, 3].map(i => (
            <div key={i} className={`enroll-step ${step >= i ? 'active' : ''}`}>
              <div className={`step-circle ${step >= i ? 'neo-inset' : 'neo-raised'}`}>
                {step > i ? <CheckCircle size={20} className="text-primary" /> : i}
              </div>
              <span className="step-label text-label-md">
                {i === 1 ? 'Consent' : i === 2 ? 'Recording' : 'Verification'}
              </span>
            </div>
          ))}
        </div>

        <div className="enroll-body neo-inset">
          {step === 1 && (
            <div className="enroll-step-content">
              <h3 className="text-headline-md mb-4">Read Consent Script</h3>
              <p className="text-body-lg p-6 bg-surface-container-highest rounded-xl border-l-4 border-primary">
                "For your security and faster service in the future, we offer voice verification. This means your voice acts as your password. Do I have your permission to securely record and store your voiceprint?"
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <button className="neo-raised px-8 py-3 rounded-full text-label-md">Decline</button>
                <button className="neo-button-primary px-8 py-3 rounded-full text-label-md" onClick={() => setStep(2)}>Customer Consents</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="enroll-step-content text-center">
              <h3 className="text-headline-md mb-4">Capture Baseline Audio</h3>
              <p className="text-body-md text-on-surface-variant mb-8">Ask the customer to repeat the following phrase clearly:</p>
              
              <h2 className="text-headline-lg text-primary mb-12">"My voice is my secure password."</h2>
              
              <div className="enroll-mic-container neo-inset mx-auto mb-8">
                <button className="enroll-mic-btn neo-raised text-primary" onClick={() => setTimeout(() => setStep(3), 2000)}>
                  <Mic size={32} />
                </button>
                {/* Simulated sound waves would go here */}
              </div>
              <p className="text-label-sm text-on-surface-variant uppercase tracking-widest">Awaiting Audio...</p>
            </div>
          )}

          {step === 3 && (
            <div className="enroll-step-content text-center">
              <div className="w-24 h-24 neo-raised rounded-full flex items-center justify-center mx-auto mb-6 text-[#34a853]">
                <CheckCircle size={48} />
              </div>
              <h3 className="text-headline-md mb-2">Voiceprint Captured</h3>
              <p className="text-body-md text-on-surface-variant mb-8">
                The baseline audio has been successfully processed and hashed. 
                Quality score: <strong className="text-on-surface">94/100</strong>
              </p>
              
              <div className="flex justify-center gap-4">
                <button className="neo-raised px-6 py-3 rounded-full text-label-md flex items-center gap-2" onClick={() => setStep(2)}>
                  <RefreshCcw size={18} /> Retake
                </button>
                <button className="neo-button-primary px-8 py-3 rounded-full text-label-md" onClick={() => setStep(1)}>Finish Enrollment</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
