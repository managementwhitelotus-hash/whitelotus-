import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Workers } from './pages/Workers';
import { Attendance } from './pages/Attendance';
import { Settings } from './pages/Settings';
import { WorkerPanel } from './pages/WorkerPanel';
import { Layout } from './components/Layout';

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
    // In a real app, check for an auth token here
    return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/worker/:id" element={<WorkerPanel />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<ProtectedAdminRoute><Dashboard /></ProtectedAdminRoute>} />
        <Route path="/admin/workers" element={<ProtectedAdminRoute><Workers /></ProtectedAdminRoute>} />
        <Route path="/admin/attendance" element={<ProtectedAdminRoute><Attendance /></ProtectedAdminRoute>} />
        <Route path="/admin/settings" element={<ProtectedAdminRoute><Settings /></ProtectedAdminRoute>} />
      </Routes>
    </HashRouter>
  );
};

export default App;