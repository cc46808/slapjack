// slapjack/client/src/services/GameStateSync.js
export class GameStateSync {
    constructor(gameId, onUpdate) {
      this.gameId = gameId;
      this.onUpdate = onUpdate;
      this.pendingUpdates = new Map();
      this.setupSync();
    }
  
    setupSync() {
      this.socket = new WebSocketClient(`${import.meta.env.VITE_WS_URL}/game/${this.gameId}`, {
        onMessage: (update) => this.handleUpdate(update)
      });
    }
  
    handleUpdate(update) {
      requestAnimationFrame(() => {
        this.onUpdate(update);
      });
    }
  
    cleanup() {
      this.socket.close();
    }
  }