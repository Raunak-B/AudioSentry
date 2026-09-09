import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, ShieldCheck, Search, Activity, Fingerprint, ShieldAlert, Cpu, Mic, Info } from 'lucide-react';
import './DeepScanResults.css';

const ENGINE_HTTP_URL = import.meta.env.VITE_ENGINE_HTTP_URL || "http://localhost:8000";

export function DeepScanResults({ callId = "ACC-1001" }) {

  const [loading, setLoading] = useState(true);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    async function runDeepScan() {
      try {
        const mockMetadata = {
          call_origin_risk: "low",
          transaction_context: { transfer_value: 0, privilege_escalation: false },
          historical_fraud_indicators: []
        };

        const res = await fetch(`${ENGINE_HTTP_URL}/deepscan/${callId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockMetadata)
        });

        if (res.ok) {
          const data = await res.json();
          setScanResult(data);
        } else {
          console.error("Deep scan failed");
        }
      } catch (err) {
        console.error("Failed to run deep scan:", err);
      } finally {
        setLoading(false);
      }
    }

    runDeepScan();
  }, [callId]);

  if (loading) {
    return (
      <div className="dsr-container flex items-center justify-center min-h-[60vh]">
        <div className="text-xl font-bold text-primary animate-pulse">Running Deep Scan...</div>
      </div>
    );
  }

  if (!scanResult) {
    return (
      <div className="dsr-container flex items-center justify-center min-h-[60vh]">
        <div className="text-xl font-bold text-[var(--color-error)]">Failed to load Deep Scan Results.</div>
      </div>
    );
  }

  // Parse the reason string for breakdown
  // Treat comma separated values as distinct signals
  const signals = scanResult.reason ? scanResult.reason.split(',').map(s => s.trim()).filter(Boolean) : ["No specific signals detected"];

  // Risk Tier Colors
  let actionBg = "#34a853"; // green
  if (scanResult.recommended_action.includes("FREEZE") || scanResult.recommended_action.includes("ESCALATE")) actionBg = "#ef4444"; // red
  else if (scanResult.recommended_action.includes("STEPUP") || scanResult.recommended_action.includes("CALLBACK")) actionBg = "#f59e0b"; // amber

  return (
    <div className="dsr-container" style={{ padding: '0', maxWidth: '100%', border: 'none' }}>
      <div className="flex flex-col w-full gap-6">

        {/* Reason String Panel: Prominent Neomorphic Raised Card */}
        <section className="w-full">
          <div className="neo-raised p-8 rounded-[32px] bg-surface relative overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.5)' }}>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className={`inline-flex items-center gap-2.5 px-4 py-2 neo-inset rounded-full bg-surface ${scanResult.risk_score >= 80 ? 'text-[var(--color-error)]' : scanResult.risk_score >= 50 ? 'text-[var(--color-warning)]' : 'text-[#34a853]'}`}>
                <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${scanResult.risk_score >= 80 ? 'bg-[var(--color-error)]' : scanResult.risk_score >= 50 ? 'bg-[var(--color-warning)]' : 'bg-[#34a853]'}`}></span>
                <span className="font-label-md tracking-wider uppercase font-bold text-xs" style={{ fontSize: '0.85rem' }}>
                  {scanResult.risk_score >= 80 ? 'CRITICAL RISK DETECTED' : scanResult.risk_score >= 50 ? 'ELEVATED RISK' : 'LOW RISK'} — SCORE {scanResult.risk_score}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-label-sm text-on-surface-variant neo-inset px-3 py-1.5 rounded-full">
                <Fingerprint size={16} className="text-primary" /> Session: <span className="font-bold text-primary">{callId}</span>
              </div>
            </div>

            <div className="flex items-start gap-5">
              <div className={`w-14 h-14 rounded-2xl neo-inset flex items-center justify-center flex-shrink-0 mt-1 ${scanResult.risk_score >= 80 ? 'text-[var(--color-error)]' : 'text-primary'}`}>
                <AlertTriangle size={32} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-headline-md text-on-surface leading-snug font-semibold" style={{ fontSize: '1.25rem' }}>
                  {scanResult.reason || "No explicit reason provided by the engine."}
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* Main Grid: Per-Signal Breakdown & Visual Explainability */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Per-Signal Breakdown (7 Cols) */}
          <section className="lg:col-span-7 flex flex-col gap-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-headline-md text-on-surface-variant flex items-center gap-3">
                <Activity className="text-primary" size={24} />
                Signal Forensic Breakdown
              </h3>
              <span className="font-label-sm text-on-surface-variant uppercase tracking-wider">{signals.length} Signals Detected</span>
            </div>

            {signals.map((signal, idx) => (
              <div key={idx} className="neo-raised p-5 rounded-2xl bg-surface relative overflow-hidden transition-all hover:-translate-y-0.5">
                <div className={`absolute top-0 left-0 w-1.5 h-full ${scanResult.risk_score >= 80 ? 'bg-[var(--color-error)]' : 'bg-primary'}`}></div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-11 h-11 rounded-xl neo-inset flex items-center justify-center shrink-0 ${scanResult.risk_score >= 80 ? 'text-[var(--color-error)]' : 'text-primary'}`}>
                      <Search size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-label-md text-on-surface font-bold">Signal Parameter {idx + 1}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${scanResult.risk_score >= 80 ? 'bg-[var(--color-error)] text-[var(--color-error)] bg-opacity-10' : 'bg-primary text-primary bg-opacity-10'}`} style={{ backgroundColor: scanResult.risk_score >= 80 ? 'rgba(239,68,68,0.1)' : 'rgba(144,77,0,0.1)' }}>
                          {scanResult.risk_score >= 80 ? 'Critical' : 'Flagged'}
                        </span>
                      </div>
                      <p className="font-body-md text-on-surface-variant text-sm leading-relaxed" style={{ textTransform: 'capitalize' }}>
                        {signal}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Visual Explainability & Action (5 Cols) */}
          <section className="lg:col-span-5 flex flex-col gap-6">

            {/* Explainability Panel */}
            <div className="neo-raised p-6 rounded-[32px] bg-surface flex flex-col gap-4" style={{ border: '1px solid rgba(255,255,255,0.4)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-label-md text-on-surface font-bold">Visual Explainability: Mel-Spectrogram Heatmap</h3>
                  <p className="font-label-sm text-on-surface-variant font-mono">Acoustic Splicing &amp; Thermal Overlay</p>
                </div>
                <span className="px-3 py-1 neo-inset rounded-full font-label-sm font-semibold text-primary uppercase tracking-wide">Forensic Evidence</span>
              </div>

              <div className="neo-inset rounded-[24px] p-2 bg-surface overflow-hidden relative group min-h-[160px] flex flex-col items-center justify-center">
                {scanResult.heatmap_png ? (
                  <>
                    <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-surface/90 backdrop-blur-md rounded-full shadow-sm flex items-center gap-2" style={{ border: '1px solid rgba(255,255,255,0.5)' }}>
                      <div className="w-2 h-2 rounded-full bg-[var(--color-error)] animate-pulse" style={{ backgroundColor: 'var(--color-error)' }}></div>
                      <span className="font-mono text-xs uppercase tracking-wider font-bold text-on-surface">Live Splicing Heatmap</span>
                    </div>
                    <img alt="Mel-Spectrogram Forensic Heatmap" className="w-full h-48 object-cover rounded-xl shadow-inner border block group-hover:scale-105 transition-transform duration-700" style={{ borderColor: 'rgba(219,218,217,0.4)' }} src={scanResult.heatmap_png} />
                  </>
                ) : (
                  <p className="text-on-surface-variant font-bold text-center">No acoustic anomaly flagged</p>
                )}
              </div>

              {scanResult.heatmap_png && (
                <div className="neo-inset p-4 rounded-2xl bg-surface flex items-start gap-3">
                  <Info className="text-primary shrink-0 mt-0.5" size={20} />
                  <p className="font-body-md text-on-surface-variant text-xs leading-relaxed">
                    Yellow/orange heat bands highlight potential artifacts and anomalous energy spikes detected in the spectrogram.
                  </p>
                </div>
              )}
            </div>

            {/* Action Section */}
            <div className="neo-raised p-6 rounded-[32px] bg-surface flex flex-col gap-4" style={{ border: '1px solid rgba(255,255,255,0.4)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-label-sm font-bold uppercase tracking-widest text-on-surface-variant">Recommended Response</span>
              </div>

              <div className="relative w-full">
                <button
                  className="relative z-10 w-full neo-raised text-white py-5 px-6 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg hover:brightness-110 active:scale-[0.98] transition-all group"
                  style={{ backgroundColor: actionBg, color: '#fff' }}
                >
                  <div className="flex items-center justify-center gap-2.5 flex-wrap text-center">
                    <ShieldAlert size={22} color="#ffffff" className="shrink-0" />
                    <span className="font-headline-md text-white text-base tracking-wide uppercase font-bold text-center">
                      {scanResult.recommended_action.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="font-mono text-white/90 text-xs tracking-wider uppercase font-semibold mt-1 px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                    {scanResult.recommended_action}
                  </span>
                  <span className="font-label-sm text-white/90 text-xs tracking-wide font-normal mt-0.5 text-center">
                    Automated protocol applied to Session {callId}
                  </span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
