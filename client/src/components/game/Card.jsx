// slapjack/client/src/components/game/Card.jsx
import React from 'react';
import { motion } from 'framer-motion';

export const Card = React.memo(({ card, onClick, className = '', large = false }) => {
  const suitSymbols = {
    hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠'
  };

  const suitColors = {
    hearts: 'text-red-500',
    diamonds: 'text-red-500',
    clubs: 'text-black',
    spades: 'text-black'
  };

  const sizeClasses = large ? 'w-48 h-64' : 'w-24 h-36';

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative ${sizeClasses} bg-white rounded-lg shadow-md ${className}`}
      onClick={onClick}
    >
      <div className={`absolute top-2 left-2 text-6xl ${suitColors[card.suit]}`}>
        {card.rank}
      </div>
      <div className={`absolute inset-0 flex items-center justify-center text-8xl ${suitColors[card.suit]}`}>
        {suitSymbols[card.suit]}
      </div>
      <div className={`absolute bottom-2 right-2 transform rotate-180 text-6xl ${suitColors[card.suit]}`}>
        {card.rank}
      </div>
    </motion.div>
  );
});