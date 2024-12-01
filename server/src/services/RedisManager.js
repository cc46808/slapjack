import { createClient } from 'redis';
import { promisify } from 'util';
import { CONFIG } from '../config/index.js';

export class RedisManager {
  constructor() {
    this.client = createClient({
      url: CONFIG.redis.url
    });

    this.client.on('error', (err) => console.error('Redis Error:', err));
    
    // Promisify Redis commands
    this.get = promisify(this.client.get).bind(this.client);
    this.set = promisify(this.client.set).bind(this.client);
    this.del = promisify(this.client.del).bind(this.client);
    this.incr = promisify(this.client.incr).bind(this.client);
    this.expire = promisify(this.client.expire).bind(this.client);
  }

  async saveGameState(gameId, state) {
    const key = `${CONFIG.redis.prefix}game:${gameId}`;
    await this.set(key, JSON.stringify(state));
    await this.expire(key, 3600); // 1 hour TTL
  }

  async getGameState(gameId) {
    const key = `${CONFIG.redis.prefix}game:${gameId}`;
    const state = await this.get(key);
    return state ? JSON.parse(state) : null;
  }

  async removeGameState(gameId) {
    const key = `${CONFIG.redis.prefix}game:${gameId}`;
    await this.del(key);
  }

  async setPlayerSession(playerId, sessionData, expirySeconds = 3600) {
    const key = `${CONFIG.redis.prefix}player:${playerId}`;
    await this.set(key, JSON.stringify(sessionData));
    await this.expire(key, expirySeconds);
  }

  async getPlayerSession(playerId) {
    const key = `${CONFIG.redis.prefix}player:${playerId}`;
    const session = await this.get(key);
    return session ? JSON.parse(session) : null;
  }
}