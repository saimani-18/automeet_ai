import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  CalendarIcon,
  UserGroupIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useStore } from '../store/useStore';

const filters = [
  { id: 'all', label: 'All Meetings' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
  { id: 'in-progress', label: 'In Progress' }
];

const sortOptions = [
  { id: 'date-desc', label: 'Newest First' },
  { id: 'date-asc', label: 'Oldest First' },
  { id: 'title', label: 'Title A-Z' }
];

// Skeleton loader component
function MeetingSkeleton() {
  return (
    <div className="glass rounded-2xl p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-6 bg-white/10 rounded mb-3 w-3/4"></div>
          <div className="h-4 bg-white/5 rounded mb-4 w-full"></div>
          <div className="flex items-center space-x-4 mb-4">
            <div className="h-4 bg-white/5 rounded w-20"></div>
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 bg-white/10 rounded-full"></div>
              ))}
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="h-6 bg-white/5 rounded-full w-16"></div>
            <div className="h-6 bg-white/5 rounded-full w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Meetings() {
  const { meetings } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const filteredMeetings = meetings
    .filter(meeting => {
      if (activeFilter !== 'all' && meeting.status !== activeFilter) return false;
      if (searchQuery) {
        return meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               meeting.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

  const handleMenuClick = (meetingId: string) => {
    setOpenMenuId(openMenuId === meetingId ? null : meetingId);
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
          <h1 className="text-3xl font-bold mb-2">Meetings</h1>
          <p className="text-muted">Manage your meetings and view AI-generated summaries</p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative lg:w-80">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass border border-white/20 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neon/50 transition-all"
                placeholder="Search meetings, participants..."
              />
            </div>

            <div className="flex items-center space-x-4">
              {/* Filters */}
              <div className="flex space-x-1">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeFilter === filter.id
                        ? 'bg-neon/20 text-neon'
                        : 'text-muted hover:text-text hover:bg-white/5'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="glass border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neon/50 bg-bg-2"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id} className="bg-bg-2">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Meetings Grid */}
        <div className="grid gap-6">
          <AnimatePresence>
            {isLoading ? (
              // Show skeletons while loading
              Array.from({ length: 4 }).map((_, index) => (
                <motion.div
                  key={`skeleton-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MeetingSkeleton />
                </motion.div>
              ))
            ) : (
              filteredMeetings.map((meeting, index) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="glass rounded-2xl p-6 hover:bg-white/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Title and Status */}
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold group-hover:text-neon transition-colors">
                          {meeting.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          meeting.status === 'completed' 
                            ? 'bg-green-500/20 text-green-400'
                            : meeting.status === 'upcoming'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {meeting.status}
                        </span>
                      </div>

                      {/* Summary */}
                      <p className="text-muted mb-4 line-clamp-2">{meeting.summary}</p>

                      {/* Meeting Info */}
                      <div className="flex items-center space-x-6 mb-4 text-sm text-muted">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{new Date(meeting.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="w-4 h-4" />
                          <span>{new Date(meeting.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <UserGroupIcon className="w-4 h-4" />
                          <span>{meeting.participants.length} participants</span>
                        </div>
                      </div>

                      {/* Participants */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex -space-x-2">
                            {meeting.participants.slice(0, 4).map((participant, idx) => (
                              <img
                                key={idx}
                                src={participant.avatar}
                                alt={participant.name}
                                className="w-10 h-10 rounded-full border-2 border-bg"
                                title={participant.name}
                              />
                            ))}
                            {meeting.participants.length > 4 && (
                              <div className="w-10 h-10 rounded-full bg-primary-gradient border-2 border-bg flex items-center justify-center text-sm text-white font-medium">
                                +{meeting.participants.length - 4}
                              </div>
                            )}
                          </div>

                          {/* Tags */}
                          <div className="flex space-x-2">
                            {meeting.actionItems && meeting.actionItems.length > 0 && (
                              <span className="px-2 py-1 bg-warm/20 text-warm text-xs rounded-full">
                                {meeting.actionItems.length} tasks
                              </span>
                            )}
                            {meeting.transcript && (
                              <span className="px-2 py-1 bg-neon/20 text-neon text-xs rounded-full">
                                Transcript
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/meetings/${meeting.id}`}
                            className="bg-primary-gradient text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all neon-glow"
                          >
                            Open
                          </Link>

                          {/* Menu */}
                          <div className="relative">
                            <button
                              onClick={() => handleMenuClick(meeting.id)}
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <EllipsisVerticalIcon className="w-5 h-5" />
                            </button>

                            <AnimatePresence>
                              {openMenuId === meeting.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="absolute right-0 mt-2 w-48 glass-strong rounded-lg shadow-lg z-10"
                                >
                                  <div className="py-2">
                                    <button className="flex items-center w-full px-4 py-2 text-sm hover:bg-white/5 transition-colors">
                                      <DocumentArrowDownIcon className="w-4 h-4 mr-3" />
                                      Export Summary
                                    </button>
                                    <button className="flex items-center w-full px-4 py-2 text-sm hover:bg-white/5 transition-colors">
                                      <CalendarIcon className="w-4 h-4 mr-3" />
                                      Add to Calendar
                                    </button>
                                    <button className="flex items-center w-full px-4 py-2 text-sm hover:bg-white/5 transition-colors">
                                      <CheckIcon className="w-4 h-4 mr-3" />
                                      Mark as Done
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {!isLoading && filteredMeetings.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary-gradient/20 flex items-center justify-center">
                <CalendarIcon className="w-12 h-12 text-primary-from" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No meetings found</h3>
              <p className="text-muted mb-6">Try adjusting your search or filter criteria</p>
              <button className="bg-primary-gradient text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all neon-glow">
                Schedule New Meeting
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}