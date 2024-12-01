export class Player {
    constructor(id, name, isAI = false) {
      this.id = id;
      this.name = name;
      this.isAI = isAI;
      this.hand = [];
      this.isHost = false;
      this.lastActivity = Date.now();
      this.lastSlap = 0;
    }
  
    addCards(cards) {
      this.hand.push(...cards);
      this.updateActivity();
    }
  
    playCard() {
      if (this.hand.length === 0) return null;
      const card = this.hand.shift();
      this.updateActivity();
      return card;
    }
  
    updateActivity() {
      this.lastActivity = Date.now();
    }
  
    canSlap() {
      return Date.now() - this.lastSlap >= 500;
    }
  
    toJSON() {
      return {
        id: this.id,
        name: this.name,
        isAI: this.isAI,
        isHost: this.isHost,
        handSize: this.hand.length,
        lastActivity: this.lastActivity
      };
    }
  }