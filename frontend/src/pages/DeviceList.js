import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Box,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  LocationOn as LocationIcon, 
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import useWebSocket from '../hooks/useWebSocket';
import { apiFetchDevices } from '../services/api';
import DeviceEditDialog from '../components/DeviceEditDialog';

const DeviceList = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // WebSocket connection for real-time updates
  const handleWebSocketMessage = useCallback((message) => {
    if (message.topic === 'device_updated') {
      const data = message.data || message;
      console.log('Device update received:', data);
      
      if (data.isNew) {
        // New device - add to list
        setDevices(prevDevices => {
          const newDevice = {
            id: Date.now(), // Temporary ID
            name: `Device ${data.imei}`,
            imei: data.imei,
            status: data.isActive ? 'Active' : 'Inactive',
            lastSeen: data.lastSeen,
            isActive: data.isActive
          };
          
          // Check if device already exists
          const exists = prevDevices.find(d => d.imei === data.imei);
          if (exists) {
            // Update existing device
            return prevDevices.map(d => 
              d.imei === data.imei 
                ? { ...d, lastSeen: data.lastSeen, isActive: data.isActive, status: data.isActive ? 'Active' : 'Inactive' }
                : d
            );
          } else {
            // Add new device
            return [...prevDevices, newDevice];
          }
        });
      } else {
        // Existing device update
        setDevices(prevDevices => 
          prevDevices.map(d => 
            d.imei === data.imei 
              ? { ...d, lastSeen: data.lastSeen, isActive: data.isActive, status: data.isActive ? 'Active' : 'Inactive' }
              : d
          )
        );
      }
    }
  }, []);

  const ws = useWebSocket(null, handleWebSocketMessage);

  // Fetch devices from API
  const fetchDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetchDevices();
      if (response.success) {
        setDevices(response.data || []);
      } else {
        setError(response.message || 'Failed to fetch devices');
      }
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError('Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDevices();
  }, []);



  const handleDeviceClick = (deviceId) => {
    navigate(`/devices/${deviceId}`);
  };

  const handleTrackingClick = () => {
    navigate('/tracking');
  };

  const handleEditDevice = (device) => {
    setSelectedDevice(device);
    setEditDialogOpen(true);
  };

  const handleEditSave = (updatedDevice) => {
    setDevices(prevDevices => 
      prevDevices.map(d => 
        d.id === updatedDevice.id ? updatedDevice : d
      )
    );
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedDevice(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatLastSeen = (lastSeen) => {
    if (!lastSeen) return 'Never';
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading devices...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Devices
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchDevices}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<LocationIcon />}
            onClick={handleTrackingClick}
          >
            View Tracking
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {(!ws || ws.readyState !== WebSocket.OPEN) && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          WebSocket disconnected - real-time updates unavailable
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>IMEI</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Seen</TableCell>
              <TableCell>Custom Fields</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1" color="textSecondary">
                    No devices found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              devices.map((device) => (
                <TableRow key={device.id || device.imei}>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {device.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {device.imei}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={device.status} 
                      color={getStatusColor(device.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatLastSeen(device.lastSeen)}</TableCell>
                  <TableCell>
                    {device.customFields && Object.keys(device.customFields).length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {Object.entries(device.customFields).slice(0, 2).map(([key, value]) => (
                          <Chip
                            key={key}
                            label={`${key}: ${value}`}
                            size="small"
                            variant="outlined"
                            color="secondary"
                          />
                        ))}
                        {Object.keys(device.customFields).length > 2 && (
                          <Chip
                            label={`+${Object.keys(device.customFields).length - 2} more`}
                            size="small"
                            variant="outlined"
                            color="info"
                          />
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No custom fields
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit Device">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditDevice(device)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleDeviceClick(device.id || device.imei)}
                      >
                        Details
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Device Edit Dialog */}
      <DeviceEditDialog
        open={editDialogOpen}
        device={selectedDevice}
        onClose={handleEditClose}
        onSave={handleEditSave}
      />
    </Container>
  );
};

export default DeviceList; 