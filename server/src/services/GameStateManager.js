export class GameStateManager {
    constructor(gameManager, redis) {
      this.gameManager = gameManager;
      this.redis = redis;
      this.stateBuffer = new Map();
      this.setupStateSync();
    }
  
    setupStateSync() {
      setInterval(() => this.processPendingUpdates(), 50);
    }
  
    async updateGameState(gameId, update, immediate = false) {
      if (immediate) {
        await this.broadcastUpdate(gameId, update);
        return;
      }
  
      if (!this.stateBuffer.has(gameId)) {
        this.stateBuffer.set(gameId, []);
      }
      
      this.stateBuffer.get(gameId).push({
        timestamp: Date.now(),
        update
      });
    }
  
    async processPendingUpdates() {
      for (const [gameId, updates] of this.stateBuffer.entries()) {
        if (updates.length > 0) {
          const mergedUpdate = this.mergeUpdates(updates);
          await this.broadcastUpdate(gameId, mergedUpdate);
          updates.length = 0;
        }
      }
    }
  
    mergeUpdates(updates) {
      return updates.reduce((merged, { update }) => ({
        ...merged,
        ...update,
        timestamp: Date.now()
      }), {});
    }
  
    async broadcastUpdate(gameId, update) {
      await this.redis.publish(`game:${gameId}:updates`, JSON.stringify(update));
    }
  }