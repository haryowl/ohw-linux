import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Bell, 
  Shield, 
  Moon, 
  Sun, 
  LogOut, 
  Settings as SettingsIcon,
  HelpCircle,
  Info,
  Smartphone,
  Wifi,
  Database
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const settingsSections = [
    {
      title: 'Account',
      icon: User,
      items: [
        {
          label: 'Profile',
          description: 'Manage your account information',
          icon: User,
          action: () => console.log('Profile clicked'),
        },
        {
          label: 'Notifications',
          description: 'Configure alert preferences',
          icon: Bell,
          action: () => console.log('Notifications clicked'),
        },
        {
          label: 'Security',
          description: 'Password and privacy settings',
          icon: Shield,
          action: () => console.log('Security clicked'),
        },
      ],
    },
    {
      title: 'App',
      icon: SettingsIcon,
      items: [
        {
          label: 'Theme',
          description: 'Light or dark mode',
          icon: Sun,
          action: () => console.log('Theme clicked'),
        },
        {
          label: 'Data Refresh',
          description: 'Auto-refresh interval',
          icon: Wifi,
          action: () => console.log('Data refresh clicked'),
        },
        {
          label: 'Storage',
          description: 'Manage cached data',
          icon: Database,
          action: () => console.log('Storage clicked'),
        },
      ],
    },
    {
      title: 'Support',
      icon: HelpCircle,
      items: [
        {
          label: 'Help & FAQ',
          description: 'Get help and find answers',
          icon: HelpCircle,
          action: () => console.log('Help clicked'),
        },
        {
          label: 'About',
          description: 'App version and information',
          icon: Info,
          action: () => console.log('About clicked'),
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      {/* User Profile Card */}
      <div className="mobile-card">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-gray-500">{user?.username}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Sections */}
      {settingsSections.map((section) => {
        const SectionIcon = section.icon;
        
        return (
          <div key={section.title} className="mobile-card">
            <div className="flex items-center space-x-2 mb-4">
              <SectionIcon className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
            </div>
            
            <div className="space-y-1">
              {section.items.map((item) => {
                const ItemIcon = item.icon;
                
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <ItemIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Quick Actions */}
      <div className="mobile-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex flex-col items-center p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
            <Smartphone className="w-6 h-6 text-primary-600 mb-2" />
            <span className="text-sm font-medium text-primary-700">Add Device</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-success-50 rounded-lg hover:bg-success-100 transition-colors">
            <Wifi className="w-6 h-6 text-success-600 mb-2" />
            <span className="text-sm font-medium text-success-700">Test Connection</span>
          </button>
        </div>
      </div>

      {/* System Info */}
      <div className="mobile-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">App Version</span>
            <span className="text-sm font-medium text-gray-900">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Last Updated</span>
            <span className="text-sm font-medium text-gray-900">Today</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Storage Used</span>
            <span className="text-sm font-medium text-gray-900">2.4 MB</span>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="mobile-card">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 p-3 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-400">
          © 2024 Gali Parse Mobile. All rights reserved.
        </p>
      </div>
    </div>
  );
};

// Missing ChevronRight component - let's add it
const ChevronRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default Settings; 