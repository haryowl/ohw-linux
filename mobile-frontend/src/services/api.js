import axios from 'axios';
import { API_CONFIG } from '../config';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor to add auth headers if needed
api.interceptors.request.use(
  (config) => {
    // Add any request headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on 401 errors - let the components handle it
    // This prevents infinite loops
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  checkAuth: async () => {
    const response = await api.get('/auth/check');
    return response.data;
  },
};

// Devices API
export const devicesApi = {
  getAll: async () => {
    const response = await api.get('/devices');
    return response.data;
  },
  
  getWithLocations: async () => {
    try {
      // Get devices first
      const devicesResponse = await api.get('/devices');
      const devices = devicesResponse.data;
      console.log('Devices loaded:', devices);
      
      // Get recent records for location data - use the same approach as existing frontend
      const recordsResponse = await api.get('/records?range=24h&limit=all');
      const records = recordsResponse.data;
      console.log('Records loaded:', records.length, 'records');
      
      // Map devices with their latest location data from records
      const devicesWithLocations = devices.map(device => {
        // Find the most recent record for this device
        const deviceRecords = records.filter(record => record.deviceImei === device.imei);
        console.log(`Device ${device.imei} has ${deviceRecords.length} records`);
        
        const latestRecord = deviceRecords.length > 0 
          ? deviceRecords.reduce((latest, current) => 
              new Date(current.datetime || current.timestamp) > new Date(latest.datetime || latest.timestamp) ? current : latest
            )
          : null;
        
        const deviceWithLocation = {
          ...device,
          latitude: latestRecord?.latitude || null,
          longitude: latestRecord?.longitude || null,
          speed: latestRecord?.speed || null,
          direction: latestRecord?.direction || null,
          lastSeen: latestRecord?.datetime || latestRecord?.timestamp || null,
          status: latestRecord ? 'online' : 'offline'
        };
        
        console.log(`Device ${device.imei} mapped:`, {
          hasLocation: !!(deviceWithLocation.latitude && deviceWithLocation.longitude),
          latitude: deviceWithLocation.latitude,
          longitude: deviceWithLocation.longitude,
          status: deviceWithLocation.status
        });
        
        return deviceWithLocation;
      });
      
      console.log('Final devices with locations:', devicesWithLocations);
      return devicesWithLocations;
    } catch (error) {
      console.error('Error in getWithLocations:', error);
      throw error;
    }
  },
  
  getById: async (id) => {
    const response = await api.get(`/devices/${id}`);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/devices/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/devices/${id}`);
    return response.data;
  },
};

// Data API
export const dataApi = {
  getDeviceData: async (deviceId, params = {}) => {
    // Get the latest record for this device as device data
    const queryParams = { ...params, imeis: deviceId, limit: 1 };
    const response = await api.get('/records', { params: queryParams });
    const records = response.data;
    
    // Return the latest record as device data, or null if no records
    return records.length > 0 ? records[0] : null;
  },
  
  getDashboardData: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
  
  getRecords: async (deviceId, params = {}) => {
    // Use the records endpoint with device filtering - same as existing frontend
    const queryParams = { ...params };
    if (deviceId) {
      queryParams.imeis = deviceId;
    }
    const response = await api.get('/records', { params: queryParams });
    return response.data;
  },
  
  getTrackingData: async (deviceId, params = {}) => {
    const response = await api.get(`/data/${deviceId}/tracking`, { params });
    return response.data;
  },
  
  // Get all records - same as existing frontend DataTable
  getAllRecords: async (params = {}) => {
    const response = await api.get('/records', { params });
    return response.data;
  },
};

// Alerts API
export const alertsApi = {
  getAll: async () => {
    const response = await api.get('/alerts');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/alerts/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/alerts', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/alerts/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/alerts/${id}`);
    return response.data;
  },
};

// Settings API
export const settingsApi = {
  get: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
  
  update: async (data) => {
    const response = await api.put('/settings', data);
    return response.data;
  },
};

// Users API
export const usersApi = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/users', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default api; 