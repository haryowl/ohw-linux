// frontend/src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { AppThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DeviceList from './pages/DeviceList';
import DeviceDetail from './pages/DeviceDetail';
import Mapping from './pages/Mapping';
import Tracking from './pages/Tracking';
import Settings from './pages/Settings';
import Alerts from './pages/Alerts';
import DataTablePage from './pages/DataTable';
import DataExport from './pages/DataExport';
import Login from './pages/Login';
import OfflineGridDemo from './components/OfflineGridDemo';
import UserManagement from './pages/UserManagement';

function App() {
  return (
    <ErrorBoundary>
      <AppThemeProvider>
        <AppContent />
      </AppThemeProvider>
    </ErrorBoundary>
  );
}

function AppContent() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
        <SnackbarProvider 
          maxSnack={3}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <AuthProvider>
              <DataProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={
                    <ProtectedRoute requiredPermission="dashboard">
                      <Layout><Dashboard /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/devices" element={
                    <ProtectedRoute requiredPermission="devices">
                      <Layout><DeviceList /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/devices/:id" element={
                    <ProtectedRoute requiredPermission="devices">
                      <Layout><DeviceDetail /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/mapping" element={
                    <ProtectedRoute requiredPermission="mapping">
                      <Layout><Mapping /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/tracking" element={
                    <ProtectedRoute requiredPermission="tracking">
                      <Layout><Tracking /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute requiredPermission="settings">
                      <Layout><Settings /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/alerts" element={
                    <ProtectedRoute requiredPermission="alerts">
                      <Layout><Alerts /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/data" element={
                    <ProtectedRoute requiredPermission="data">
                      <Layout><DataTablePage /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/export" element={
                    <ProtectedRoute requiredPermission="export">
                      <Layout><DataExport /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/demo" element={
                    <ProtectedRoute requiredPermission="demo">
                      <Layout><OfflineGridDemo /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="/user-management" element={
                    <ProtectedRoute requiredPermission="user-management">
                      <Layout><UserManagement /></Layout>
                    </ProtectedRoute>
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </DataProvider>
            </AuthProvider>
          </BrowserRouter>
        </SnackbarProvider>
      </LocalizationProvider>
  );
}

export default App;
