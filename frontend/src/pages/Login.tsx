import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, SparklesIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { authService } from '../services/api';
import { useStore } from '../store/useStore';
import LoadingSpinner from '../components/UI/LoadingSpinner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeField, setActiveField] = useState('');
  const [floatingShapes, setFloatingShapes] = useState([]);
  
  const { login } = useStore();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Generate floating shapes
  useEffect(() => {
    const shapes = [];
    for (let i = 0; i < 15; i++) {
      shapes.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 40 + 10,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
        type: Math.random() > 0.5 ? 'circle' : 'square'
      });
    }
    setFloatingShapes(shapes);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login(email, password);
      login(response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    const guestUser = {
      id: 'guest',
      name: 'Guest User',
      email: 'guest@lovable.ai',
      theme: 'primary'
    };
    login(guestUser);
    navigate('/dashboard');
  };

  const handleSocialLogin = (provider) => {
    // Social login logic would go here
    console.log(`Logging in with ${provider}`);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 relative overflow-hidden" ref={containerRef}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Shapes */}
        {floatingShapes.map(shape => (
          <motion.div
            key={shape.id}
            className={`absolute ${
              shape.type === 'circle' ? 'rounded-full' : 'rounded-lg'
            } bg-gradient-to-r from-primary-from/10 to-primary-to/10 border border-white/5`}
            style={{
              width: shape.size,
              height: shape.size,
              left: `${shape.x}%`,
              top: `${shape.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              rotate: shape.type === 'square' ? [0, 90, 180, 270, 360] : 0,
            }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              delay: shape.delay,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        
        {/* Pulsing Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      {/* Main Login Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{ duration: 1, type: "spring", stiffness: 100 }}
        className="w-full max-w-4xl glass-strong rounded-3xl shadow-2xl p-8 relative z-10 border border-white/10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Visual Animation */}
          <div className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="relative h-96"
            >
              {/* Animated Login Concept */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Floating Card Animation */}
                <motion.div
                  className="absolute w-48 h-56 bg-gradient-to-br from-primary-from to-primary-to rounded-2xl shadow-2xl"
                  animate={{
                    y: [0, -20, 0],
                    rotateZ: [-5, 5, -5],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="absolute inset-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                    <div className="p-4 space-y-3">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-2 bg-white/30 rounded"></div>
                        <div className="h-2 bg-white/30 rounded w-3/4"></div>
                        <div className="h-8 bg-white/20 rounded mt-4"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Email Icon Animation */}
                <motion.div
                  className="absolute top-8 left-8"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 1
                  }}
                >
                  <EnvelopeIcon className="w-12 h-12 text-neon" />
                </motion.div>

                {/* Lock Icon Animation */}
                <motion.div
                  className="absolute bottom-8 right-8"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: 2
                  }}
                >
                  <LockClosedIcon className="w-12 h-12 text-accent" />
                </motion.div>

                {/* Floating Particles */}
                {[1, 2, 3, 4, 5].map(i => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-neon rounded-full"
                    style={{
                      left: `${20 + i * 15}%`,
                      top: `${30 + i * 10}%`,
                    }}
                    animate={{
                      y: [0, -40, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center mt-8"
            >
              <h3 className="text-xl font-bold text-white mb-2">
                Welcome Back!
              </h3>
              <p className="text-muted">
                Enter your credentials to access your intelligent meeting space
              </p>
            </motion.div>
          </div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6, delay: 0.9 }}
                className="w-16 h-16 bg-primary-gradient rounded-2xl mx-auto lg:mx-0 mb-4 flex items-center justify-center neon-glow"
              >
                <SparklesIcon className="w-8 h-8 text-white" />
              </motion.div>
              
              <motion.h1 
                className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-neon bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                Welcome to{' '}
                <span className="bg-primary-gradient bg-clip-text text-transparent">
                  Automeet
                </span>
              </motion.h1>
              <motion.p 
                className="text-muted text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                Intelligent meetings, seamless collaboration
              </motion.p>
            </div>

            {/* Social Login Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="grid grid-cols-2 gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSocialLogin('google')}
                className="glass border border-white/20 rounded-xl py-3 px-4 text-sm font-medium hover:bg-white/5 transition-all duration-200 flex items-center justify-center space-x-2 group"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                <span>Google</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSocialLogin('microsoft')}
                className="glass border border-white/20 rounded-xl py-3 px-4 text-sm font-medium hover:bg-white/5 transition-all duration-200 flex items-center justify-center space-x-2 group"
              >
                <img src="https://www.microsoft.com/favicon.ico" alt="Microsoft" className="w-5 h-5" />
                <span>Microsoft</span>
              </motion.button>
            </motion.div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-bg-2 text-muted">Or continue with email</span>
              </div>
            </div>

            {/* Login Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email Field */}
              <motion.div
                whileFocus={{ scale: 1.02 }}
                className="relative"
              >
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setActiveField('email')}
                    onBlur={() => setActiveField('')}
                    className="w-full glass border border-white/20 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon/50 transition-all bg-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                {activeField === 'email' && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-neon rounded-full"
                  />
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div
                whileFocus={{ scale: 1.02 }}
                className="relative"
              >
                <label className="block text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setActiveField('password')}
                    onBlur={() => setActiveField('')}
                    className="w-full glass border border-white/20 rounded-xl pl-12 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon/50 transition-all bg-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-text transition-colors"
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
                {activeField === 'password' && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-neon rounded-full"
                  />
                )}
              </motion.div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-gradient rounded-xl py-4 px-4 text-white font-medium hover:shadow-2xl hover:shadow-primary-from/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed neon-glow group relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? (
                    <LoadingSpinner size="sm" color="text-white" />
                  ) : (
                    'Sign In'
                  )}
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />
              </motion.button>
            </motion.form>

            {/* Additional Options */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="text-center space-y-4"
            >
              
              <p className="text-sm text-muted">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-neon hover:text-neon/80 font-medium transition-colors group"
                >
                  Sign up
                  <span className="block h-0.5 bg-neon scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}