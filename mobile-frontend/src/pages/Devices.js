import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  ChevronRight,
  Filter,
  Plus
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const Devices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const { devices, loading } = useData();

  if (loading) {
    return <LoadingSpinner text="Loading devices..." />;
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

  // Ensure we have an array to work with
  const devicesArray = Array.isArray(devices) ? devices : [];
  
  const filteredDevices = devicesArray.filter(device => {
    const matchesSearch = device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.imei?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const statusOptions = [
    { value: 'all', label: 'All', count: devicesArray.length || 0 },
    { value: 'online', label: 'Online', count: devicesArray.filter(d => d.status === 'online').length || 0 },
    { value: 'offline', label: 'Offline', count: devicesArray.filter(d => d.status === 'offline').length || 0 },
    { value: 'warning', label: 'Warning', count: devicesArray.filter(d => d.status === 'warning').length || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Devices</h1>
          <p className="text-gray-600">{devicesArray.length || 0} devices total</p>
        </div>
        <button className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mobile-input pl-10"
          />
        </div>

        {/* Status Filter */}
        <div className="flex space-x-2 overflow-x-auto no-scrollbar">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                statusFilter === option.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{option.label}</span>
              <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                {option.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Devices List */}
      <div className="space-y-3">
        {filteredDevices.length > 0 ? (
          filteredDevices.map((device) => (
            <div
              key={device.id}
              onClick={() => navigate(`/devices/${device.id}`)}
              className="mobile-card cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getStatusIcon(device.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{device.name}</h3>
                    <p className="text-xs text-gray-500">{device.imei}</p>
                    {device.lastSeen && (
                      <p className="text-xs text-gray-400">
                        Last seen {formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`mobile-status-indicator ${getStatusClass(device.status)}`}>
                    {device.status}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="mobile-empty-state">
            <Smartphone className="mobile-empty-state-icon" />
            <h3 className="mobile-empty-state-title">No devices found</h3>
            <p className="mobile-empty-state-description">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No devices have been added yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {devicesArray.length > 0 && (
        <div className="mobile-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600">
                {devicesArray.filter(d => d.status === 'online').length}
              </p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">
                {devicesArray.filter(d => d.status === 'offline').length}
              </p>
              <p className="text-xs text-gray-500">Offline</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning-600">
                {devicesArray.filter(d => d.status === 'warning').length}
              </p>
              <p className="text-xs text-gray-500">Warning</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Devices; 