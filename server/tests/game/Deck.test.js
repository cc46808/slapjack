import { Deck } from '../../src/game/Deck';

describe('Deck', () => {
  let deck;

  beforeEach(() => {
    deck = new Deck();
  });

  test('initializes with 52 cards', () => {
    expect(deck.cards.length).toBe(52);
  });

  test('shuffle changes card order', () => {
    const originalOrder = [...deck.cards];
    deck.shuffle();
    expect(deck.cards).not.toEqual(originalOrder);
  });

  test('deal distributes cards evenly', () => {
    const hands = deck.deal(4);
    hands.forEach(hand => expect(hand.length).toBe(13));
  });
});