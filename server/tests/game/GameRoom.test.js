import { GameRoom } from '../../src/game/GameRoom';

describe('GameRoom', () => {
  let gameRoom;
  const playerId = 'test-player';

  beforeEach(() => {
    gameRoom = new GameRoom('test-room', playerId);
  });

  test('initializes with correct state', () => {
    expect(gameRoom.id).toBe('test-room');
    expect(gameRoom.state).toBe('waiting');
  });

  test('handles player joining', async () => {
    await gameRoom.addPlayer(playerId, 'Test Player');
    expect(gameRoom.players.size).toBe(1);
  });

  test('processes valid slap', async () => {
    await gameRoom.addPlayer(playerId, 'Test Player');
    await gameRoom.start();
    gameRoom.centerPile = [{ rank: 'J', suit: 'hearts' }];
    
    const result = await gameRoom.handleSlap(playerId);
    expect(result.success).toBe(true);
  });
});