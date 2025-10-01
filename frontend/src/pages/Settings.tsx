import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  KeyIcon,
  EyeIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline';
import { useStore } from '../store/useStore';

const themes = [
  { id: 'primary', name: 'Violet Ocean', gradient: 'from-primary-from to-primary-to', preview: '#7C3AED' },
  { id: 'neon', name: 'Neon Dreams', gradient: 'from-neon to-primary-to', preview: '#00F5A0' },
  { id: 'warm', name: 'Sunset Glow', gradient: 'from-warm to-accent', preview: '#F59E0B' }
];

const timezones = [
  { id: 'asia/kolkata', label: 'Asia/Kolkata (UTC+5:30)' },
  { id: 'america/new_york', label: 'America/New_York (UTC-5)' },
  { id: 'europe/london', label: 'Europe/London (UTC+0)' },
  { id: 'asia/tokyo', label: 'Asia/Tokyo (UTC+9)' },
  { id: 'australia/sydney', label: 'Australia/Sydney (UTC+11)' }
];

const fontSizes = [
  { id: 'small', label: 'Small', value: 14 },
  { id: 'medium', label: 'Medium', value: 16 },
  { id: 'large', label: 'Large', value: 18 },
  { id: 'extra-large', label: 'Extra Large', value: 20 }
];

