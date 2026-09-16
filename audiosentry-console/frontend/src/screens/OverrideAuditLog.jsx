import React, { useState } from 'react';
import { Filter, Download, Eye, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import './OverrideAuditLog.css';

const ENGINE_HTTP_URL = import.meta.env.VITE_ENGINE_HTTP_URL || "http://localhost:8000";

export function OverrideAuditLog() {
  const logs = [
    { id: 'AL-9021', time: '14:22:05', agent: 'S. Connor', session: 'INB-7729-A', action: 'Intercept Call', reason: 'High Deepfake Probability' },
    { id: 'AL-9020', time: '14:15:33', agent: 'System', session: 'INB-7728-B', action: 'Auto-Reject', reason: 'Voiceprint Mismatch' },
    { id: 'AL-9019', time: '13:59:12', agent: 'M. Vance', session: 'INB-7727-A', action: 'Manual Override', reason: 'Customer Authenticated via Video' },
    { id: 'AL-9018', time: '13:45:01', agent: 'S. Connor', session: 'INB-7726-C', action: 'Flag for Review', reason: 'Elevated Stress Levels' },
    { id: 'AL-9017', time: '13:10:44', agent: 'System', session: 'INB-7725-A', action: 'Approve', reason: 'All Checks Passed' },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ callId: '', decision: 'false_positive', notes: '' });
  const [submitState, setSubmitState] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleOpenModal = () => {
    setFormData({ callId: '', decision: 'false_positive', notes: '' });
    setSubmitState('idle');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.callId) return;

    setSubmitState('loading');
    setErrorMessage('');

    try {
      const payload = {
        notes: formData.notes,
        decision: formData.decision,
        timestamp: new Date().toISOString(),
        agent_id: "agent-front" // stub
      };

      const res = await fetch(`${ENGINE_HTTP_URL}/override/${formData.callId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Engine returned ${res.status}`);
      }

      setSubmitState('success');
      // Auto-close after success
      setTimeout(() => setIsModalOpen(false), 2000);
    } catch (err) {
      console.error("Override submission failed:", err);
      setErrorMessage(err.message || "Network Error");
      setSubmitState('error');
    }
  };

  return (
    <div className="audit-container relative">
      <div className="audit-header">
        <div>
          <h1 className="text-display-lg text-on-surface">Audit Logs & Overrides</h1>
          <p className="text-body-lg text-on-surface-variant mt-2">
            Historical record of all automated decisions and manual agent interventions.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="neo-raised px-6 py-2 rounded-full flex items-center gap-2" onClick={handleOpenModal}>
            <Plus size={18} className="text-primary" /> New Override
          </button>
          <button className="neo-raised px-6 py-2 rounded-full flex items-center gap-2">
            <Filter size={18} /> Filter
          </button>
          <button className="neo-raised px-6 py-2 rounded-full flex items-center gap-2">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      <div className="audit-grid neo-inset mt-6">
        <div className="audit-table-header text-label-sm text-on-surface-variant uppercase tracking-widest">
          <div>Log ID</div>
          <div>Timestamp</div>
          <div>Agent/System</div>
          <div>Session</div>
          <div>Action Taken</div>
          <div>Reason</div>
          <div className="text-right">Details</div>
        </div>

        <div className="audit-table-body">
          {logs.map((log) => (
            <div key={log.id} className="audit-row neo-raised">
              <div className="text-label-md">{log.id}</div>
              <div className="text-body-md text-on-surface-variant">{log.time}</div>
              <div className="text-body-md">{log.agent}</div>
              <div className="text-body-md text-primary">{log.session}</div>
              <div>
                <span className={`audit-badge ${log.action.includes('Reject') || log.action.includes('Intercept')
                    ? 'audit-badge-error'
                    : log.action.includes('Approve')
                      ? 'audit-badge-success'
                      : 'audit-badge-warning'
                  }`}>
                  {log.action}
                </span>
              </div>
              <div className="text-body-md text-on-surface-variant truncate">{log.reason}</div>
              <div className="flex justify-end">
                <button className="neo-inset p-2 rounded-lg text-primary hover:text-primary-container">
                  <Eye size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="neo-raised bg-surface p-8 rounded-[32px] w-full max-w-md border border-white/50 shadow-2xl relative">
            <h2 className="text-headline-md font-bold text-on-surface mb-6">Log Manual Override</h2>

            {submitState === 'success' ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4 text-primary">
                <CheckCircle size={64} className="text-[#16A34A] animate-pulse" />
                <p className="text-headline-md font-bold text-[#16A34A]">Override Logged!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Call ID</label>
                  <input
                    type="text"
                    required
                    className="neo-inset bg-surface p-3 rounded-xl outline-none focus:border focus:border-primary text-on-surface"
                    placeholder="e.g. INB-7729-A"
                    value={formData.callId}
                    onChange={(e) => setFormData({ ...formData, callId: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Decision</label>
                  <select
                    className="neo-inset bg-surface p-3 rounded-xl outline-none focus:border focus:border-primary text-on-surface"
                    value={formData.decision}
                    onChange={(e) => setFormData({ ...formData, decision: e.target.value })}
                  >
                    <option value="false_positive">Mark as False Positive</option>
                    <option value="confirm_fraud">Confirm Fraud Activity</option>
                    <option value="step_up">Trigger Step-Up Auth</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">Analyst Notes</label>
                  <textarea
                    required
                    rows="3"
                    className="neo-inset bg-surface p-3 rounded-xl outline-none focus:border focus:border-primary text-on-surface resize-none"
                    placeholder="Rationale for override..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  ></textarea>
                </div>

                {submitState === 'error' && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#DC2626]/10 text-[#DC2626] neo-inset">
                    <AlertCircle size={18} />
                    <span className="text-sm font-bold">Failed to connect to Engine</span>
                  </div>
                )}

                <div className="flex gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 neo-inset rounded-xl font-bold text-on-surface-variant hover:text-on-surface transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitState === 'loading'}
                    className="flex-1 py-3 neo-raised bg-primary text-on-primary rounded-xl font-bold flex justify-center items-center gap-2 hover:brightness-110 active:neo-inset disabled:opacity-50 transition-all"
                  >
                    {submitState === 'loading' ? (
                      <span className="animate-pulse">Submitting...</span>
                    ) : (
                      'Submit'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
