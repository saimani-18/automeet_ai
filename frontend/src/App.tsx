import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout Components
import Navbar from './components/Layout/Navbar';
import FloatingActionButton from './components/Layout/FloatingActionButton';
import { ToastContainer } from './components/UI/Toast';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Meetings from './pages/Meetings';
import MeetingDetails from './pages/MeetingDetails';
import Knowledge from './pages/Knowledge';
import Calendar from './pages/Calendar';
import Chat from './pages/Chat';
import Settings from './pages/Settings';

// Store
import { useStore } from './store/useStore';

function App() {
  const { isAuthenticated } = useStore();
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'warning' | 'info'; message: string }>>([]);

  const addToast = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <Router>
      <div className="min-h-screen bg-bg text-text">
        <AnimatePresence mode="wait">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/signup" 
              element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />} 
            />

            {/* Protected Routes */}
            <Route 
              path="/*" 
              element={
                isAuthenticated ? (
                  <>
                    <Navbar />
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/meetings" element={<Meetings />} />
                      <Route path="/meetings/:id" element={<MeetingDetails />} />
                      <Route path="/knowledge" element={<Knowledge />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                    <FloatingActionButton />
                  </>
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
          </Routes>
        </AnimatePresence>

        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </Router>
  );
}

export default App;