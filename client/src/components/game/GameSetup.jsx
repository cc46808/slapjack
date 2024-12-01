// slapjack/client/src/components/game/GameSetup.jsx
import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const GameSetup = () => {
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { state, actions } = useGame();

  const handleJoinClicked = async () => {
    setIsJoining(true);
    if (state.connection.status !== 'connected') {
      await actions.connect(playerName);
    }
    actions.getGames();
  };

  useEffect(() => {
    let pollInterval;
    if (isJoining && state.connection.status === 'connected') {
      console.log('Fetching available games...');
      actions.getGames();
      pollInterval = setInterval(() => {
        console.log('Polling for available games...');
        actions.getGames();
      }, 2000);
    }
    return () => clearInterval(pollInterval);
  }, [isJoining, state.connection.status, actions]);
  
useEffect(() => {
  if (state.connection.status === 'connected' && state.player.name) {
    console.log('Connected, handling game setup...');
    if (!isJoining) {
      actions.createGame();
    }
  }
}, [state.connection.status, state.player.name, isJoining]);

const handleJoinGame = (gameId) => {
  if (gameId && playerName.trim()) {
    console.log(`Joining game ${gameId}`);
    actions.joinGame(gameId);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (playerName.trim() && !isJoining) {
      await actions.connect(playerName);
      actions.createGame();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <img src="./assets/logo.png" alt="Slapjack logo" className="mx-auto" />        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
              type="text"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={2}
              maxLength={20}
            />
          
          {/* {isJoining && (
            <input
              type="text"
              placeholder="Enter game code"
              value={gameId}
              onChange={(e) => setGameId(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              minLength={6}
              maxLength={6}
            />
          )} */}

          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1"
              onClick={() => setIsJoining(false)}
            >
              Create Game
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleJoinClicked}
              disabled={!playerName.trim()}
            >
              Join Game
            </Button>
          </div>
        </form>
        
        {isJoining && state.game.availableGames && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Available Games</h3>
            <div className="space-y-2">
              {state.game.availableGames.length > 0 ? (
                state.game.availableGames.map(game => (
                  <div 
                    key={game.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleJoinGame(game.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-mono font-bold">{game.id}</span>
                        <span className="text-gray-500 ml-2">Host: {game.hostName}</span>
                      </div>
                      <div className="text-gray-500">
                        {game.playerCount}/{game.maxPlayers} players
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">No games available</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};