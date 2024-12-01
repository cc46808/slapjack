// slapjack/client/src/store/gameStore.js
import { create } from 'zustand';
import { createWebSocketClient } from '../services/websocket';

const initialState = {
  gameState: null,
  connection: { status: 'disconnected' },
  player: { id: null, name: null }
};

export const useGameStore = create((set, get) => ({
  ...initialState,
  
  connect: (playerName) => {
    const ws = createWebSocketClient({
      onMessage: (msg) => get().handleMessage(msg),
      onClose: () => set({ connection: { status: 'disconnected' } })
    });
    
    set({ connection: { status: 'connected' }, player: { name: playerName } });
  },
  
  handleMessage: (message) => {
    // Message handling logic...
  }
}));