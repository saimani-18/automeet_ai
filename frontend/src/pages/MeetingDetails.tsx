import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CalendarIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentArrowDownIcon,
  SparklesIcon,
  CheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { useStore } from '../store/useStore';
import LoadingSpinner from '../components/UI/LoadingSpinner';

export default function MeetingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { meetings, updateMeeting } = useStore();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const meeting = meetings.find(m => m.id === id);

  if (!meeting) {
    return (
      <div className="pt-16 min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Meeting not found</h2>
          <button
            onClick={() => navigate('/meetings')}
            className="bg-primary-gradient text-white px-6 py-3 rounded-lg font-medium"
          >
            Back to Meetings
          </button>
        </div>
      </div>
    );
  }

  const handleRegenerateSummary = async () => {
    setIsRegenerating(true);
    // Simulate API call
    setTimeout(() => {
      updateMeeting(meeting.id, {
        summary: "Updated AI-generated summary with enhanced insights and key decision points from the latest analysis."
      });
      setIsRegenerating(false);
    }, 3000);
  };

  const toggleActionItem = (actionItemId: string) => {
    if (meeting.actionItems) {
      const updatedActionItems = meeting.actionItems.map(item => 
        item.id === actionItemId ? { ...item, completed: !item.completed } : item
      );
      updateMeeting(meeting.id, { actionItems: updatedActionItems });
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/meetings')}
          className="flex items-center space-x-2 text-muted hover:text-text mb-6 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Meetings</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8 mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4">{meeting.title}</h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span>{new Date(meeting.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-5 h-5" />
                  <span>{new Date(meeting.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <UserGroupIcon className="w-5 h-5" />
                  <span>{meeting.participants.length} participants</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="glass border border-white/20 text-text px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-all flex items-center space-x-2"
              >
                <DocumentArrowDownIcon className="w-4 h-4" />
                <span>Export</span>
              </button>
              
              <button
                onClick={handleRegenerateSummary}
                disabled={isRegenerating}
                className="bg-primary-gradient text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2 neon-glow"
              >
                {isRegenerating ? (
                  <LoadingSpinner size="sm" color="text-white" />
                ) : (
                  <SparklesIcon className="w-4 h-4" />
                )}
                <span>Regenerate Summary</span>
              </button>
            </div>
          </div>

          {/* Participants */}
          <div>
            <h3 className="font-semibold mb-3">Participants</h3>
            <div className="flex space-x-4">
              {meeting.participants.map((participant, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <img
                    src={participant.avatar}
                    alt={participant.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className="text-sm font-medium">{participant.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">AI Summary</h2>
                <div className="flex items-center space-x-2 text-sm text-neon">
                  <SparklesIcon className="w-4 h-4" />
                  <span>AI Generated</span>
                </div>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <p className="text-muted leading-relaxed">{meeting.summary}</p>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-neon/5 border border-neon/20 rounded-xl p-4">
                    <h4 className="font-semibold text-neon mb-2">Key Decisions</h4>
                    <ul className="text-sm text-muted space-y-1">
                      <li>• Approved Q2 product roadmap</li>
                      <li>• Allocated resources for mobile development</li>
                      <li>• Set authentication as top priority</li>
                    </ul>
                  </div>
                  
                  <div className="bg-warm/5 border border-warm/20 rounded-xl p-4">
                    <h4 className="font-semibold text-warm mb-2">Next Steps</h4>
                    <ul className="text-sm text-muted space-y-1">
                      <li>• Begin wireframe development</li>
                      <li>• Research mobile frameworks</li>
                      <li>• Schedule follow-up in 2 weeks</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Transcript */}
            {meeting.transcript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6"
              >
                <h2 className="text-xl font-semibold mb-4">Full Transcript</h2>
                <details className="group">
                  <summary className="cursor-pointer text-neon hover:text-neon/80 font-medium">
                    Show full transcript →
                  </summary>
                  <div className="mt-4 p-4 bg-bg-2 rounded-xl border border-white/10 max-h-96 overflow-y-auto">
                    <div className="space-y-4 text-sm">
                      <div>
                        <span className="font-semibold text-primary-to">Sarah Chen:</span>
                        <p className="text-muted mt-1">Let's start with the Q2 roadmap. I've been reviewing our current priorities and I think we need to focus on user authentication first.</p>
                        <span className="text-xs text-muted/70">10:00:15</span>
                      </div>
                      
                      <div>
                        <span className="font-semibold text-accent">Alex Kumar:</span>
                        <p className="text-muted mt-1">I agree with Sarah. The authentication system is critical for our mobile app launch. I've been researching React Native and Flutter frameworks.</p>
                        <span className="text-xs text-muted/70">10:02:30</span>
                      </div>
                      
                      <div>
                        <span className="font-semibold text-neon">Maya Rodriguez:</span>
                        <p className="text-muted mt-1">From a design perspective, we need to ensure the authentication flow is seamless across all platforms. I can start working on the wireframes this week.</p>
                        <span className="text-xs text-muted/70">10:04:45</span>
                      </div>
                    </div>
                  </div>
                </details>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Items */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-4">Action Items</h3>
              
              {meeting.actionItems && meeting.actionItems.length > 0 ? (
                <div className="space-y-3">
                  {meeting.actionItems.map((item) => (
                    <motion.div
                      key={item.id}
                      className={`border border-white/10 rounded-xl p-4 transition-all ${
                        item.completed ? 'bg-green-500/5 border-green-500/20' : 'hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => toggleActionItem(item.id)}
                          className={`mt-1 w-5 h-5 rounded border-2 transition-all ${
                            item.completed
                              ? 'bg-green-500 border-green-500'
                              : 'border-white/30 hover:border-neon/50'
                          }`}
                        >
                          {item.completed && <CheckIcon className="w-3 h-3 text-white m-0.5" />}
                        </button>
                        
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${
                            item.completed ? 'line-through text-muted' : ''
                          }`}>
                            {item.task}
                          </p>
                          <div className="flex items-center justify-between mt-2 text-xs text-muted">
                            <span>Assigned to: {item.assignee}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted">
                  <CheckIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No action items assigned</p>
                </div>
              )}
            </motion.div>

            {/* Meeting Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-4">Meeting Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted">Duration</span>
                  <span className="font-medium">1h 30m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Words spoken</span>
                  <span className="font-medium">2,847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Decisions made</span>
                  <span className="font-medium text-neon">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Action items</span>
                  <span className="font-medium text-warm">
                    {meeting.actionItems?.length || 0}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Related Meetings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-4">Related Meetings</h3>
              <div className="space-y-3">
                <div className="border border-white/10 rounded-xl p-3">
                  <h4 className="font-medium text-sm mb-1">Weekly Team Sync</h4>
                  <p className="text-xs text-muted">Jan 20, 2024</p>
                </div>
                <div className="border border-white/10 rounded-xl p-3">
                  <h4 className="font-medium text-sm mb-1">Product Planning Q1</h4>
                  <p className="text-xs text-muted">Jan 8, 2024</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-strong rounded-2xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-semibold mb-4">Export Meeting</h3>
              <div className="space-y-4 mb-6">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span>Summary</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span>Action Items</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Full Transcript</span>
                </label>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="flex-1 glass border border-white/20 py-2 rounded-lg font-medium hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button className="flex-1 bg-primary-gradient py-2 rounded-lg font-medium text-white hover:shadow-lg transition-all neon-glow">
                  Export PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}