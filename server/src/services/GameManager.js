import { GameRoom } from '../game/GameRoom.js';
import { RedisManager } from './RedisManager.js';
import { Logger } from '../utils/Logger.js';
import { CONFIG } from '../config/index.js';

export class GameManager {
  constructor(monitoringService) {
    this.games = new Map();
    this.playerGameMap = new Map();
    this.redis = new RedisManager();
    this.monitoring = monitoringService;
    this.setupCleanup();
  }

  async createGame(hostId, playerName) {
    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const game = new GameRoom(gameId, hostId);
    
    await game.addPlayer(hostId, playerName);
    game.state = 'lobby'; // Make sure game is in 'lobby' state
    this.games.set(gameId, game);
    this.playerGameMap.set(hostId, gameId);
    
    this.monitoring.incrementMetric('activeGames');
    this.monitoring.incrementMetric('connectedPlayers');
    
    Logger.info(`Created new game ${gameId} with host ${playerName}`);
    return game;
  }

  async handleDisconnect(playerId) {
    const gameId = this.playerGameMap.get(playerId);
    if (gameId) {
      const game = this.games.get(gameId);
      if (game) {
        game.removePlayer(playerId);
        this.monitoring.decrementMetric('connectedPlayers');
        
        if (game.players.size === 0) {
          game.cleanup();
          this.games.delete(gameId);
          this.monitoring.decrementMetric('activeGames');
        }
      }
      this.playerGameMap.delete(playerId);
    }
  }

  async joinGame(playerId, gameId, playerName) {
    Logger.info(`Attempting to join game ${gameId} with player ${playerName}`);
    
    const game = this.games.get(gameId?.toUpperCase());
    if (!game) {
      Logger.error(`Game ${gameId} not found`);
      throw new Error('Game not found');
    }

    if (game.state !== 'waiting' && game.state !== 'lobby') {
      throw new Error('Game already in progress');
    }

    await game.addPlayer(playerId, playerName);
    this.playerGameMap.set(playerId, gameId);
    Logger.info(`Player ${playerName} joined game ${gameId}`);
    
    return game;
  }

  async playCard(playerId) {
    const game = this.getPlayerGame(playerId);
    if (!game) {
      Logger.error(`No game found for player ${playerId}`);
      throw new Error('Game not found');
    }
  
    Logger.info(`Player ${playerId} playing card`);
    await game.playCard(playerId);
    return game;
  }

  async handleSlap(playerId) {
    const game = this.getPlayerGame(playerId);
    if (!game) throw new Error('Game not found');

    const result = await game.handleSlap(playerId);
    return {
      success: result.success,
      gameId: game.id,
      gameState: game.getState()
    };
  }

  async addAIPlayer(gameId, aiName) {
    const game = this.games.get(gameId);
    if (!game) throw new Error('Game not found');
  
    const aiId = `ai-${Date.now()}`;
    await game.addPlayer(aiId, aiName, true);
    this.playerGameMap.set(aiId, gameId);
    
    Logger.info(`Added AI player ${aiName} to game ${gameId}`);
    return game;
  }

  getGamePlayers(gameId) {
    const game = this.games.get(gameId);
    if (!game) return [];
    return Array.from(game.players.keys());
  }

  getGame(gameId) {
    return this.games.get(gameId);
  }

  getPlayerGame(playerId) {
    const gameId = this.playerGameMap.get(playerId);
    return this.games.get(gameId);
  }

  isPlayerInGame(playerId, gameId) {
    return this.playerGameMap.get(playerId) === gameId;
  }

  getGameState(gameId, playerId) {
    const game = this.games.get(gameId);
    return game ? game.getState(playerId) : null;
  }
  
  getJoinableGames() {
    const joinableGames = [];
    const maxPlayers = CONFIG?.game?.maxPlayers || 4; // Fallback to 4 if CONFIG not available
    
    for (const [id, game] of this.games) {
      if (game.state === 'lobby' || game.state === 'waiting') {
        joinableGames.push({
          id: id,
          playerCount: game.players.size,
          maxPlayers: maxPlayers,
          hostName: Array.from(game.players.values())
            .find(p => p.isHost)?.name || 'Unknown'
        });
      }
    }
    Logger.info(`Found ${joinableGames.length} joinable games`);
    return joinableGames;
  }

  handleDisconnect(playerId) {
    const gameId = this.playerGameMap.get(playerId);
    if (gameId) {
      const game = this.games.get(gameId);
      if (game) {
        game.removePlayer(playerId);
        if (game.players.size === 0) {
          game.cleanup();
          this.games.delete(gameId);
        }
      }
      this.playerGameMap.delete(playerId);
    }
  }

  setupCleanup() {
    setInterval(() => {
      this.games.forEach((game, gameId) => {
        if (Date.now() - game.lastActivity > 30 * 60 * 1000) {
          game.cleanup();
          this.games.delete(gameId);
          Logger.info(`Cleaned up inactive game: ${gameId}`);
        }
      });
    }, 5 * 60 * 1000);
  }
}