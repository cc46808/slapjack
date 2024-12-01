import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/Logger.js';
import { CONFIG } from '../config/index.js'; 

export class WebSocketManager {
  constructor(server, gameManager) {
    this.wss = new WebSocketServer({ server });
    this.gameManager = gameManager;
    this.clients = new Map();
    this.setupWebSocket();
  }

  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      const clientId = uuidv4();
      ws.id = clientId;
      this.clients.set(clientId, ws);

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data);
          await this.handleMessage(ws, message);
        } catch (error) {
          Logger.error('Message handling error:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(clientId);
      });

      ws.on('error', (error) => {
        Logger.error('WebSocket error:', error);
        this.handleDisconnect(clientId);
      });
    });
  }

  async handleMessage(ws, message) {
    if (!message.type || !message.payload) {
      Logger.error('Invalid message format:', message);
      return this.sendError(ws, 'Invalid message format');
    }
    
    try {
      const { type, payload } = message;
      const { playerName } = payload;

      switch (type.toLowerCase()) {
        case 'join_game':
          Logger.info(`Join game request received for game ${payload.gameId}`);
          const joinedGame = await this.gameManager.joinGame(
            ws.id,
            payload.gameId,
            payload.playerName
          );
          
          const player = joinedGame.players.get(ws.id);
          this.sendToClient(ws.id, {
            type: 'game_created',
            payload: {
              gameId: joinedGame.id,
              playerId: ws.id,
              isHost: player.isHost,
              state: joinedGame.getState()
            }
          });
          
          this.broadcast(joinedGame.id, {
            type: 'game_state_updated',
            payload: joinedGame.getState()
          });
          break;

        case 'create_game':
          Logger.info('Creating game for player:', playerName);
          const game = await this.gameManager.createGame(ws.id, playerName);
          this.sendToClient(ws.id, {
            type: 'game_created',
            payload: { 
              gameId: game.id,
              playerId: ws.id,
              state: game.getState()
            }
          });

          this.wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'games_list',
                payload: { 
                  games: this.gameManager.getJoinableGames() 
                }
              }));
            }
          });
          break;

        case 'get_games':
          const joinableGames = this.gameManager.getJoinableGames();
          Logger.info(`Returning ${joinableGames.length} joinable games`);
          this.sendToClient(ws.id, {
            type: 'games_list',
            payload: { games: joinableGames }
          });
          break;

        case 'play_card':
          Logger.info(`Player ${ws.id} playing card in game ${payload.gameId}`);
          try {
            const updatedGame = await this.gameManager.playCard(ws.id);
            if (updatedGame) {
              this.broadcast(payload.gameId, {
                type: 'game_state_updated',
                payload: updatedGame.getState()
              });
            }
          } catch (error) {
            Logger.error('Error playing card:', error);
            this.sendError(ws, error.message);
          }
          break;

        case 'slap':
          Logger.info(`Player ${ws.id} attempting slap in game ${payload.gameId}`);
          const slapResult = await this.gameManager.handleSlap(ws.id);
          if (slapResult) {
            this.broadcast(payload.gameId, {
              type: 'game_state_updated',
              payload: slapResult.gameState
            });
  
            // Send slap result to the player who slapped
            this.sendToClient(ws.id, {
              type: 'slap_result',
              payload: { success: slapResult.success }
            });
          }
          break;

        case 'leave_game':
          await this.gameManager.leaveGame(ws.id, payload.gameId);
          break;

        case 'add_ai_player':
          if (!payload.gameId) {
            return this.sendError(ws, 'Game ID is required');
          }
          Logger.info(`Adding AI player to game ${payload.gameId}`);
          const aiGame = await this.gameManager.addAIPlayer(
            payload.gameId,
            payload.playerName || `AI-${Date.now()}`
          );
          this.broadcast(aiGame.id, {
            type: 'game_state_updated',
            payload: aiGame.getState()
          });
          break;

        case 'start_game':
          if (!payload.gameId) {
            return this.sendError(ws, 'Game ID is required');
          }
          Logger.info(`Starting game ${payload.gameId}`);
          const existingGame = this.gameManager.getGame(payload.gameId);
          if (!existingGame) {
            return this.sendError(ws, 'Game not found');
          }
          const gameState = await existingGame.start();
          this.broadcast(existingGame.id, {
            type: 'game_state_updated',
            payload: gameState
          });
          break;
          
        default:
          Logger.warn('Unknown message type:', type);
          this.sendError(ws, 'Unknown message type');
      }
    } catch (error) {
      Logger.error('Message handling error:', error);
      this.sendError(ws, error.message);
    }
  }

  handleDisconnect(clientId) {
    const ws = this.clients.get(clientId);
    if (ws) {
      this.gameManager.handleDisconnect(clientId);
      this.clients.delete(clientId);
      ws.terminate();
    }
  }

  broadcast(gameId, message) {
    const players = this.gameManager.getGamePlayers(gameId);
    players.forEach(playerId => {
      const ws = this.clients.get(playerId);
      if (ws && ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  sendToClient(clientId, message) {
    const ws = this.clients.get(clientId);
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  sendError(ws, message) {
    ws.send(JSON.stringify({
      type: 'ERROR',
      payload: { message }
    }));
  }

  getConnectedClients() {
    return this.clients.size;
  }
}