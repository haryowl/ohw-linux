import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import DeviceDetail from './pages/DeviceDetail';
import Tracking from './pages/Tracking';
import Settings from './pages/Settings';
import MobileLayout from './components/MobileLayout';
import LoadingSpinner from './components/LoadingSpinner';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user, setOnLoginSuccess } = useAuth();
  const { loadInitialData } = useData();

  // Set up the callback to load data after login
  React.useEffect(() => {
    setOnLoginSuccess(() => loadInitialData);
  }, [setOnLoginSuccess, loadInitialData]);

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <MobileLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/devices/:id" element={<DeviceDetail />} />
        <Route path="/tracking" element={<Tracking />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MobileLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <div className="mobile-container">
          <AppRoutes />
        </div>
      </DataProvider>
    </AuthProvider>
  );
}

export default App; 