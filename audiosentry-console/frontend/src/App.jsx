import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LiveCallMonitor } from './screens/LiveCallMonitor';
import { DeepScanResults } from './screens/DeepScanResults';
import { AlertBannerStates } from './screens/AlertBannerStates';
import { Enrollment } from './screens/Enrollment';
import { OverrideAuditLog } from './screens/OverrideAuditLog';
import { FileUploadTestMode } from './screens/FileUploadTestMode';
import { ComplianceBotSandbox } from './screens/ComplianceBotSandbox';

// Wrapper to inject React Router navigation into the button
function MonitorWithNav() {
  const navigate = useNavigate();
  return <LiveCallMonitor onRunDeepScan={(id) => navigate('/deep-scan')} />;
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/monitor" replace />} />
          <Route path="/monitor" element={<MonitorWithNav />} />
          <Route path="/deep-scan" element={<DeepScanResults />} />
          <Route path="/alerts" element={<AlertBannerStates />} />
          <Route path="/enrollment" element={<Enrollment />} />
          <Route path="/audit" element={<OverrideAuditLog />} />
          <Route path="/test" element={<FileUploadTestMode />} />
          <Route path="/compliance-bot" element={<ComplianceBotSandbox />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;