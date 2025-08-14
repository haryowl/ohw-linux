import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { devicesApi, dataApi, alertsApi } from '../services/api';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [devices, setDevices] = useState([]);
  const [records, setRecords] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false); // Start as false, only load when authenticated
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    totalRecords: 0,
    totalAlerts: 0,
    lastUpdate: null
  });

  // Fetch devices - same as existing frontend
  const fetchDevices = useCallback(async () => {
    try {
      const devicesData = await devicesApi.getAll();
      setDevices(devicesData);
      return devicesData;
    } catch (error) {
      console.error('Error fetching devices:', error);
      return [];
    }
  }, []);

  // Fetch records - same as existing frontend
  const fetchRecords = useCallback(async () => {
    try {
      // Fetch all records for the last 24h by default - same as existing frontend
      const recordsData = await dataApi.getAllRecords({ range: '24h', limit: 'all' });
      setRecords(recordsData);
    } catch (error) {
      console.error('Error fetching records:', error);
      setRecords([]);
    }
  }, []);

  // Fetch alerts - same as existing frontend
  const fetchAlerts = useCallback(async () => {
    try {
      const alertsData = await alertsApi.getAll();
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setError('Failed to load alerts');
    }
  }, []);

  // Fetch stats - same as existing frontend
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await dataApi.getDashboardData();
      setStats({
        ...statsData,
        lastUpdate: new Date()
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(prev => ({
        ...prev,
        lastUpdate: new Date()
      }));
    }
  }, []);

  // Load initial data - only when authenticated
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchDevices(),
        fetchRecords(),
        fetchAlerts(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load application data');
    } finally {
      setLoading(false);
    }
  }, [fetchDevices, fetchRecords, fetchAlerts, fetchStats]);

  const value = {
    devices,
    records,
    alerts,
    stats,
    loading,
    error,
    refreshDevices: fetchDevices,
    refreshRecords: fetchRecords,
    refreshAlerts: fetchAlerts,
    refreshStats: fetchStats,
    loadInitialData // Export this function to be called after authentication
  };

  // Refresh data periodically - same as existing frontend
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 30000); // Refresh stats every 30 seconds

    return () => clearInterval(interval);
  }, [fetchStats]);

  // Update stats when data changes - same as existing frontend
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      totalDevices: devices.length,
      activeDevices: devices.filter(d => d.status === 'active').length,
      totalRecords: records.length,
      totalAlerts: alerts.length,
      lastUpdate: new Date()
    }));
  }, [devices, records, alerts]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}; 