export default function Settings() {
  const { user, setUser } = useStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'appearance', label: 'Appearance', icon: PaintBrushIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'integrations', label: 'Integrations', icon: GlobeAltIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'accessibility', label: 'Accessibility', icon: EyeIcon }
  ];

  const handleConnect = async (service: string) => {
    setIsConnecting(service);
    // Simulate OAuth connection
    setTimeout(() => {
      setIsConnecting(null);
    }, 2000);
  };

  const TabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={user?.avatar || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150'}
                  alt={user?.name}
                  className="w-24 h-24 rounded-full"
                />
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-gradient rounded-full flex items-center justify-center text-white hover:shadow-lg transition-all">
                  <UserIcon className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">{user?.name}</h3>
                <p className="text-muted">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue={user?.name}
                  className="w-full glass border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  className="w-full glass border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon/50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <select className="w-full glass border border-white/20 rounded-xl px-4 py-3 bg-bg-2 focus:outline-none focus:ring-2 focus:ring-neon/50">
                  {timezones.map((tz) => (
                    <option key={tz.id} value={tz.id} className="bg-bg-2">
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Product Manager"
                  className="w-full glass border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon/50"
                />
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Theme</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {themes.map((theme) => (
                  <motion.button
                    key={theme.id}
                    onClick={() => setUser({ ...user!, theme: theme.id as any })}
                    className={`glass border rounded-2xl p-6 text-left transition-all ${
                      user?.theme === theme.id 
                        ? 'border-neon/50 bg-white/5' 
                        : 'border-white/20 hover:border-white/30'
                    }`}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className={`w-full h-24 rounded-xl bg-gradient-to-r ${theme.gradient} mb-4`}></div>
                    <h4 className="font-semibold">{theme.name}</h4>
                    <div className="flex items-center space-x-2 mt-2">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: theme.preview }}
                      ></div>
                      <span className="text-sm text-muted">Primary color</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Display</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Font Size</label>
                  <select className="w-full glass border border-white/20 rounded-xl px-4 py-3 bg-bg-2">
                    {fontSizes.map((size) => (
                      <option key={size.id} value={size.id} className="bg-bg-2">
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Compact Mode</span>
                    <p className="text-sm text-muted">Reduce spacing between elements</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Email Notifications</h3>
              
              <div className="space-y-4">
                {[
                  { label: 'Meeting reminders', description: 'Get notified before meetings start' },
                  { label: 'Action item updates', description: 'When tasks are assigned or completed' },
                  { label: 'Weekly summaries', description: 'Weekly digest of your meetings and insights' },
                  { label: 'New features', description: 'Product updates and new feature announcements' }
                ].map((notification, index) => (
                  <div key={index} className="flex items-center justify-between glass rounded-xl p-4">
                    <div>
                      <span className="font-medium">{notification.label}</span>
                      <p className="text-sm text-muted">{notification.description}</p>
                    </div>
                    <input type="checkbox" defaultChecked={index < 3} className="w-4 h-4" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Push Notifications</h3>
              
              <div className="space-y-4">
                {[
                  { label: 'Browser notifications', description: 'Show notifications in your browser' },
                  { label: 'Sound alerts', description: 'Play sound for important notifications' },
                  { label: 'Do not disturb', description: 'Pause notifications during focus time' }
                ].map((notification, index) => (
                  <div key={index} className="flex items-center justify-between glass rounded-xl p-4">
                    <div>
                      <span className="font-medium">{notification.label}</span>
                      <p className="text-sm text-muted">{notification.description}</p>
                    </div>
                    <input type="checkbox" defaultChecked={index === 0} className="w-4 h-4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <div className="grid gap-4">
              {[
                { 
                  name: 'Google Calendar', 
                  description: 'Sync meetings and events',
                  icon: 'https://www.google.com/favicon.ico',
                  connected: true 
                },
                { 
                  name: 'Microsoft Outlook', 
                  description: 'Import calendar and Teams meetings',
                  icon: 'https://www.microsoft.com/favicon.ico',
                  connected: false 
                },
                { 
                  name: 'Slack', 
                  description: 'Share meeting summaries and insights',
                  icon: 'https://slack.com/favicon.ico',
                  connected: false 
                },
                { 
                  name: 'Notion', 
                  description: 'Export notes and action items',
                  icon: 'https://notion.so/favicon.ico',
                  connected: true 
                }
              ].map((integration, index) => (
                <div key={index} className="glass rounded-xl p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img src={integration.icon} alt={integration.name} className="w-10 h-10" />
                    <div>
                      <h4 className="font-semibold">{integration.name}</h4>
                      <p className="text-sm text-muted">{integration.description}</p>
                    </div>
                  </div>
                  
                  {integration.connected ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-neon">Connected</span>
                      <button className="text-sm text-muted hover:text-text">Disconnect</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConnect(integration.name)}
                      disabled={isConnecting === integration.name}
                      className="bg-primary-gradient text-white px-4 py-2 rounded-lg text-sm hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {isConnecting === integration.name ? 'Connecting...' : 'Connect'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full glass border border-white/20 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-neon/50"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-text"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full glass border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Confirm Password</label>
                  <input
                    type="password"
                    className="w-full glass border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-neon/50"
                  />
                </div>
                
                <button className="bg-primary-gradient text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all">
                  Update Password
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
              <div className="glass rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Authenticator App</span>
                    <p className="text-sm text-muted">Use an app like Google Authenticator</p>
                  </div>
                  <button
                    onClick={() => setShow2FAModal(true)}
                    className="bg-neon-gradient text-white px-4 py-2 rounded-lg text-sm hover:shadow-lg transition-all"
                  >
                    Enable
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
              <div className="space-y-3">
                {[
                  { device: 'MacBook Pro', location: 'New York, US', current: true },
                  { device: 'iPhone 15', location: 'New York, US', current: false },
                  { device: 'Chrome Browser', location: 'San Francisco, US', current: false }
                ].map((session, index) => (
                  <div key={index} className="glass rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <DevicePhoneMobileIcon className="w-5 h-5 text-muted" />
                      <div>
                        <span className="font-medium">{session.device}</span>
                        {session.current && <span className="text-neon text-sm ml-2">(Current)</span>}
                        <p className="text-sm text-muted">{session.location}</p>
                      </div>
                    </div>
                    {!session.current && (
                      <button className="text-sm text-accent hover:text-accent/80">
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {[
                { 
                  label: 'High contrast mode', 
                  description: 'Increase contrast for better visibility',
                  checked: false 
                },
                { 
                  label: 'Reduce motion', 
                  description: 'Minimize animations and transitions',
                  checked: false 
                },
                { 
                  label: 'Screen reader support', 
                  description: 'Enhanced compatibility with screen readers',
                  checked: true 
                },
                { 
                  label: 'Focus indicators', 
                  description: 'Show enhanced focus outlines for keyboard navigation',
                  checked: true 
                },
                { 
                  label: 'Auto-captions', 
                  description: 'Automatically generate captions for video content',
                  checked: false 
                }
              ].map((setting, index) => (
                <div key={index} className="flex items-center justify-between glass rounded-xl p-4">
                  <div>
                    <span className="font-medium">{setting.label}</span>
                    <p className="text-sm text-muted">{setting.description}</p>
                  </div>
                  <input type="checkbox" defaultChecked={setting.checked} className="w-4 h-4" />
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
              <div className="glass rounded-xl p-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Global search</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded">G</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Quick login</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded">Cmd+Enter</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Send message</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded">Enter</kbd>
                </div>
                <div className="flex justify-between">
                  <span>New line in chat</span>
                  <kbd className="px-2 py-1 bg-white/10 rounded">Shift+Enter</kbd>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted">Manage your account preferences and integrations</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary-gradient/20 text-neon border border-neon/30'
                        : 'text-muted hover:text-text hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-8"
            >
              <TabContent />
              
              {/* Save Button */}
              <div className="flex justify-end mt-8 pt-6 border-t border-white/10">
                <button className="bg-primary-gradient text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all neon-glow">
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 2FA Modal */}
        {show2FAModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-strong rounded-2xl p-8 max-w-md w-full"
            >
              <h3 className="text-2xl font-bold mb-6">Enable Two-Factor Authentication</h3>
              
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-48 h-48 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <div className="text-black text-xs">QR Code Placeholder</div>
                  </div>
                  <p className="text-sm text-muted">Scan this QR code with your authenticator app</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Verification Code</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    className="w-full glass border border-white/20 rounded-xl px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-neon/50"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-8">
                <button
                  onClick={() => setShow2FAModal(false)}
                  className="flex-1 glass border border-white/20 py-3 rounded-lg font-medium hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button className="flex-1 bg-neon-gradient py-3 rounded-lg font-medium text-white hover:shadow-lg transition-all">
                  Enable 2FA
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}