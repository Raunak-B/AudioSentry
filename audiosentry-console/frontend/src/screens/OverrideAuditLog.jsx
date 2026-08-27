import React from 'react';
import { Filter, Download, Eye } from 'lucide-react';
import './OverrideAuditLog.css';

export function OverrideAuditLog() {
  const logs = [
    { id: 'AL-9021', time: '14:22:05', agent: 'S. Connor', session: 'INB-7729-A', action: 'Intercept Call', reason: 'High Deepfake Probability' },
    { id: 'AL-9020', time: '14:15:33', agent: 'System', session: 'INB-7728-B', action: 'Auto-Reject', reason: 'Voiceprint Mismatch' },
    { id: 'AL-9019', time: '13:59:12', agent: 'M. Vance', session: 'INB-7727-A', action: 'Manual Override', reason: 'Customer Authenticated via Video' },
    { id: 'AL-9018', time: '13:45:01', agent: 'S. Connor', session: 'INB-7726-C', action: 'Flag for Review', reason: 'Elevated Stress Levels' },
    { id: 'AL-9017', time: '13:10:44', agent: 'System', session: 'INB-7725-A', action: 'Approve', reason: 'All Checks Passed' },
  ];

  return (
    <div className="audit-container">
      <div className="audit-header">
        <div>
          <h1 className="text-display-lg text-on-surface">Audit Logs & Overrides</h1>
          <p className="text-body-lg text-on-surface-variant mt-2">
            Historical record of all automated decisions and manual agent interventions.
          </p>
        </div>
        <div className="flex gap-4">
          <button className="neo-raised px-6 py-2 rounded-full flex items-center gap-2">
            <Filter size={18} /> Filter
          </button>
          <button className="neo-raised px-6 py-2 rounded-full flex items-center gap-2">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      <div className="audit-grid neo-inset">
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
                <span className={`audit-badge ${
                  log.action.includes('Reject') || log.action.includes('Intercept') 
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
    </div>
  );
}
