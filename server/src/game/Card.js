// slapjack/server/src/game/Card.js
export class Card {
  constructor(suit, rank) {
      this.id = `${rank}-${suit}-${Date.now()}`;
      this.suit = suit;
      this.rank = rank;
      this.faceUp = false;
  }

  flip() {
      this.faceUp = !this.faceUp;
      return this;
  }

  toJSON() {
      return {
          id: this.id,
          suit: this.suit,
          rank: this.rank,
          faceUp: this.faceUp
      };
  }

  toString() {
    return `${this.rank} of ${this.suit}`;
  }
}