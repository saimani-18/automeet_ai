import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperAirplaneIcon,
  SparklesIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  UserCircleIcon,
  MicrophoneIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import { useStore } from '../store/useStore';
import { chatService } from '../services/api';

const magicPrompts = [
  { icon: ClipboardDocumentListIcon, text: "Summarize last meeting", color: "bg-primary-gradient" },
  { icon: DocumentTextIcon, text: "Find tasks assigned to me", color: "bg-neon-gradient" },
  { icon: SparklesIcon, text: "What decisions were made this week?", color: "bg-warm-gradient" },
  { icon: UserCircleIcon, text: "Show team productivity insights", color: "bg-accent" }
];

const responseStyles = [
  { id: 'concise', label: 'Concise' },
  { id: 'professional', label: 'Professional' },
  { id: 'friendly', label: 'Friendly' }
];

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date | string;
  isStreaming?: boolean;
}

export default function Chat() {
  const { user, chatMessages, addChatMessage } = useStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [responseStyle, setResponseStyle] = useState('professional');
  const [messages, setMessages] = useState<Message[]>(chatMessages);
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const simulateStreaming = async (text: string) => {
    setStreamingMessage('');
    const words = (text || '').split(' ');
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
      setStreamingMessage(prev => prev + (i > 0 ? ' ' : '') + words[i]);
    }
    
    return text;
  };

  const handleSend = async (messageText: string = input) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      content: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    addChatMessage(messageText, 'user');
    setInput('');
    setIsTyping(true);

    try {
      const response = await chatService.sendMessage(messageText);
      const fullResponse = await simulateStreaming(response?.data?.response || "...");

      const botMessage: Message = {
        id: `${Date.now()}-${Math.random()}`,
        content: fullResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      addChatMessage(fullResponse, 'bot');
      setStreamingMessage('');
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Typing indicator animation
  const TypingIndicator = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-neon rounded-full"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="pt-16 h-screen bg-bg flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex flex-col h-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6 border-b border-white/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-neon-gradient rounded-full flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Automeet AI Assistant</h1>
                <p className="text-muted">Ask me anything about your meetings and documents</p>
              </div>
            </div>

            {/* Response Style Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted">Style:</span>
              <select
                value={responseStyle}
                onChange={(e) => setResponseStyle(e.target.value)}
                className="glass border border-white/20 rounded-lg px-3 py-1 text-sm bg-bg-2 focus:outline-none focus:ring-2 focus:ring-neon/50"
              >
                {responseStyles.map((style) => (
                  <option key={style.id} value={style.id} className="bg-bg-2">
                    {style.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {messages.length === 0 ? (
            /* Welcome Message & Magic Prompts */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  Hi {user?.name || "there"}! 👋
                </h2>
                <p className="text-muted text-lg">
                  How can I help you today? Try one of these magic prompts:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {magicPrompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSend(prompt.text)}
                    className="glass rounded-2xl p-6 text-left hover:bg-white/5 transition-all group"
                  >
                    <div className={`w-12 h-12 ${prompt.color} rounded-xl flex items-center justify-center mb-4 group-hover:shadow-lg transition-all`}>
                      <prompt.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-medium group-hover:text-neon transition-colors">
                      {prompt.text}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Chat Messages */
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-3xl ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.sender === 'user' ? 'bg-primary-gradient' : 'bg-neon-gradient'
                      }`}
                    >
                      {message.sender === 'user' ? (
                        <UserCircleIcon className="w-6 h-6 text-white" />
                      ) : (
                        <SparklesIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    {/* Message Bubble */}
                    <div className={`glass-strong rounded-2xl px-6 py-4 ${
                      message.sender === 'user' 
                        ? 'bg-primary-gradient/20 border-primary-from/30' 
                        : 'bg-neon/5 border-neon/20'
                    }`}>
                      <div className="prose prose-invert max-w-none">
                        <p className="mb-0 leading-relaxed whitespace-pre-wrap">
                          {String(message.content || "")}
                        </p>
                      </div>
                      <div className={`text-xs text-muted mt-2 ${
                        message.sender === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Streaming Message */}
              {streamingMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-3 max-w-3xl">
                    <div className="w-10 h-10 rounded-full bg-neon-gradient flex items-center justify-center flex-shrink-0">
                      <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="glass-strong rounded-2xl px-6 py-4 bg-neon/5 border-neon/20">
                      <div className="prose prose-invert max-w-none">
                        <p className="mb-0 leading-relaxed">
                          {streamingMessage}
                          <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="ml-1 text-neon"
                          >
                            ▋
                          </motion.span>
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Typing Indicator */}
              {isTyping && !streamingMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-neon-gradient flex items-center justify-center">
                      <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="glass-strong rounded-2xl px-6 py-4 bg-neon/5 border-neon/20">
                      <TypingIndicator />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6 border-t border-white/10"
        >
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Lovable anything..."
                className="w-full glass-strong border border-white/20 rounded-2xl px-6 py-4 pr-12 text-lg focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon/50 transition-all resize-none"
                disabled={isTyping}
              />
              
              {/* Attachment Button */}
              <button className="absolute right-14 top-1/2 transform -translate-y-1/2 p-2 text-muted hover:text-text transition-colors">
                <PaperClipIcon className="w-5 h-5" />
              </button>
              
              {/* Voice Button */}
              <button className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-muted hover:text-text transition-colors">
                <MicrophoneIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Send Button */}
            <motion.button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="w-14 h-14 bg-neon-gradient rounded-2xl flex items-center justify-center hover:shadow-lg hover:shadow-neon/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed neon-glow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PaperAirplaneIcon className="w-6 h-6 text-white" />
            </motion.button>
          </div>

          <p className="text-xs text-muted mt-2 text-center">
            Press Enter to send, Shift + Enter for new line
          </p>
        </motion.div>
      </div>
    </div>
  );
}
