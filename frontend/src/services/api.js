// frontend/src/services/api.js

// Dynamic API URL detection - works for both localhost and IP access
function getApiBaseUrl() {
  // Get the current frontend URL
  const currentUrl = window.location.href;
  console.log('🔍 Current URL:', currentUrl);
  console.log('🔍 Hostname:', window.location.hostname);
  console.log('🔍 Protocol:', window.location.protocol);
  console.log('🔍 Port:', window.location.port);
  console.log('🔍 Full location object:', window.location);
  
  // Check all possible localhost conditions
  const hasLocalhost = currentUrl.includes('localhost');
  const has127 = currentUrl.includes('127.0.0.1');
  const hostnameIsLocalhost = window.location.hostname === 'localhost';
  const hostnameIs127 = window.location.hostname === '127.0.0.1';
  
  console.log('🔍 hasLocalhost:', hasLocalhost);
  console.log('🔍 has127:', has127);
  console.log('🔍 hostnameIsLocalhost:', hostnameIsLocalhost);
  console.log('🔍 hostnameIs127:', hostnameIs127);
  
  // If accessing from localhost, use localhost backend
  if (hasLocalhost || has127 || hostnameIsLocalhost || hostnameIs127) {
    console.log('🔍 API URL Detection: Using localhost backend');
    return 'http://localhost:3001';
  }
  
  // If accessing from IP address, use the same IP for backend
  const url = new URL(currentUrl);
  const detectedUrl = `http://${url.hostname}:3001`;
  console.log('🔍 API URL Detection: Using IP backend:', detectedUrl);
  return detectedUrl;
}

// API URL configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || getApiBaseUrl();

export const BASE_URL = API_BASE_URL;

console.log('🚀 Final API Base URL:', BASE_URL);

// Helper function to get auth headers (for cookie-based auth, we don't need Authorization header)
function getAuthHeaders() {
  return {
    'Content-Type': 'application/json'
  };
}

// Helper function for authenticated requests
export async function authenticatedFetch(url, options = {}) {
  // Construct full URL if it's a relative path
  const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`;
  
  const response = await fetch(fullUrl, {
    ...options,
    credentials: 'include', // Include cookies in all requests
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });
  
  // Don't automatically redirect on 401 - let components handle it
  return response;
}

export async function fetchDashboardData() {
  const response = await authenticatedFetch(`${BASE_URL}/api/dashboard`);
  return response;
}

export async function fetchDeviceData(deviceId) {
  const response = await authenticatedFetch(`${BASE_URL}/api/devices/${deviceId}`);
  return response;
}

export async function fetchDevices() {
  const response = await authenticatedFetch(`${BASE_URL}/api/devices`);
  return response;
}

export async function apiFetchDevices() {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/api/devices`);
    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        data: data
      };
    } else {
      return {
        success: false,
        message: data.message || 'Failed to fetch devices'
      };
    }
  } catch (error) {
    console.error('Error fetching devices:', error);
    return {
      success: false,
      message: 'Network error while fetching devices'
    };
  }
}

export async function updateDeviceMapping(deviceId, mapping) {
  const response = await authenticatedFetch(`${BASE_URL}/api/devices/${deviceId}/mapping`, {
    method: 'PUT',
    body: JSON.stringify(mapping),
  });
  return response;
}

export async function fetchAlerts() {
  const response = await authenticatedFetch(`${BASE_URL}/api/alerts`);
  return response;
}

export async function createAlert(alert) {
  const response = await authenticatedFetch(`${BASE_URL}/api/alerts`, {
    method: 'POST',
    body: JSON.stringify(alert),
  });
  return response;
}

export async function updateAlert(alertId, alert) {
  const response = await authenticatedFetch(`${BASE_URL}/api/alerts/${alertId}`, {
    method: 'PUT',
    body: JSON.stringify(alert),
  });
  return response;
}

export async function deleteAlert(alertId) {
  const response = await authenticatedFetch(`${BASE_URL}/api/alerts/${alertId}`, {
    method: 'DELETE',
  });
  return response;
}

export async function fetchMappings() {
  const response = await authenticatedFetch(`${BASE_URL}/api/mappings`);
  return response;
}

export async function createMapping(mapping) {
  const response = await authenticatedFetch(`${BASE_URL}/api/mappings`, {
    method: 'POST',
    body: JSON.stringify(mapping),
  });
  return response;
}

export async function updateMapping(mappingId, mapping) {
  const response = await authenticatedFetch(`${BASE_URL}/api/mappings/${mappingId}`, {
    method: 'PUT',
    body: JSON.stringify(mapping),
  });
  return response;
}

export async function deleteMapping(mappingId) {
  const response = await authenticatedFetch(`${BASE_URL}/api/mappings/${mappingId}`, {
    method: 'DELETE',
  });
  return response;
}

export async function fetchSettings() {
  const response = await authenticatedFetch(`${BASE_URL}/api/settings`);
  return response;
}

export async function updateSettings(settings) {
  const response = await authenticatedFetch(`${BASE_URL}/api/settings`, {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
  return response;
}

export async function fetchDataForwarderConfig() {
  const response = await authenticatedFetch(`${BASE_URL}/api/settings/data-forwarder`);
  return response;
}

export async function updateDataForwarderConfig(config) {
  const response = await authenticatedFetch(`${BASE_URL}/api/settings/data-forwarder`, {
    method: 'PUT',
    body: JSON.stringify(config),
  });
  return response;
}

export async function fetchDataForwarderLogs() {
  const response = await authenticatedFetch(`${BASE_URL}/api/settings/data-forwarder/logs`);
  return response;
}

// Add more API functions as needed
