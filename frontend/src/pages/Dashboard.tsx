import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarIcon, 
  ClockIcon, 
  UserGroupIcon, 
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useStore } from '../store/useStore';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const mockStats = [
  { name: 'Mon', meetings: 4, saved: 120 },
  { name: 'Tue', meetings: 6, saved: 180 },
  { name: 'Wed', meetings: 3, saved: 90 },
  { name: 'Thu', meetings: 8, saved: 240 },
  { name: 'Fri', meetings: 5, saved: 150 },
];

const quickActions = [
  { icon: CalendarIcon, label: 'Schedule Meeting', color: 'bg-primary-gradient' },
  { icon: DocumentTextIcon, label: 'Create Note', color: 'bg-warm-gradient' },
  { icon: UserGroupIcon, label: 'Invite Team', color: 'bg-neon-gradient' },
];

export default function Dashboard() {
  const { user, meetings } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut for global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
        const searchInput = document.getElementById('global-search');
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const upcomingMeetings = meetings.filter(m => m.status === 'upcoming').slice(0, 3);
  const recentMeetings = meetings.filter(m => m.status === 'completed').slice(0, 4);

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="text-muted">Here's what's happening with your meetings today.</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Today's Meetings</p>
                <p className="text-2xl font-bold text-neon">4</p>
              </div>
              <CalendarIcon className="w-8 h-8 text-neon" />
            </div>
          </div>
          
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Time Saved</p>
                <p className="text-2xl font-bold text-warm">2.5h</p>
              </div>
              <ClockIcon className="w-8 h-8 text-warm" />
            </div>
          </div>
          
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Active Projects</p>
                <p className="text-2xl font-bold text-accent">12</p>
              </div>
              <DocumentTextIcon className="w-8 h-8 text-accent" />
            </div>
          </div>
          
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted text-sm">Team Members</p>
                <p className="text-2xl font-bold text-primary-to">8</p>
              </div>
              <UserGroupIcon className="w-8 h-8 text-primary-to" />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="glass rounded-xl p-6 text-left hover:bg-white/5 transition-all group"
                  >
                    <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:shadow-lg transition-all`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-medium">{action.label}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Analytics Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Meeting Analytics</h2>
                <ArrowTrendingUpIcon className="w-5 h-5 text-neon" />
              </div>
              
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={mockStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9AA6B2' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9AA6B2' }} />
                    <Bar dataKey="meetings" fill="#7C3AED" radius={4} />
                    <Line type="monotone" dataKey="saved" stroke="#00F5A0" strokeWidth={3} dot={{ fill: '#00F5A0', r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Recent Meetings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-xl font-semibold mb-4">Recent Meetings</h2>
              <div className="space-y-4">
                {recentMeetings.map((meeting) => (
                  <motion.div
                    key={meeting.id}
                    whileHover={{ scale: 1.02 }}
                    className="glass rounded-xl p-6 cursor-pointer hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{meeting.title}</h3>
                        <p className="text-muted text-sm mb-3 line-clamp-2">{meeting.summary}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted">
                          <span>{new Date(meeting.date).toLocaleDateString()}</span>
                          <div className="flex -space-x-2">
                            {meeting.participants.slice(0, 3).map((participant, index) => (
                              <img
                                key={index}
                                src={participant.avatar}
                                alt={participant.name}
                                className="w-6 h-6 rounded-full border-2 border-bg"
                              />
                            ))}
                            {meeting.participants.length > 3 && (
                              <div className="w-6 h-6 rounded-full bg-primary-gradient border-2 border-bg flex items-center justify-center text-xs text-white">
                                +{meeting.participants.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <button className="text-neon hover:text-neon/80 text-sm font-medium">
                        View →
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Global Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-4">Quick Search</h3>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  id="global-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full glass border border-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neon/50 transition-all"
                  placeholder="Search knowledge base..."
                />
              </div>
              <p className="text-xs text-muted mt-2">Press 'g' to focus</p>
            </motion.div>

            {/* Upcoming Meetings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-4">Upcoming Meetings</h3>
              <div className="space-y-3">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="border border-white/10 rounded-xl p-4">
                    <h4 className="font-medium text-sm mb-2">{meeting.title}</h4>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>{new Date(meeting.date).toLocaleDateString()}</span>
                      <div className="flex -space-x-1">
                        {meeting.participants.slice(0, 2).map((participant, index) => (
                          <img
                            key={index}
                            src={participant.avatar}
                            alt={participant.name}
                            className="w-5 h-5 rounded-full border border-bg"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button className="w-full border-2 border-dashed border-white/20 rounded-xl py-3 text-sm text-muted hover:border-neon/50 hover:text-neon transition-all flex items-center justify-center space-x-2">
                  <PlusIcon className="w-4 h-4" />
                  <span>Schedule New</span>
                </button>
              </div>
            </motion.div>

            {/* AI Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-4">AI Insights</h3>
              <div className="space-y-4">
                <div className="border border-neon/20 rounded-xl p-4 bg-neon/5">
                  <p className="text-sm text-neon">💡 You have 3 pending action items from last week</p>
                </div>
                <div className="border border-warm/20 rounded-xl p-4 bg-warm/5">
                  <p className="text-sm text-warm">📈 Your meeting efficiency improved by 25% this month</p>
                </div>
                <div className="border border-accent/20 rounded-xl p-4 bg-accent/5">
                  <p className="text-sm text-accent">🎯 3 team members need follow-up on project tasks</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}