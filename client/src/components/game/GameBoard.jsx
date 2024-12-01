// slapjack/client/src/components/game/GameBoard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';
import { Card } from './Card';
import { PlayerHand } from './PlayerHand';
import { useSoundEffects } from '../../hooks/useSoundEffects';
import { useKeyPress } from '../../hooks/useKeyPress';
import { Toast } from '../ui/Toast';

export const GameBoard = () => {
  const [lastAction, setLastAction] = useState(null);
  const [canSlap, setCanSlap] = useState(true);
  const [notification, setNotification] = useState(null);
  const { state, actions } = useGame();
  const playerId = state.player.id;
  const gameState = state.game;
  const { playCardSound, playSlapSound } = useSoundEffects();

  const handleSlap = useCallback(async () => {
    if (!canSlap) return;
    setCanSlap(false);
    playSlapSound();
    await actions.slap();
    setTimeout(() => setCanSlap(true), 500);
  }, [canSlap, playSlapSound, actions]);

  // Add effect to show AI plays
  useEffect(() => {
    if (gameState.currentPlayer?.includes('ai-')) {
      setLastAction(`${gameState.players.find(p => p.id === gameState.currentPlayer)?.name} played a card`);
      // Clear message after 2 seconds
      setTimeout(() => setLastAction(null), 2000);
    }
  }, [gameState.centerPile]);

  useEffect(() => {
    if (state.notification) {
      setNotification(state.notification);
      setTimeout(() => setNotification(null), 2000);
    }
  }, [state.notification]);

  const handlePlayCard = useCallback(async () => {
    if (gameState.currentPlayer === playerId) {
      playCardSound();
      await actions.playCard();
    }
  }, [gameState.currentPlayer, playerId, actions, playCardSound]);

  useKeyPress(' ', handleSlap);

  const otherPlayers = gameState.players.filter(p => p.id !== playerId);
  const currentPlayer = gameState.players.find(p => p.id === playerId);

  return (
    <div className="h-screen flex flex-col bg-green-800 p-4">
      {lastAction && (
        <div className="fixed top-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded">
          {lastAction}
        </div>
      )}
      {notification && (
        <Toast 
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      {/* Other players */}
      <div className="flex-1 grid grid-cols-3 gap-4 max-h-16">
        {otherPlayers.map(player => (
          <PlayerHand
            key={player.id}
            player={player}
            isCurrentTurn={gameState.currentPlayer === player.id}
            compact={true} 
          />
        ))}
      </div>

      {/* Center pile */}
      <div className="flex-1 relative flex items-center justify-center">
        <AnimatePresence  mode="popLayout">
          {gameState.centerPile.map((card, index) => (
            <motion.div
              key={`${card.id}`}
              initial={{ scale: 0, y: -100, opacity: 0  }}
              animate={{ 
                scale: 1, 
                y: 0,
                opacity: 1,
                rotate: Math.random() * 20 - 10
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              exit={{ scale: 0, y: 100, opacity: 1 }}
              className="absolute cursor-pointer"
              style={{ zIndex: index }}
              onClick={handleSlap}
            >
              <Card card={card} large={true} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Player's controls and hand */}
      <div className="p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4 w-full max-w-md">
            <button
              onClick={handlePlayCard}
              disabled={gameState.currentPlayer !== playerId}
              className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
                gameState.currentPlayer === playerId
                  ? 'bg-gradient-to-br from-blue-500/60 to-purple-500/20 border-blue-200/70 text-white shadow-lg shadow-black/20 hover:scale-105 active:scale-95'
                  : 'bg-slate-900/30 border-slate-700/30 text-white/30 cursor-not-allowed'
              }`}
            >
              Play Card
            </button>
          </div>

          {currentPlayer && (
            <PlayerHand
              player={currentPlayer}
              isCurrentTurn={gameState.currentPlayer === playerId}
              isCurrentPlayer
            />
          )}
        </div>
      </div>
    </div>
  );
};