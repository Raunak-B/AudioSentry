import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LiveCallMonitor } from './screens/LiveCallMonitor';
import { DeepScanResults } from './screens/DeepScanResults';
import { AlertBannerStates } from './screens/AlertBannerStates';
import { Enrollment } from './screens/Enrollment';
import { OverrideAuditLog } from './screens/OverrideAuditLog';
import { FileUploadTestMode } from './screens/FileUploadTestMode';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/monitor" replace />} />
          <Route path="/monitor" element={<LiveCallMonitor />} />
          <Route path="/deep-scan" element={<DeepScanResults />} />
          <Route path="/alerts" element={<AlertBannerStates />} />
          <Route path="/enrollment" element={<Enrollment />} />
          <Route path="/audit" element={<OverrideAuditLog />} />
          <Route path="/test" element={<FileUploadTestMode />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
