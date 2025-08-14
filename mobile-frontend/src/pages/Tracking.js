import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Layers, 
  Filter,
  Smartphone,
  Wifi,
  WifiOff,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Clock,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import MobileMap from '../components/MobileMap';

const DEFAULT_MAP_CENTER = [0, 0];
const DEFAULT_MAP_ZOOM = 2;

const Tracking = () => {
  const [mapType, setMapType] = useState('satellite');
  const [showOffline, setShowOffline] = useState(true);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [devicesWithLocations, setDevicesWithLocations] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_MAP_ZOOM);
  
  // History tracking and replay states
  const [showHistory, setShowHistory] = useState(false);
  const [historyPeriod, setHistoryPeriod] = useState('1h'); // 1h, 6h, 24h, 7d
  const [isReplaying, setIsReplaying] = useState(false);
  const [replaySpeed, setReplaySpeed] = useState(1); // 1x, 2x, 4x, 8x
  const [currentReplayTime, setCurrentReplayTime] = useState(null);
  const [historyData, setHistoryData] = useState({});
  const [replayInterval, setReplayInterval] = useState(null);
  const [showTrails, setShowTrails] = useState(true);

  const { devices, records, loading } = useData();

  // Replay control functions
  const startReplay = () => {
    if (Object.keys(historyData).length === 0) return;
    
    const allTimestamps = Object.values(historyData)
      .flat()
      .map(record => record.timestamp);
    const minTimestamp = Math.min(...allTimestamps);
    const maxTimestamp = Math.max(...allTimestamps);
    
    if (!currentReplayTime) {
      setCurrentReplayTime(minTimestamp);
    }
    
    const interval = setInterval(() => {
      setCurrentReplayTime(prevTime => {
        if (!prevTime) return minTimestamp;
        
        const nextTime = prevTime + (1000 * replaySpeed); // 1 second * speed
        if (nextTime > maxTimestamp) {
          setIsReplaying(false);
          clearInterval(interval);
          return maxTimestamp;
        }
        return nextTime;
      });
    }, 1000); // Update every second
    
    setReplayInterval(interval);
    setIsReplaying(true);
  };

  const pauseReplay = () => {
    if (replayInterval) {
      clearInterval(replayInterval);
      setReplayInterval(null);
    }
    setIsReplaying(false);
  };

  const resetReplay = () => {
    pauseReplay();
    const allTimestamps = Object.values(historyData)
      .flat()
      .map(record => record.timestamp);
    const minTimestamp = Math.min(...allTimestamps);
    setCurrentReplayTime(minTimestamp);
  };

  const skipToStart = () => {
    const allTimestamps = Object.values(historyData)
      .flat()
      .map(record => record.timestamp);
    const minTimestamp = Math.min(...allTimestamps);
    setCurrentReplayTime(minTimestamp);
  };

  const skipToEnd = () => {
    const allTimestamps = Object.values(historyData)
      .flat()
      .map(record => record.timestamp);
    const maxTimestamp = Math.max(...allTimestamps);
    setCurrentReplayTime(maxTimestamp);
  };

  // Cleanup replay interval on unmount
  useEffect(() => {
    return () => {
      if (replayInterval) {
        clearInterval(replayInterval);
      }
    };
  }, [replayInterval]);

  // Map devices with their latest location data from records - same as existing frontend approach
  useEffect(() => {
    if (devices && records) {
      const mappedDevices = devices.map(device => {
        const deviceRecords = records.filter(record => record.deviceImei === device.imei);
        const latestRecord = deviceRecords.length > 0 
          ? deviceRecords.reduce((latest, current) => 
              new Date(current.datetime || current.timestamp) > new Date(latest.datetime || latest.timestamp) ? current : latest
            )
          : null;
        return {
          ...device,
          latitude: latestRecord?.latitude || null,
          longitude: latestRecord?.longitude || null,
          speed: latestRecord?.speed || null,
          direction: latestRecord?.direction || null,
          lastSeen: latestRecord?.datetime || latestRecord?.timestamp || null,
          status: latestRecord ? 'online' : 'offline'
        };
      });
      setDevicesWithLocations(mappedDevices);
    }
  }, [devices, records]);

  // Process history data for replay
  useEffect(() => {
    if (showHistory && devices && records) {
      const now = new Date();
      const periodMs = {
        '1h': 60 * 60 * 1000,
        '6h': 6 * 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000
      };
      
      const startTime = new Date(now.getTime() - periodMs[historyPeriod]);
      
      const history = {};
      devices.forEach(device => {
        const deviceRecords = records
          .filter(record => 
            record.deviceImei === device.imei &&
            record.latitude && 
            record.longitude &&
            new Date(record.datetime || record.timestamp) >= startTime
          )
          .sort((a, b) => new Date(a.datetime || a.timestamp) - new Date(b.datetime || b.timestamp));
        
        if (deviceRecords.length > 0) {
          history[device.imei] = deviceRecords.map(record => ({
            ...record,
            timestamp: new Date(record.datetime || record.timestamp).getTime()
          }));
        }
      });
      
      setHistoryData(history);
      
      // Set initial replay time to the start of the period
      if (Object.keys(history).length > 0) {
        const allTimestamps = Object.values(history)
          .flat()
          .map(record => record.timestamp);
        const minTimestamp = Math.min(...allTimestamps);
        setCurrentReplayTime(minTimestamp);
      }
    }
  }, [showHistory, historyPeriod, devices, records]);

  // When selectedDevice changes, update map center/zoom
  useEffect(() => {
    if (selectedDevice && selectedDevice.latitude && selectedDevice.longitude) {
      setMapCenter([selectedDevice.latitude, selectedDevice.longitude]);
      setMapZoom(14);
    } else {
      // Default center/zoom
      setMapCenter(DEFAULT_MAP_CENTER);
      setMapZoom(DEFAULT_MAP_ZOOM);
    }
  }, [selectedDevice]);

  if (loading) {
    return <LoadingSpinner text="Loading tracking data..." />;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <Wifi className="w-4 h-4 text-success-600" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-gray-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning-600" />;
      default:
        return <Smartphone className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'online':
        return 'mobile-status-online';
      case 'offline':
        return 'mobile-status-offline';
      case 'warning':
        return 'mobile-status-warning';
      default:
        return 'mobile-status-offline';
    }
  };

  // Get current replay data for devices
  const getCurrentReplayDevices = () => {
    if (!showHistory || !currentReplayTime || Object.keys(historyData).length === 0) {
      return devicesWithLocations;
    }

    return devicesWithLocations.map(device => {
      const deviceHistory = historyData[device.imei];
      if (!deviceHistory || deviceHistory.length === 0) {
        return device;
      }

      // Find the record closest to current replay time
      const currentRecord = deviceHistory.find(record => 
        record.timestamp >= currentReplayTime
      ) || deviceHistory[deviceHistory.length - 1];

      return {
        ...device,
        latitude: currentRecord?.latitude || device.latitude,
        longitude: currentRecord?.longitude || device.longitude,
        speed: currentRecord?.speed || device.speed,
        direction: currentRecord?.direction || device.direction,
        lastSeen: currentRecord?.datetime || currentRecord?.timestamp || device.lastSeen,
        status: currentRecord ? 'online' : 'offline',
        isHistorical: true,
        replayTime: currentReplayTime
      };
    });
  };

  const currentDevices = getCurrentReplayDevices();
  const devicesArray = Array.isArray(currentDevices) ? currentDevices : [];
  const filteredDevices = devicesArray.filter(device => showOffline || device.status !== 'offline') || [];
  const onlineDevices = devicesArray.filter(device => device.status === 'online') || [];
  const offlineDevices = devicesArray.filter(device => device.status === 'offline') || [];

  // Full-screen map component
  if (isMapFullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Device Tracking</h2>
          <button 
            onClick={() => setIsMapFullScreen(false)}
            className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1">
          <MobileMap
            devices={filteredDevices}
            mapType={mapType}
            height="calc(100vh - 80px)"
            center={mapCenter}
            zoom={mapZoom}
            onDeviceClick={(device) => {
              setSelectedDevice(device);
            }}
            historyData={historyData}
            showTrails={showHistory && showTrails}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tracking</h1>
          <p className="text-gray-600">{onlineDevices.length} devices online</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            <Navigation className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Map Controls */}
      <div className="mobile-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Map Controls</h3>
          <Layers className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {/* Map Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Map Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'satellite', label: 'Satellite' },
                { id: 'street', label: 'Street' },
                { id: 'hybrid', label: 'Hybrid' },
                { id: 'terrain', label: 'Terrain' }
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setMapType(type.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mapType === type.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Device Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Device Filter
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showOffline}
                  onChange={(e) => setShowOffline(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Show offline devices</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* History Tracking Controls */}
      <div className="mobile-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">History Tracking</h3>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {/* History Toggle */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showHistory}
                onChange={(e) => setShowHistory(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-gray-700">Enable History Tracking</span>
            </label>
          </div>

          {/* Period Selection */}
          {showHistory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                History Period
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: '1h', label: '1 Hour' },
                  { id: '6h', label: '6 Hours' },
                  { id: '24h', label: '24 Hours' },
                  { id: '7d', label: '7 Days' }
                ].map((period) => (
                  <button
                    key={period.id}
                    onClick={() => setHistoryPeriod(period.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      historyPeriod === period.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trails Toggle */}
          {showHistory && (
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showTrails}
                  onChange={(e) => setShowTrails(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Show device trails</span>
              </label>
            </div>
          )}

          {/* Replay Controls */}
          {showHistory && Object.keys(historyData).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Replay Controls</span>
                {currentReplayTime && (
                  <span className="text-xs text-gray-500">
                    {new Date(currentReplayTime).toLocaleString()}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={skipToStart}
                  className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  title="Skip to Start"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                
                <button
                  onClick={isReplaying ? pauseReplay : startReplay}
                  className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  title={isReplaying ? 'Pause' : 'Play'}
                >
                  {isReplaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                
                <button
                  onClick={skipToEnd}
                  className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  title="Skip to End"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
                
                <button
                  onClick={resetReplay}
                  className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  title="Reset"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Replay Speed */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Replay Speed
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 4, 8].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setReplaySpeed(speed)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        replaySpeed === speed
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Real Interactive Map */}
      <div className="mobile-card">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Device Locations</h3>
            <p className="text-sm text-gray-500">Tap markers to view device details</p>
          </div>
          <button 
            onClick={() => setIsMapFullScreen(true)}
            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            title="Full Screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
        <div className="aspect-video rounded-lg overflow-hidden border border-gray-200">
          <MobileMap
            devices={filteredDevices}
            mapType={mapType}
            height="100%"
            center={mapCenter}
            zoom={mapZoom}
            onDeviceClick={(device) => {
              setSelectedDevice(device);
            }}
            historyData={historyData}
            showTrails={showHistory && showTrails}
          />
        </div>
      </div>

      {/* Device List */}
      <div className="mobile-card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Device List</h3>
          <Filter className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredDevices.map((device) => (
            <div
              key={device.id}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                selectedDevice && selectedDevice.id === device.id
                  ? 'bg-primary-100 border border-primary-400'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedDevice(device)}
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(device.status)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{device.name}</p>
                  <p className="text-xs text-gray-500">{device.imei}</p>
                  {device.lastSeen && (
                    <p className="text-xs text-gray-400">
                      Last seen {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : ''}
                    </p>
                  )}
                </div>
              </div>
              <span className={`mobile-status-indicator ${getStatusClass(device.status)}`}>{device.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tracking; 