describe('Multiplayer', () => {
    it('allows two players to join same game', () => {
      cy.session('player1', () => {
        cy.visit('/');
        cy.createGame('Player 1');
      });
  
      cy.session('player2', () => {
        cy.visit('/');
        cy.joinGame('Player 2');
      });
  
      cy.get('.player-list').should('contain', 'Player 1')
        .and('contain', 'Player 2');
    });
  });