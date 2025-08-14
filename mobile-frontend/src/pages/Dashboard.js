import React from 'react';
import { 
  Activity, 
  Smartphone, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  Wifi,
  WifiOff,
  AlertCircle
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const { devices, alerts, stats, loading } = useData();

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  // Ensure we have arrays to work with
  const devicesArray = Array.isArray(devices) ? devices : [];
  const alertsArray = Array.isArray(alerts) ? alerts : [];
  
  const onlineDevices = devicesArray.filter(device => device.status === 'online') || [];
  const offlineDevices = devicesArray.filter(device => device.status === 'offline') || [];
  const recentAlerts = alertsArray.slice(0, 5) || [];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <Wifi className="w-4 h-4 text-success-600" />;
      case 'offline':
        return <WifiOff className="w-4 h-4 text-gray-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
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

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mobile-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome back!</h2>
        <p className="text-gray-600">Here's what's happening with your devices today.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="mobile-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900">{devicesArray.length || 0}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <Smartphone className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="mobile-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Online</p>
              <p className="text-2xl font-bold text-success-600">{onlineDevices.length}</p>
            </div>
            <div className="p-3 bg-success-100 rounded-lg">
              <Wifi className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="mobile-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Offline</p>
              <p className="text-2xl font-bold text-gray-600">{offlineDevices.length}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <WifiOff className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="mobile-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-warning-600">{recentAlerts.length}</p>
            </div>
            <div className="p-3 bg-warning-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mobile-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        
        {stats?.recentActivity?.length > 0 ? (
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No recent activity</p>
          </div>
        )}
      </div>

      {/* Device Status */}
      <div className="mobile-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Device Status</h3>
          <Smartphone className="w-5 h-5 text-gray-400" />
        </div>
        
        {devicesArray.length > 0 ? (
          <div className="space-y-3">
            {devicesArray.slice(0, 5).map((device) => (
              <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(device.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{device.name}</p>
                    <p className="text-xs text-gray-500">{device.imei}</p>
                  </div>
                </div>
                <span className={`mobile-status-indicator ${getStatusClass(device.status)}`}>
                  {device.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No devices found</p>
          </div>
        )}
      </div>

      {/* Recent Alerts */}
      <div className="mobile-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
          <AlertTriangle className="w-5 h-5 text-gray-400" />
        </div>
        
        {recentAlerts.length > 0 ? (
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center space-x-3 p-3 bg-warning-50 rounded-lg">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-warning-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No recent alerts</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 