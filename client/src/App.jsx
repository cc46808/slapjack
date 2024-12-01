import React from 'react';
import { GameProvider } from './context/GameContext';
import { GameSetup } from './components/game/GameSetup';
import { GameBoard } from './components/game/GameBoard';
import { GameLobby } from './components/game/GameLobby';
import { useGame } from './context/GameContext';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

const GameContent = () => {
  const { state } = useGame();
  
  switch (state.game.state) {
    case 'setup':
      return <GameSetup />;
    case 'lobby':
      return <GameLobby />;
    case 'waiting':
      return <GameLobby />; 
    case 'playing':
      return <GameBoard />;
    case 'finished':
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-green-800">
          <h1 className="text-4xl font-bold text-white mb-4">Game Over!</h1>
          
          {state.game.players.map(player => (
            <div key={player.id} className="text-xl text-white mb-2">
              {player.name}: {player.handSize} cards
              {player.handSize === 52 && " - Winner! 🎉"}
              {player.handSize === 0 && " - Lost!"}
            </div>
          ))}
    
          {state.game.players.length === 0 && (
            <div className="text-xl text-white mb-4">
              You've been eliminated! Better luck next time!
            </div>
          )}
    
          <button 
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Play Again
          </button>
        </div>
      );
    default:
      return <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>;
  }
};

export const App = () => {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
};