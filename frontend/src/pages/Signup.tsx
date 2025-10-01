import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SparklesIcon, 
  ArrowRightIcon, 
  ArrowLeftIcon,
  CheckIcon,
  UserIcon,
  BuildingOfficeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { authService } from '../services/api';
import { useStore } from '../store/useStore';
import LoadingSpinner from '../components/UI/LoadingSpinner';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    role: '',
    team: ''
  });
  const [activeField, setActiveField] = useState('');
  const [floatingElements, setFloatingElements] = useState([]);

  const { login } = useStore();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Generate floating elements
  useEffect(() => {
    const elements = [];
    const shapes = ['circle', 'square', 'triangle', 'diamond'];
    
    for (let i = 0; i < 15; i++) {
      elements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 25 + 8,
        duration: Math.random() * 15 + 10,
        delay: Math.random() * 3,
        type: shapes[Math.floor(Math.random() * shapes.length)],
        color: Math.random() > 0.5 ? 'primary' : 'neon'
      });
    }
    setFloatingElements(elements);
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await authService.signup(formData);
      login(response.data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIcon = (stepNumber) => {
    switch (stepNumber) {
      case 1: return <UserIcon className="w-4 h-4" />;
      case 2: return <BuildingOfficeIcon className="w-4 h-4" />;
      case 3: return <UserGroupIcon className="w-4 h-4" />;
      default: return <SparklesIcon className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 relative overflow-hidden" ref={containerRef}>
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Elements */}
        {floatingElements.map(element => (
          <motion.div
            key={element.id}
            className={`absolute ${
              element.type === 'circle' ? 'rounded-full' :
              element.type === 'square' ? 'rounded-lg' :
              element.type === 'triangle' ? 'triangle-shape' : 'diamond-shape'
            } ${
              element.color === 'primary' 
                ? 'bg-gradient-to-r from-primary-from/10 to-primary-to/10' 
                : 'bg-gradient-to-r from-neon/10 to-accent/10'
            } border border-white/5`}
            style={{
              width: element.size,
              height: element.size,
              left: `${element.x}%`,
              top: `${element.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              rotate: element.type !== 'circle' ? [0, 180, 360] : 0,
            }}
            transition={{
              duration: element.duration,
              repeat: Infinity,
              delay: element.delay,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,black,transparent)]" />
        
        {/* Pulsing Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      {/* Compact Main Signup Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="w-full max-w-lg glass-strong rounded-2xl shadow-2xl p-6 relative z-10 border border-white/10 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.7, delay: 0.2 }}
            className="w-16 h-16 bg-primary-gradient rounded-xl mx-auto mb-3 flex items-center justify-center neon-glow"
          >
            <SparklesIcon className="w-8 h-8 text-white" />
          </motion.div>
          
          <motion.h1 
            className="text-3xl font-bold mb-2 bg-gradient-to-r from-white via-neon to-accent bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Join{' '}
            <span className="bg-primary-gradient bg-clip-text text-transparent">
              Automeet
            </span>
          </motion.h1>

          {/* Step Indicator - Compact */}
          <motion.div 
            className="flex justify-center space-x-4 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className={`flex flex-col items-center transition-all duration-300 ${
                  i <= step ? 'text-neon' : 'text-muted'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  i <= step 
                    ? 'bg-neon/20 border-neon' 
                    : 'bg-white/5 border-white/20'
                }`}>
                  {i <= step ? (
                    <CheckIcon className="w-3 h-3 text-neon" />
                  ) : (
                    getStepIcon(i)
                  )}
                </div>
                <span className="text-xs font-medium mt-1">
                  {i === 1 && 'Personal'}
                  {i === 2 && 'Work'}
                  {i === 3 && 'Team'}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Form Content */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {/* Step 1: Personal Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      onFocus={() => setActiveField('name')}
                      onBlur={() => setActiveField('')}
                      className="w-full glass border border-white/20 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-neon/50 transition-all bg-transparent"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <div className="relative">
                    <SparklesIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onFocus={() => setActiveField('email')}
                      onBlur={() => setActiveField('')}
                      className="w-full glass border border-white/20 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-neon/50 transition-all bg-transparent"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    onFocus={() => setActiveField('password')}
                    onBlur={() => setActiveField('')}
                    className="w-full glass border border-white/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-neon/50 transition-all bg-transparent"
                    placeholder="Create a strong password"
                    required
                  />
                </motion.div>
              </motion.div>
            )}

            {/* Step 2: Company Info */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <div className="relative">
                    <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      onFocus={() => setActiveField('company')}
                      onBlur={() => setActiveField('')}
                      className="w-full glass border border-white/20 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-neon/50 transition-all bg-transparent"
                      placeholder="Your company name"
                    />
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    onFocus={() => setActiveField('role')}
                    onBlur={() => setActiveField('')}
                    className="w-full glass border border-white/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-neon/50 transition-all bg-bg-2"
                  >
                    <option value="">Select your role</option>
                    <option value="founder">Founder</option>
                    <option value="manager">Manager</option>
                    <option value="developer">Developer</option>
                    <option value="designer">Designer</option>
                    <option value="other">Other</option>
                  </select>
                </motion.div>
              </motion.div>
            )}

            {/* Step 3: Team Info */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="space-y-4"
              >
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <label className="block text-sm font-medium mb-2">Team Size</label>
                  <div className="relative">
                    <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                    <select
                      value={formData.team}
                      onChange={(e) => handleInputChange('team', e.target.value)}
                      onFocus={() => setActiveField('team')}
                      onBlur={() => setActiveField('')}
                      className="w-full glass border border-white/20 rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-neon/50 transition-all bg-bg-2"
                    >
                      <option value="">Select team size</option>
                      <option value="1-5">1-5 people</option>
                      <option value="6-20">6-20 people</option>
                      <option value="21-50">21-50 people</option>
                      <option value="50+">50+ people</option>
                    </select>
                  </div>
                </motion.div>

                {/* Success Preview */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="glass border border-neon/20 rounded-lg p-3 mt-4"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-gradient rounded-lg flex items-center justify-center">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">Ready to go!</h4>
                      <p className="text-xs text-muted">Complete your registration</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <motion.div 
          className="flex justify-between items-center mt-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <motion.button
            onClick={handleBack}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              step > 1 
                ? 'glass border border-white/20 text-white hover:bg-white/5' 
                : 'invisible'
            }`}
            whileHover={{ scale: step > 1 ? 1.03 : 1 }}
            whileTap={{ scale: 0.97 }}
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </motion.button>

          {step < 3 ? (
            <motion.button
              onClick={handleNext}
              className="flex items-center space-x-2 bg-primary-gradient rounded-lg px-6 py-3 text-white font-medium hover:shadow-lg transition-all neon-glow group relative overflow-hidden"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="text-sm">Continue</span>
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>
          ) : (
            <motion.button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-neon-gradient rounded-lg px-6 py-3 text-white font-medium hover:shadow-lg transition-all disabled:opacity-50 neon-glow group relative overflow-hidden"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="relative z-10 flex items-center space-x-2 text-sm">
                {isLoading ? (
                  <LoadingSpinner size="sm" color="text-white" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <SparklesIcon className="w-4 h-4" />
                  </>
                )}
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-4 text-center"
        >
          <p className="text-xs text-muted">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-neon hover:text-neon/80 font-medium transition-colors group"
            >
              Sign in
              <span className="block h-0.5 bg-neon scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}