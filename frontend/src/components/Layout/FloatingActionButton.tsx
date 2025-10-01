import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  VideoCameraIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const actions = [
  { icon: VideoCameraIcon, label: 'New Meeting', color: 'bg-primary-gradient' },
  { icon: DocumentTextIcon, label: 'Create Note', color: 'bg-warm-gradient' },
  { icon: ChatBubbleLeftIcon, label: 'Ask AI', color: 'bg-neon-gradient' },
  { icon: CalendarDaysIcon, label: 'Schedule', color: 'bg-accent' },
];

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ scale: 0, x: 20 }}
                animate={{ scale: 1, x: 0 }}
                exit={{ scale: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-center w-12 h-12 ${action.color} rounded-full shadow-lg hover:shadow-xl transition-all neon-glow`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <action.icon className="w-5 h-5 text-white" />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-primary-gradient rounded-full shadow-lg flex items-center justify-center neon-glow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        <PlusIcon className="w-6 h-6 text-white" />
      </motion.button>
    </div>
  );
}