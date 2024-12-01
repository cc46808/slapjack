// slapjack/server/src/game/Deck.js
import { Card } from './Card.js';

export class Deck {
    constructor() {
        this.reset();
    }

    reset() {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        
        this.cards = suits.flatMap(suit =>
            ranks.map(rank => new Card(suit, rank))
        );
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        return this;
    }

    deal(numPlayers) {
        this.shuffle();
        const hands = Array(numPlayers).fill().map(() => []);
        this.cards.forEach((card, index) => {
            hands[index % numPlayers].push(card);
        });
        return hands;
    }
}