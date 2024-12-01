import { WebSocket } from 'ws';
import { createServer } from 'http';
import { WebSocketManager } from '../../src/services/WebSocketManager';

describe('WebSocket Integration', () => {
  let server, wsManager, client;
  const PORT = 3002;

  beforeAll((done) => {
    server = createServer();
    wsManager = new WebSocketManager(server);
    server.listen(PORT, done);
  });

  beforeEach((done) => {
    client = new WebSocket(`ws://localhost:${PORT}`);
    client.on('open', done);
  });

  afterEach(() => {
    client.close();
  });

  afterAll((done) => {
    server.close(done);
  });

  test('handles game creation', (done) => {
    client.send(JSON.stringify({
      type: 'create_game',
      playerName: 'Test Player'
    }));

    client.on('message', (data) => {
      const message = JSON.parse(data);
      expect(message.type).toBe('game_created');
      expect(message.gameId).toBeDefined();
      done();
    });
  });
});