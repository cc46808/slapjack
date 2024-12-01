// slapjack/client/src/components/game/GameLobby.jsx
import React from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const GameLobby = () => {
  const { state, actions } = useGame();
  const gameState = state.game;
  const isHost = state.player.isHost;

  if (!gameState || !gameState.id) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Game Lobby</h2>
        
        <div className="mb-6">
          <div className="text-sm text-gray-500">Game Code:</div>
          <div className="text-3xl font-mono font-bold">{gameState.id}</div>
        </div>

        <div className="space-y-4">
          {gameState.players?.map(player => (
            <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>{player.name}</span>
              {player.isHost && <span className="text-yellow-500">(Host)</span>}
            </div>
          ))}
        </div>

        {/* Host controls */}
        {isHost ? (
          <div className="mt-6 space-y-4">
            <Button 
              onClick={actions.addAI} 
              disabled={gameState.players?.length >= 4}
              className="w-full"
            >
              Add AI Player
            </Button>
            <Button 
              onClick={actions.startGame}
              disabled={gameState.players?.length < 2}
              className="w-full"
            >
              Start Game
            </Button>
          </div>
        ) : (
          <div className="mt-6 text-center text-gray-500">
            Waiting for host to start the game...
          </div>
        )}
      </div>
    </div>
  );
};