import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSnackbar } from 'notistack';
import useWebSocket from '../hooks/useWebSocket';
import { BASE_URL } from '../services/api';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [devices, setDevices] = useState([]);
  const [records, setRecords] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalDevices: 0,
    activeDevices: 0,
    totalRecords: 0,
    totalAlerts: 0,
    lastUpdate: null
  });
  const { enqueueSnackbar } = useSnackbar();

  // WebSocket connection for real-time updates
  const handleWebSocketMessage = useCallback((message) => {
    try {
      const { topic, data } = message;
      
      switch (topic) {
        case 'device_update':
        case 'device_updated':
          setDevices(prevDevices => {
            const index = prevDevices.findIndex(d => d.imei === data.imei);
            if (index >= 0) {
              const updated = [...prevDevices];
              updated[index] = { ...updated[index], ...data };
              return updated;
            } else {
              return [...prevDevices, data];
            }
          });
          enqueueSnackbar(`Device ${data.imei} updated`, { variant: 'info' });
          break;
          
        case 'new_record':
          setRecords(prevRecords => [data, ...prevRecords.slice(0, 999)]); // Keep last 1000 records
          setStats(prev => ({
            ...prev,
            totalRecords: prev.totalRecords + 1,
            lastUpdate: new Date()
          }));
          break;
          
        case 'new_alert':
          setAlerts(prevAlerts => [data, ...prevAlerts.slice(0, 99)]); // Keep last 100 alerts
          setStats(prev => ({
            ...prev,
            totalAlerts: prev.totalAlerts + 1,
            lastUpdate: new Date()
          }));
          enqueueSnackbar(`New alert: ${data.message}`, { variant: 'warning' });
          break;
          
        case 'system_status':
          setStats(prev => ({
            ...prev,
            ...data,
            lastUpdate: new Date()
          }));
          break;
          
        default:
          console.log('Unknown WebSocket topic:', topic);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }, [enqueueSnackbar]);

  const ws = useWebSocket(`${BASE_URL.replace('http', 'ws')}`, handleWebSocketMessage);

  // Fetch initial data
  const fetchDevices = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/devices`, {
        credentials: 'include' // Include cookies in the request
      });
      
      if (response.ok) {
        const devices = await response.json();
        setDevices(devices);
        return devices;
      } else {
        console.error('Failed to fetch devices:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      return [];
    }
  }, []);

  const fetchRecords = useCallback(async () => {
    try {
      // Fetch all records for the last 24h by default
      const response = await fetch(`${BASE_URL}/api/records?range=24h&limit=all`, {
        credentials: 'include' // Include cookies in the request
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.log('User not authenticated, skipping records fetch');
          setRecords([]);
          return;
        }
        console.warn('Records endpoint returned error, using empty array');
        setRecords([]);
        return;
      }
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
      setRecords([]); // Use empty array instead of setting error
    }
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/alerts`, {
        credentials: 'include' // Include cookies in the request
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.log('User not authenticated, skipping alerts fetch');
          setAlerts([]);
          return;
        }
        throw new Error('Failed to fetch alerts');
      }
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setError('Failed to load alerts');
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/dashboard/stats`, {
        credentials: 'include' // Include cookies in the request
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.log('User not authenticated, skipping stats fetch');
          setStats(prev => ({
            ...prev,
            lastUpdate: new Date()
          }));
          return;
        }
        console.warn('Stats endpoint returned error, using default stats');
        setStats(prev => ({
          ...prev,
          lastUpdate: new Date()
        }));
        return;
      }
      const data = await response.json();
      setStats({
        ...data,
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

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
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
    };

    loadData();
  }, [fetchDevices, fetchRecords, fetchAlerts, fetchStats]);

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats();
    }, 30000); // Refresh stats every 30 seconds

    return () => clearInterval(interval);
  }, [fetchStats]);

  // Update stats when data changes
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
    ws
  };

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