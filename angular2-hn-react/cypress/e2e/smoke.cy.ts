describe('Smoke Test', () => {
    it('should load the homepage', () => {
        cy.visit('/');
        cy.contains('Vite + React').should('be.visible');
    });
});
