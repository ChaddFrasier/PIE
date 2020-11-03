/// <reference types="cypress" />

context('Main Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/')
  })

  // https://on.cypress.io/interacting-with-elements

  it( "Should Navigate to home." ,()=> {
    cy.url().should('eq', 'http://localhost:8080/')
  });
})
