describe('Angular2 HN React App', () => {
    it('should load the homepage', () => {
        cy.visit('/');
        cy.contains('Hacker News');
        cy.url().should('include', '/news/1');
    });

    it('should navigate between feed types', () => {
        cy.visit('/');
        
        cy.contains('newest').click();
        cy.url().should('include', '/newest/1');
        
        cy.contains('show').click();
        cy.url().should('include', '/show/1');
        
        cy.contains('ask').click();
        cy.url().should('include', '/ask/1');
        
        cy.contains('jobs').click();
        cy.url().should('include', '/jobs/1');
    });
});
