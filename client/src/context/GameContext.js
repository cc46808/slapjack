// slapjack/client/src/context/GameContext.js
import React from 'react';
import { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { createWebSocketClient } from '../services/websocket';

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
    currentPlayer: null,
    availableGames: []
  },
  player: {
    id: null,
    name: null,
    isHost: false
  }
};

const gameReducer = (state, action) => {
  switch (action.type) {
    case 'CONNECTION_CHANGED':
      return {
        ...state,
        connection: {
          ...state.connection,
          status: action.payload
        }
      };

    case 'GAME_CREATED':
      return {
        ...state,
        game: {
          ...state.game,
          id: action.payload.gameId,
          state: 'lobby'
        },
        player: {
          ...state.player,
          id: action.payload.playerId,
          isHost: true  // Set isHost to true for game creator
        }
      };

    case 'GAME_STATE_UPDATED':
      const currentPlayer = action.payload.players?.find(p => p.id === state.player.id);
      return {
        ...state,
        game: {
          ...state.game,
          ...action.payload
        },
        player: {
          ...state.player,
          isHost: currentPlayer?.isHost ?? state.player.isHost // Preserve host status unless explicitly changed
        }
      };

    case 'PLAYER_UPDATED':
      return {
        ...state,
        player: {
          ...state.player,
          ...action.payload
        }
      };

    default:
      return state;
  }
};

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [socket, setSocket] = React.useState(null);

  const handleMessage = (message) => {
    console.log('Received message:', message);
    
    switch (message.type) {
      case 'games_list':
        dispatch({
          type: 'GAME_STATE_UPDATED',
          payload: { availableGames: message.payload.games }
        });
        break;

      case 'game_created':
        dispatch({ 
          type: 'GAME_CREATED', 
          payload: { gameId: message.payload?.gameId }
        });   
        dispatch({
          type: 'PLAYER_UPDATED',
          payload: {
            id: message.payload?.playerId
          }
        });
        break;
        
      case 'slap_result':
        if (!message.payload.success) {
          // Play error sound or show feedback for invalid slap
          console.log('Invalid slap!');
        }
        break;

      case 'game_state_updated':
        if (message.payload.lastAction?.type === 'slap') {
          const player = message.payload.lastAction.player;
          dispatch({
            type: 'SHOW_NOTIFICATION',
            payload: {
              message: message.payload.lastAction.success 
                ? `${player.name} won the slap!` 
                : `${player.name} failed the slap`,
              type: message.payload.lastAction.success ? 'success' : 'error'
            }
          });
        }
        dispatch({ 
          type: 'GAME_STATE_UPDATED', 
          payload: message.payload 
        });
        break;
  
      case 'error':
        console.error('Game error:', message.payload?.message);
        dispatch({ 
          type: 'CONNECTION_ERROR', 
          payload: message.payload?.message 
        });
        break;
    }
  };

  const connect = async (playerName) => {
    console.log('Connecting with name:', playerName);
    const ws = createWebSocketClient({
      onOpen: () => dispatch({ type: 'CONNECTION_CHANGED', payload: 'connected' }),
      onMessage: handleMessage,
      onClose: () => dispatch({ type: 'CONNECTION_CHANGED', payload: 'disconnected' })
    });
    setSocket(ws);
    dispatch({ type: 'PLAYER_UPDATED', payload: { name: playerName } });
  };

  const actions = {
    connect,
    createGame: () => {
      socket?.send({
        type: 'create_game',
        payload: {
          playerName: state.player.name
        }
      });
    },
    getGames: () => {
      socket?.send({
        type: 'get_games',
        payload: {}
      });
    },
    joinGame: (gameId) => {
      if (!gameId) {
        console.error('Game ID is required');
        return;
      }
      socket?.send({
        type: 'join_game',
        payload: {
          gameId: gameId.toUpperCase(),
          playerName: state.player.name
        }
      });
    },
    addAI: () => {
      if (!state.game.id) {
        console.error('No game ID available');
        return;
      }
      socket?.send({
        type: 'add_ai_player',
        payload: {
          gameId: state.game.id,
          playerName: `AI-${Math.floor(Math.random() * 1000)}`
        }
      });
    },
    startGame: () => {
      socket?.send({
        type: 'start_game',
        payload: {
          gameId: state.game.id
        }
      });
    },
    playCard: () => {
      socket?.send({
        type: 'play_card',
        payload: {
          gameId: state.game.id
        }
      });
    },
    slap: () => {
      socket?.send({
        type: 'slap',
        payload: {
          gameId: state.game.id
        }
      });
    }
  };

  useEffect(() => {
    return () => socket?.close();
  }, [socket]);

  return (
    <GameContext.Provider value={{ state, actions }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};