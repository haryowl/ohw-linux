import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { 
  ArrowLeft, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  Clock,
  MapPin,
  Battery,
  Signal,
  Activity,
  Settings,
  Download
} from 'lucide-react';
import { devicesApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDistanceToNow, format } from 'date-fns';
import { useData } from '../contexts/DataContext';

const DeviceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { records } = useData();

  // Get device by id (UUID)
  const { data: device, isLoading: deviceLoading } = useQuery(
    ['device', id],
    () => devicesApi.getById(id),
    { refetchInterval: 30000 }
  );

  // Filter records by device IMEI
  const deviceRecords = device && records
    ? records.filter(r => r.deviceImei === device.imei)
    : [];

  if (deviceLoading) {
    return <LoadingSpinner text="Loading device..." />;
  }

  if (!device) {
    return (
      <div className="mobile-empty-state">
        <Smartphone className="mobile-empty-state-icon" />
        <h3 className="mobile-empty-state-title">Device not found</h3>
        <p className="mobile-empty-state-description">
          The device you're looking for doesn't exist or you don't have access to it.
        </p>
      </div>
    );
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'data', label: 'Data', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/devices')}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{device.name}</h1>
          <p className="text-sm text-gray-500">{device.imei}</p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(device.status)}
          <span className={`mobile-status-indicator ${getStatusClass(device.status)}`}>
            {device.status}
          </span>
        </div>
      </div>

      {/* Device Info Card */}
      <div className="mobile-card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Device Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Status</span>
            <span className={`mobile-status-indicator ${getStatusClass(device.status)}`}>
              {device.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">IMEI</span>
            <span className="text-sm font-medium text-gray-900">{device.imei}</span>
          </div>
          {device.lastSeen && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Seen</span>
              <span className="text-sm text-gray-900">
                {formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })}
              </span>
            </div>
          )}
          {device.groupId && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Group</span>
              <span className="text-sm text-gray-900">{device.groupId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="mobile-card">
                <div className="flex items-center space-x-2">
                  <Battery className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-600">Battery</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {deviceRecords[0]?.battery || 'N/A'}%
                </p>
              </div>
              <div className="mobile-card">
                <div className="flex items-center space-x-2">
                  <Signal className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-600">Signal</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {deviceRecords[0]?.signal || 'N/A'}
                </p>
              </div>
            </div>

            {/* Location Info */}
            {deviceRecords[0]?.latitude && deviceRecords[0]?.longitude && (
              <div className="mobile-card">
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="w-5 h-5 text-primary-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Latitude</span>
                    <span className="text-sm font-medium text-gray-900">
                      {deviceRecords[0].latitude.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Longitude</span>
                    <span className="text-sm font-medium text-gray-900">
                      {deviceRecords[0].longitude.toFixed(6)}
                    </span>
                  </div>
                  {deviceRecords[0].speed && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Speed</span>
                      <span className="text-sm font-medium text-gray-900">
                        {deviceRecords[0].speed} km/h
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Records */}
            <div className="mobile-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Records</h3>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              {deviceRecords.length > 0 ? (
                <div className="space-y-3">
                  {deviceRecords.slice(0, 5).map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Record #{record.recordNumber || record.id}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(record.datetime || record.timestamp), 'MMM dd, yyyy HH:mm')}
                        </p>
                        {record.latitude && record.longitude && (
                          <p className="text-xs text-gray-400">
                            {record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-900">{record.speed ? `${record.speed} km/h` : 'N/A'}</p>
                        {record.batteryVoltage && (
                          <p className="text-xs text-gray-500">{record.batteryVoltage}V</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent records</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'data' && (
          <div className="mobile-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Records</h3>
            {deviceRecords.length > 0 ? (
              <div className="space-y-4">
                {deviceRecords.map((record, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        Record #{record.recordNumber || index + 1}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {format(new Date(record.datetime || record.timestamp), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {record.latitude && record.longitude && (
                        <>
                          <div>
                            <span className="text-gray-600">Latitude:</span>
                            <span className="ml-1 text-gray-900">{record.latitude.toFixed(6)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Longitude:</span>
                            <span className="ml-1 text-gray-900">{record.longitude.toFixed(6)}</span>
                          </div>
                        </>
                      )}
                      {record.speed && (
                        <div>
                          <span className="text-gray-600">Speed:</span>
                          <span className="ml-1 text-gray-900">{record.speed} km/h</span>
                        </div>
                      )}
                      {record.direction && (
                        <div>
                          <span className="text-gray-600">Direction:</span>
                          <span className="ml-1 text-gray-900">{record.direction}°</span>
                        </div>
                      )}
                      {record.batteryVoltage && (
                        <div>
                          <span className="text-gray-600">Battery:</span>
                          <span className="ml-1 text-gray-900">{record.batteryVoltage}V</span>
                        </div>
                      )}
                      {record.supplyVoltage && (
                        <div>
                          <span className="text-gray-600">Supply:</span>
                          <span className="ml-1 text-gray-900">{record.supplyVoltage}V</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Download className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No records available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="mobile-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Settings</h3>
            <div className="space-y-4">
              <button className="mobile-button-secondary">
                Edit Device
              </button>
              <button className="mobile-button-secondary">
                Configure Alerts
              </button>
              <button className="mobile-button-secondary">
                Export Data
              </button>
              <button className="bg-danger-100 text-danger-700 mobile-button-secondary">
                Delete Device
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceDetail; 