import React, { useState, useRef, useEffect } from 'react';
import { Mic, CheckCircle, RefreshCcw, Square, AlertCircle, User, ShieldAlert } from 'lucide-react';
import './Enrollment.css';

const ENGINE_HTTP_URL = import.meta.env.VITE_ENGINE_HTTP_URL || "http://localhost:8000";

export function Enrollment() {
  const [step, setStep] = useState(1);
  const [callerId, setCallerId] = useState("");

  // Functional State
  const [recording, setRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [status, setStatus] = useState(null); // null | "uploading" | "error"
  const [errorMessage, setErrorMessage] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Cleanup media tracks on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  async function startRecording() {
    try {
      setStatus(null);
      setErrorMessage("");
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = handleUpload; // Trigger API call when recording stops[cite: 1]
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setTimer(0);

      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev >= 20) {
            stopRecording();
            return 20;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      setStatus("error");
      setErrorMessage("Microphone access denied.");
    }
  }

  function stopRecording() {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    setRecording(false);
  }

  async function handleUpload() {
    if (audioChunksRef.current.length === 0) return;
    setStatus("uploading");

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append("caller_id", callerId);
    formData.append("audio", audioBlob, `${callerId}_enrollment.webm`);

    try {
      const response = await fetch(`${ENGINE_HTTP_URL}/enroll`, {
        method: "POST",
        body: formData, // Sending multipart/form-data as required by contract[cite: 1]
      });

      if (!response.ok) throw new Error("API Upload Failed");

      setStatus(null);
      setStep(3); // Move to success step only if backend accepts it
    } catch (err) {
      console.error("Enrollment upload failed:", err);
      setStatus("error");
      setErrorMessage("Failed to persist voiceprint with the Engine.");
    }
  }

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

          {/* STEP 1: CONSENT & CALLER ID */}
          {step === 1 && (
            <div className="enroll-step-content">
              <h3 className="text-headline-md mb-4">Read Consent Script</h3>
              <p className="text-body-lg p-6 bg-surface-container-highest rounded-xl border-l-4 border-primary mb-6">
                "For your security and faster service in the future, we offer voice verification. This means your voice acts as your password. Do I have your permission to securely record and store your voiceprint?"
              </p>

              <div className="mb-6 flex flex-col items-center">
                <label className="text-label-sm text-on-surface-variant mb-2">Target Caller ID (Required)</label>
                <div className="flex items-center gap-2 neo-inset p-3 rounded-lg w-64">
                  <User size={18} className="text-on-surface-variant" />
                  <input
                    type="text"
                    placeholder="e.g. ACC-1001"
                    value={callerId}
                    onChange={(e) => setCallerId(e.target.value)}
                    className="bg-transparent border-none outline-none text-on-surface w-full"
                  />
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <button className="neo-raised px-8 py-3 rounded-full text-label-md">Decline</button>
                <button
                  className="neo-button-primary px-8 py-3 rounded-full text-label-md"
                  onClick={() => setStep(2)}
                  disabled={!callerId.trim()}
                  style={{ opacity: callerId.trim() ? 1 : 0.5 }}
                >
                  Customer Consents
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: RECORDING */}
          {step === 2 && (
            <div className="enroll-step-content text-center">
              <h3 className="text-headline-md mb-4">Capture Baseline Audio</h3>
              <p className="text-body-md text-on-surface-variant mb-8">Ask the customer to repeat the following phrase clearly:</p>

              <h2 className="text-headline-lg text-primary mb-8">"My voice is my secure password."</h2>

              <div className="text-display-md text-on-surface mb-4 font-mono">
                00:{timer < 10 ? `0${timer}` : timer} / 00:20
              </div>

              <div className="enroll-mic-container mx-auto mb-8">
                <button
                  className={`enroll-mic-btn ${recording ? 'bg-[#DC2626] text-white animate-pulse' : 'neo-raised text-primary'}`}
                  onClick={recording ? stopRecording : startRecording}
                >
                  {recording ? <Square size={32} /> : <Mic size={32} />}
                </button>
              </div>

              <p className="text-label-sm text-on-surface-variant uppercase tracking-widest mb-4">
                {recording ? "Recording... Click square to stop." : "Click Mic to Start"}
              </p>

              {status === "uploading" && (
                <div className="neo-inset p-8 rounded-2xl flex flex-col items-center gap-4 mt-6">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <div className="text-label-md text-on-surface-variant font-bold">Uploading to Engine...</div>
                </div>
              )}
              {status === "error" && (
                <div className="neo-inset p-8 rounded-2xl flex flex-col items-center gap-4 border border-[#DC2626] mt-6">
                  <ShieldAlert size={32} color="#DC2626" />
                  <div className="text-label-md text-[#DC2626] font-bold">Enrollment Failed</div>
                  <p className="text-body-sm text-on-surface-variant">{errorMessage}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: VERIFICATION */}
          {step === 3 && (
            <div className="enroll-step-content text-center">
              <div className="w-24 h-24 neo-raised rounded-full flex items-center justify-center mx-auto mb-6 text-[#16A34A]">
                <CheckCircle size={48} />
              </div>
              <h3 className="text-headline-md mb-2">Voiceprint Captured</h3>
              <p className="text-body-md text-on-surface-variant mb-8">
                The baseline audio has been successfully enrolled for <strong>{callerId}</strong>.
              </p>

              <div className="flex justify-center gap-4">
                <button className="neo-raised px-6 py-3 rounded-full text-label-md flex items-center gap-2" onClick={() => { setStep(2); setStatus(null); }}>
                  <RefreshCcw size={18} /> Retake
                </button>
                <button className="neo-button-primary px-8 py-3 rounded-full text-label-md" onClick={() => { setStep(1); setCallerId(""); }}>
                  Finish New Enrollment
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}