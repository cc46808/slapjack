import { EventEmitter } from 'events';
import { RedisManager } from './RedisManager.js';
import { Logger } from '../utils/Logger.js';

export class FailoverService extends EventEmitter {
  constructor(gameManager) {
    super();
    this.gameManager = gameManager;
    this.redis = new RedisManager();
    this.nodeId = process.env.NODE_ID;
    this.isLeader = false;
    this.setupLeaderElection();
  }

  async setupLeaderElection() {
    const becameLeader = await this.redis.setNX('leader', this.nodeId, 30000);
    if (becameLeader) {
      this.isLeader = true;
      this.startHeartbeat();
    }

    setInterval(() => this.checkLeader(), 5000);
  }

  async startHeartbeat() {
    this.heartbeatInterval = setInterval(async () => {
      try {
        await this.redis.pExpire('leader', 30000);
      } catch (error) {
        this.isLeader = false;
        clearInterval(this.heartbeatInterval);
      }
    }, 10000);
  }

  async checkLeader() {
    if (!this.isLeader) {
      const leader = await this.redis.get('leader');
      if (!leader) {
        const becameLeader = await this.redis.setNX('leader', this.nodeId, 30000);
        if (becameLeader) {
          this.isLeader = true;
          this.startHeartbeat();
          await this.handleFailover();
        }
      }
    }
  }

  async handleFailover() {
    try {
      await this.recoverGameStates();
      this.emit('failover-complete');
    } catch (error) {
      Logger.error('Failover failed:', error);
      this.emit('failover-failed', error);
    }
  }

  async recoverGameStates() {
    const gameStates = await this.redis.getGameStates();
    for (const [gameId, state] of gameStates) {
      await this.gameManager.recoverGame(gameId, state);
    }
  }
}