// slapjack/client/src/components/ui/Toast.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Toast = ({ message, type = 'info', onClose }) => {
  const colors = {
    success: 'bg-gradient-to-br from-green-500/90 to-emerald-500/90',
    error: 'bg-gradient-to-br from-red-500/90 to-rose-500/90',
    info: 'bg-gradient-to-br from-blue-500/90 to-indigo-500/90'
  };

  return (
    <AnimatePresence>
      {message && (
        <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={`
          fixed top-4 left-1/2 -translate-x-1/2
          px-6 py-3 rounded-lg
          text-white font-medium shadow-lg shadow-black/20
          ${colors[type]}
        `}
      >
        {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};