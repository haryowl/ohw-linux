import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Smartphone, 
  MapPin, 
  Settings,
  Menu,
  Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MobileLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/devices', icon: Smartphone, label: 'Devices' },
    { path: '/tracking', icon: MapPin, label: 'Tracking' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="mobile-header safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">OHW Parser</h1>
              {user && (
                <p className="text-sm text-gray-500">
                  {user.firstName} {user.lastName}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto mobile-content safe-area-bottom">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="mobile-bottom-nav safe-area-bottom">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`mobile-nav-item ${active ? 'active' : ''}`}
              >
                <Icon className={`mobile-nav-icon ${active ? 'text-primary-600' : 'text-gray-500'}`} />
                <span className={active ? 'text-primary-600' : 'text-gray-500'}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileLayout; 