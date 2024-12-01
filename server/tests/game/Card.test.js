import { Card } from '../../src/game/Card';

describe('Card', () => {
  test('creates card with correct properties', () => {
    const card = new Card('hearts', 'A');
    expect(card.suit).toBe('hearts');
    expect(card.rank).toBe('A');
  });

  test('flip changes faceUp state', () => {
    const card = new Card('hearts', 'A');
    expect(card.faceUp).toBe(false);
    card.flip();
    expect(card.faceUp).toBe(true);
  });
});