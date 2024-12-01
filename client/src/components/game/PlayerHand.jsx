import React from 'react';
import { motion } from 'framer-motion';

export const PlayerHand = ({ player, isCurrentTurn, compact = false }) => {
  return (
    <motion.div
      className={`
        ${compact ? 'p-2' : 'p-3'} 
        rounded-xl
        relative
        overflow-hidden
        ${isCurrentTurn 
          ? 'bg-gradient-to-br from-emerald-500/60 to-teal-500/20 border-emerald-200/70 shadow-xl shadow-black/20'
          : 'bg-slate-900/30 border-slate-700/30 shadow-xs shadow-black/0'
        }
        border
        transition-all
        duration-300
        flex items-center
        w-[160px]
      `}
      animate={{ 
        scale: isCurrentTurn ? 1.05 : 1,
        y: isCurrentTurn ? -4 : 0
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex flex-col items-start gap-0.5">
        <span className={`
          font-medium
          ${isCurrentTurn ? 'text-violet-100' : 'text-white/60'}
        `}>
          {player.name}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`
            text-sm font-semibold
            ${isCurrentTurn ? 'text-white/80' : 'text-white/40'}
          `}>
            {player.handSize}
          </span>
          <span className={`
            text-xs
            ${isCurrentTurn ? 'text-white/50' : 'text-white/30'}
          `}>
            cards
          </span>
        </div>
      </div>
    </motion.div>
  );
};