export const calculateCardPosition = (index, total, radius = 300) => {
    const angle = (index / total) * Math.PI - Math.PI / 2;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      rotation: (angle * 180) / Math.PI
    };
  };
  
  export const validateGameState = (gameState) => {
    if (!gameState) return false;
    
    const totalCards = gameState.players.reduce(
      (sum, player) => sum + player.hand.length, 0
    ) + gameState.centerPile.length;
  
    return totalCards === 52;
  };
  
  export const isValidSlap = (centerPile) => {
    if (!centerPile.length) return false;
    return centerPile[centerPile.length - 1].rank === 'J';
  };
  
  // slapjack/client/src/context/GameContext.js
  import React, { createContext, useContext, useReducer } from 'react';
  
  const GameContext = createContext(null);
  
  const initialState = {
    connection: {
      status: 'disconnected',
      error: null
    },
    game: {
      id: null,
      state: 'setup',
      players: [],
      centerPile: [],
      currentPlayer: null
    },
    player: {
      id: null,
      name: null,
      hand: []
    }
  };
  
  function gameReducer(state, action) {
    switch (action.type) {
      case 'CONNECTION_STATUS_CHANGED':
        return { ...state, connection: { ...state.connection, ...action.payload }};
      case 'GAME_STATE_UPDATED':
        return { ...state, game: { ...state.game, ...action.payload }};
      case 'PLAYER_UPDATED':
        return { ...state, player: { ...state.player, ...action.payload }};
      default:
        return state;
    }
  }
  
  export function GameProvider({ children }) {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    return (
      <GameContext.Provider value={{ state, dispatch }}>
        {children}
      </GameContext.Provider>
    );
  }
  
  export const useGame = () => useContext(GameContext);
  