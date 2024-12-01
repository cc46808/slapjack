// slapjack/server/src/game/GameRoom.js
import { AsyncLock } from '../utils/AsyncLock.js';
import { Deck } from './Deck.js';
import { Player } from './Player.js';
import { CONFIG } from '../config/index.js';

export class GameRoom {
  constructor(id, hostId) {
    this.id = id;
    this.hostId = hostId;
    this.players = new Map();
    this.deck = new Deck();
    this.centerPile = [];
    this.currentPlayer = null;
    this.state = 'waiting';
    this.lock = new AsyncLock();
    this.aiInterval = null;
    this.lastActivity = Date.now();
    this.startTime = null;
  }

  broadcast(event, data) {
    try {
        if (!this.io) {
            console.error('Socket.io instance not available');
            return;
        }
        // Broadcast to all clients in this room
        this.io.to(this.id).emit(event, data);
    } catch (error) {
        console.error('Broadcast error:', error);
    }
  }

  broadcastGameState() {
      try {
          const state = this.getState();
          this.broadcast('gameState', state);
      } catch (error) {
          console.error('Failed to broadcast game state:', error);
      }
  }

  async addPlayer(id, name, isAI = false) {
    return await this.lock.acquire('gameState', () => {
      if (this.players.size >= CONFIG.game.maxPlayers) {
        throw new Error('Game room is full');
      }

      const player = new Player(id, name, isAI);
      if (id === this.hostId) player.isHost = true;
      this.players.set(id, player);
      return player;
    });
  }

  async removePlayer(playerId) {
    return await this.lock.acquire('gameState', () => {
      if (!this.players.has(playerId)) {
        return;
      }

      // If the player was host, assign new host
      if (playerId === this.hostId) {
        const remainingPlayers = Array.from(this.players.keys());
        const newHost = remainingPlayers.find(id => id !== playerId);
        if (newHost) {
          this.hostId = newHost;
          this.players.get(newHost).isHost = true;
        }
      }

      // If it was player's turn, move to next player
      if (this.currentPlayer === playerId) {
        const playerIds = Array.from(this.players.keys());
        const currentIndex = playerIds.indexOf(playerId);
        this.currentPlayer = playerIds[(currentIndex + 1) % playerIds.length];
      }

      // Remove the player
      this.players.delete(playerId);
      this.lastActivity = Date.now();

      // If game is now invalid, reset state
      if (this.players.size < CONFIG.game.minPlayers && this.state === 'playing') {
        this.state = 'waiting';
      }

      return this.getState();
    });
  }
  
  async start() {
    return await this.lock.acquire('gameState', () => {
      if (this.players.size < CONFIG.game.minPlayers) {
        throw new Error('Not enough players');
      }
  
      const hands = this.deck.deal(this.players.size);
      const playerIds = Array.from(this.players.keys());
      
      playerIds.forEach((id, index) => {
        this.players.get(id).hand = hands[index];
      });
  
      this.startTime = Date.now();
      this.state = 'playing';
      this.currentPlayer = playerIds[0]; // Set first player
      this.startAIPlayers();
  
      return this.getState();
    });
  }

  async playCard(playerId) {
    return await this.lock.acquire('gameState', () => {
      const player = this.players.get(playerId);
      if (!player || player.hand.length === 0) {
          console.log('Invalid play attempt:', {playerId, hasPlayer: !!player, cardCount: player?.hand.length});
          return this.getState();
      }
      if (this.state !== 'playing') {
        throw new Error('Game not in playing state');
      }
      
      if (playerId !== this.currentPlayer) {
        throw new Error('Not your turn');
      }
  
      if (!player) {
        throw new Error('Player not found');
      }
  
      // If player has no cards, they're eliminated
      if (player.hand.length === 0) {
        // Remove player from active players
        this.players.delete(playerId);
        
        // If only one player remains, they win
        if (this.players.size === 1) {
          const winner = Array.from(this.players.values())[0];
          winner.addCards(this.centerPile);
          this.centerPile = [];
          this.state = 'finished';
          return this.getState();
        }
  
        // Move to next player if game isn't finished
        if (this.state === 'playing') {
          const remainingPlayers = Array.from(this.players.keys());
          this.currentPlayer = remainingPlayers[0];
        }
  
        this.lastActivity = Date.now();
        return this.getState();
      }
  
      const card = player.playCard();
      card.isFaceUp = true; // Explicitly set face up
      this.centerPile.push(card);

      console.log('Card played:', {
        playerId,
        card: card.toString(),
        isFaceUp: card.isFaceUp
      });
      
      // Update current player
      const playerIds = Array.from(this.players.keys());
      const currentIndex = playerIds.indexOf(playerId);
      this.currentPlayer = playerIds[(currentIndex + 1) % playerIds.length];
      
      this.broadcastGameState();
      // Start AI player's turn if next player is AI
      const nextPlayer = this.players.get(this.currentPlayer);
      if (nextPlayer?.isAI) {
        this.startAIPlayers();
      }
      //this.broadcastGameState();
      this.lastActivity = Date.now();
      return this.getState();
    });
  }

  async handleSlap(playerId) {
    return await this.lock.acquire('gameState', () => {
      if (this.state !== 'playing') {
        return { success: false, gameState: this.getState() };
      }

      const player = this.players.get(playerId);
      if (!player || !player.canSlap()) {
        return { success: false, gameState: this.getState() };
      }
      // Check slap cooldown
      if (!player.canSlap()) {
        return { success: false, gameState: this.getState() };
      }

      player.lastSlap = Date.now();

      if (this.isValidSlap()) {
        // Valid slap - player gets the cards
        player.addCards(this.centerPile);
        this.centerPile = [];

        if (this.checkWinCondition(player)) {
          this.state = 'finished';
        }
        
        return {
          success: true,
          gameState: {
            ...this.getState(),
            lastAction: {
              type: 'slap',
              success: true,
              player: player.toJSON()
            }
          }
        };      
      } else {
        // Invalid slap - player must give up a card ONLY if they have cards
        // AND there's at least one card in the center pile
        if (player.hand.length > 0 && this.centerPile.length > 0) {
          this.centerPile.push(player.playCard());
        }
        return {
          success: false,
          gameState: {
            ...this.getState(),
            lastAction: {
              type: 'slap',
              success: false,
              player: player.toJSON()
            }
          }
        };
      }
    });
  }

  isValidSlap() {
    if (this.centerPile.length === 0) return false;
    return this.centerPile[this.centerPile.length - 1].rank === 'J';
  }

  checkWinCondition(player) {
    const hasWon = player.hand.length === 52;
    if (hasWon && this.startTime) {
      const duration = (Date.now() - this.startTime) / 1000; // Convert to seconds
      this.gameManager?.monitoring.recordGameDuration(duration);
    }
    return hasWon;
  }

  startAIPlayers() {
    if (!this.isActive) return;
    
    const currentPlayer = this.players.get(this.currentPlayer);
    if (currentPlayer?.isAI) {
      // Use setTimeout to ensure state updates happen sequentially
      setTimeout(async () => {
        // Important: Use the same playCard method as human players
        await this.playCard(this.currentPlayer);
      }, 1000); // 1 second delay for visual effect
    }
  }

  cleanup() {
    if (this.aiInterval) {
      clearInterval(this.aiInterval);
    }
  }

  getState(playerId = null) {
    return {
      id: this.id,
      state: this.state,
      currentPlayer: this.currentPlayer,
      centerPile: this.centerPile,
      players: Array.from(this.players.values()).map(player => ({
        ...player.toJSON(),
        hand: playerId === player.id ? player.hand : []
      }))
    };
  }
}