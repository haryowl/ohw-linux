import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Wifi, WifiOff, AlertTriangle } from 'lucide-react';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom device marker icons
const createDeviceIcon = (status) => {
  const iconColor = status === 'online' ? '#22c55e' : 
                   status === 'warning' ? '#f59e0b' : '#6b7280';
  
  return L.divIcon({
    className: 'custom-device-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${iconColor};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// Map center updater component
function MapCenterUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center[0] !== 0 && center[1] !== 0) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  
  return null;
}

const MobileMap = ({ 
  devices = [], 
  mapType = 'osm',
  height = '300px',
  onDeviceClick,
  center = [0, 0],
  zoom = 2,
  historyData = {},
  showTrails = false
}) => {
  // Use props directly instead of internal state
  const mapCenter = center;
  const mapZoom = zoom;

  // Only set default center if no center is provided and we have devices with locations
  const defaultCenter = useMemo(() => {
    if (center[0] !== 0 || center[1] !== 0) {
      return center;
    }
    
    const devicesWithLocation = devices.filter(device => 
      device.latitude && device.longitude
    );
    
    if (devicesWithLocation.length > 0) {
      const firstDevice = devicesWithLocation[0];
      return [firstDevice.latitude, firstDevice.longitude];
    }
    
    return center;
  }, [center, devices]);

  // Map tile configurations
  const getMapConfig = (type) => {
    switch (type) {
      case 'satellite':
        return {
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          attribution: '&copy; <a href="https://www.esri.com/">Esri</a>'
        };
      case 'street':
        return {
          url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        };
      case 'terrain':
        return {
          url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          attribution: '&copy; <a href="https://opentopomap.org/">OpenTopoMap</a> contributors'
        };
      default: // osm
        return {
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        };
    }
  };

  const mapConfig = getMapConfig(mapType);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return <Wifi className="w-3 h-3 text-green-600" />;
      case 'offline':
        return <WifiOff className="w-3 h-3 text-gray-400" />;
      case 'warning':
        return <AlertTriangle className="w-3 h-3 text-yellow-600" />;
      default:
        return <WifiOff className="w-3 h-3 text-gray-400" />;
    }
  };

  const handleMarkerClick = useCallback((device) => {
    if (onDeviceClick) {
      onDeviceClick(device);
    }
  }, [onDeviceClick]);

  // Generate device trails for history mode
  const deviceTrails = useMemo(() => {
    if (!showTrails || Object.keys(historyData).length === 0) {
      return [];
    }

    return Object.entries(historyData).map(([imei, records]) => {
      if (records.length < 2) return null;

      const positions = records
        .filter(record => record.latitude && record.longitude)
        .map(record => [record.latitude, record.longitude]);

      if (positions.length < 2) return null;

      return {
        imei,
        positions,
        color: '#3b82f6', // Blue trail
        weight: 2,
        opacity: 0.7
      };
    }).filter(Boolean);
  }, [historyData, showTrails]);

  return (
    <div className="relative" style={{ height }}>
      <MapContainer
        center={defaultCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        attributionControl={false}
        className="mobile-map-container"
      >
        <MapCenterUpdater center={mapCenter} zoom={mapZoom} />
        
        <TileLayer
          url={mapConfig.url}
          attribution={mapConfig.attribution}
        />

        {/* Device Trails */}
        {deviceTrails.map((trail) => (
          <Polyline
            key={trail.imei}
            positions={trail.positions}
            color={trail.color}
            weight={trail.weight}
            opacity={trail.opacity}
          />
        ))}

        {devices
          .filter(device => device.latitude && device.longitude)
          .map((device) => (
            <Marker
              key={device.id || device.imei}
              position={[device.latitude, device.longitude]}
              icon={createDeviceIcon(device.status)}
              eventHandlers={{
                click: () => handleMarkerClick(device)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(device.status)}
                    <h3 className="font-semibold text-sm">{device.name || device.imei}</h3>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600">
                    <p><strong>IMEI:</strong> {device.imei}</p>
                    <p><strong>Status:</strong> {device.status}</p>
                    {device.speed && (
                      <p><strong>Speed:</strong> {device.speed} km/h</p>
                    )}
                    {device.direction && (
                      <p><strong>Direction:</strong> {device.direction}°</p>
                    )}
                    {device.lastSeen && (
                      <p><strong>Last Seen:</strong> {new Date(device.lastSeen).toLocaleString()}</p>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-gray-200">
                    <button 
                      className="w-full px-3 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 transition-colors"
                      onClick={() => handleMarkerClick(device)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

export default MobileMap; 