import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  PlusIcon,
  LinkIcon,
  CheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useStore } from '../store/useStore';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const integrations = [
  {
    id: 'google',
    name: 'Google Calendar',
    icon: 'https://www.google.com/favicon.ico',
    connected: false,
    description: 'Sync with Google Calendar events and meetings'
  },
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    icon: 'https://www.microsoft.com/favicon.ico',
    connected: true,
    description: 'Integrate with Outlook calendar and Teams meetings'
  }
];

export default function Calendar() {
  const { meetings } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(year, month + (direction === 'next' ? 1 : -1), 1));
  };

  const getMeetingsForDate = (date: Date) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      return meetingDate.toDateString() === date.toDateString();
    });
  };

  const handleConnect = async (integrationId: string) => {
    setIsConnecting(integrationId);
    setTimeout(() => {
      setIsConnecting(null);
    }, 2000);
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="pt-16 min-h-screen bg-bg">
      {/* Enhanced Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-from/5 via-transparent to-primary-to/5"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <motion.h1 
              className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-neon bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Calendar Integration
            </motion.h1>
            <motion.p 
              className="text-muted text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Connect your calendars and manage meetings
            </motion.p>
          </div>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowIntegrations(true)}
            className="bg-primary-gradient text-white px-6 py-3 rounded-xl font-medium hover:shadow-xl transition-all neon-glow flex items-center space-x-2 group relative overflow-hidden"
          >
            <LinkIcon className="w-5 h-5" />
            <span>Connect Calendar</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Calendar */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-3xl p-8 backdrop-blur-xl"
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-8">
                <motion.h2 
                  className="text-3xl font-bold bg-gradient-to-r from-white to-accent bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {months[month]} {year}
                </motion.h2>
                
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigateMonth('prev')}
                    className="p-3 rounded-xl glass border border-white/20 hover:bg-white/5 transition-all"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentDate(new Date())}
                    className="px-4 py-2 text-sm font-medium text-neon hover:bg-neon/10 rounded-xl transition-all"
                  >
                    Today
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigateMonth('next')}
                    className="p-3 rounded-xl glass border border-white/20 hover:bg-white/5 transition-all"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {daysOfWeek.map((day) => (
                  <motion.div 
                    key={day} 
                    className="text-center text-sm font-semibold text-muted py-3"
                    whileHover={{ scale: 1.05 }}
                  >
                    {day}
                  </motion.div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-3">
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={index} className="h-32"></div>;
                  }

                  const dayMeetings = getMeetingsForDate(date);
                  const isCurrentDay = isToday(date);

                  return (
                    <motion.div
                      key={date.toISOString()}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      whileHover={{ scale: 1.05 }}
                      onHoverStart={() => setHoveredDay(date)}
                      onHoverEnd={() => setHoveredDay(null)}
                      className={`h-32 p-3 rounded-xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                        isCurrentDay
                          ? 'border-neon bg-neon/10 shadow-lg shadow-neon/20'
                          : 'border-white/10 hover:border-neon/50 hover:bg-white/5'
                      }`}
                    >
                      {/* Date */}
                      <div className={`text-lg font-semibold mb-2 ${
                        isCurrentDay ? 'text-neon' : 'text-white'
                      }`}>
                        {date.getDate()}
                      </div>
                      
                      {/* Meetings */}
                      <div className="space-y-1">
                        {dayMeetings.slice(0, 2).map((meeting) => (
                          <motion.div
                            key={meeting.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-xs bg-primary-gradient/30 text-white rounded-lg px-2 py-1 truncate shadow-sm"
                            title={meeting.title}
                          >
                            {meeting.title}
                          </motion.div>
                        ))}
                        
                        {dayMeetings.length > 2 && (
                          <motion.div 
                            className="text-xs text-muted mt-1"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            +{dayMeetings.length - 2} more
                          </motion.div>
                        )}
                      </div>

                      {/* Hover effect */}
                      <AnimatePresence>
                        {hoveredDay?.toDateString() === date.toDateString() && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gradient-to-br from-neon/10 to-transparent rounded-xl"
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-8">
            {/* Today's Meetings */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-3xl p-6 backdrop-blur-xl"
            >
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <CalendarDaysIcon className="w-5 h-5 mr-2 text-neon" />
                Today's Meetings
              </h3>
              
              {getMeetingsForDate(today).length > 0 ? (
                <div className="space-y-4">
                  {getMeetingsForDate(today).map((meeting, index) => (
                    <motion.div 
                      key={meeting.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className="border border-white/10 rounded-xl p-4 hover:border-neon/30 transition-all group"
                    >
                      <h4 className="font-medium mb-2 group-hover:text-neon transition-colors">{meeting.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-muted">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>{new Date(meeting.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <UserGroupIcon className="w-4 h-4" />
                          <span>{meeting.participants.length}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  className="text-center py-8 text-muted"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <CalendarDaysIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No meetings today</p>
                </motion.div>
              )}
            </motion.div>

            {/* Connected Calendars */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-3xl p-6 backdrop-blur-xl"
            >
              <h3 className="font-semibold text-lg mb-4">Connected Calendars</h3>
              
              <div className="space-y-4">
                {integrations.map((integration, index) => (
                  <motion.div 
                    key={integration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={integration.icon}
                        alt={integration.name}
                        className="w-8 h-8"
                      />
                      <div>
                        <p className="font-medium text-sm">{integration.name}</p>
                        <p className="text-xs text-muted">
                          {integration.connected ? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    
                    {integration.connected ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-neon/20 rounded-full flex items-center justify-center"
                      >
                        <CheckIcon className="w-4 h-4 text-neon" />
                      </motion.div>
                    ) : (
                      <motion.button
                        onClick={() => handleConnect(integration.id)}
                        disabled={isConnecting === integration.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-xs bg-primary-gradient text-white px-3 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {isConnecting === integration.id ? 'Connecting...' : 'Connect'}
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Enhanced Integration Modal */}
        <AnimatePresence>
          {showIntegrations && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-strong rounded-3xl p-8 max-w-md w-full backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-neon bg-clip-text text-transparent">Connect Calendar</h3>
                  <SparklesIcon className="w-6 h-6 text-neon" />
                </div>
                
                <div className="space-y-4 mb-8">
                  {integrations.map((integration) => (
                    <motion.div 
                      key={integration.id}
                      whileHover={{ scale: 1.02 }}
                      className="border border-white/10 rounded-xl p-4 hover:border-neon/30 transition-all"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <img src={integration.icon} alt={integration.name} className="w-10 h-10" />
                        <div className="flex-1">
                          <h4 className="font-semibold">{integration.name}</h4>
                          <p className="text-sm text-muted">{integration.description}</p>
                        </div>
                        {integration.connected ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-8 h-8 bg-neon/20 rounded-full flex items-center justify-center"
                          >
                            <CheckIcon className="w-5 h-5 text-neon" />
                          </motion.div>
                        ) : (
                          <motion.button
                            onClick={() => handleConnect(integration.id)}
                            disabled={isConnecting === integration.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-primary-gradient text-white px-4 py-2 rounded-lg text-sm hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            {isConnecting === integration.id ? 'Connecting...' : 'Connect'}
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <motion.button
                  onClick={() => setShowIntegrations(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full glass border border-white/20 py-3 rounded-xl font-medium hover:bg-white/5 transition-all"
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}