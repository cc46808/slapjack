describe('Game Flow', () => {
    beforeEach(() => {
      cy.visit('/');
    });
  
    it('allows game creation', () => {
      cy.get('input[placeholder="Enter your name"]').type('Test Player');
      cy.contains('Create Game').click();
      cy.get('.game-code').should('be.visible');
    });
  
    it('handles card playing', () => {
      // Setup game
      cy.setupGame();
      cy.get('.play-card-button').click();
      cy.get('.center-pile').should('not.be.empty');
    });
  });