/// <reference types="cypress" />

context('Navigation Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/')
  })

  // https://on.cypress.io/interacting-with-elements

  describe("Page Navigation Tests -> ", () =>{ 
    it( "Should start on home page." ,() => {
      cy.url().should('eq', 'http://localhost:8080/')
    });
  
    it( "Should Navigate to /about when 'Getting Started' clicked." ,() => {
      // click the getting started button
      cy.get(".footerbuttongroup>a:first").click()

      // test the url
      cy.url().should('eq', 'http://localhost:8080/about')
    });

    it( "Should Navigate to /faq when 'FAQ' clicked." ,() => {
      // click the navigation button
      cy.get(".footerbuttongroup>a:last").click()

      // test the url
      cy.url().should('eq', 'http://localhost:8080/faq')
    });

    it( "Should Navigate to /contact when 'Contact Us' clicked." ,() => {
      // click the nav btn
      cy.get(".footerbuttongroup>a:first").next().click()

      // test the url
      cy.url().should('eq', 'http://localhost:8080/contact')
    });

    it("Should navigate back to / when the PIE imgLogo is clicked on any of the 3 child pages.", () => {
      // navigate to /about
      cy.get(".footerbuttongroup>a:first").click()

      cy.get("img.titleLogo").click()
      cy.url().should("eq", "http://localhost:8080/")

      cy.get(".footerbuttongroup>a:first").next().click()

      cy.get("img.titleLogo").click()
      cy.url().should("eq", "http://localhost:8080/")


      cy.get(".footerbuttongroup>a:last").click()

      cy.get("img.titleLogo").click()
      cy.url().should("eq", "http://localhost:8080/")
    });
  });

  describe("About Page Link Tests -> ", ()=>{
    beforeEach(() => {
      cy.visit('http://localhost:8080/')
      cy.get(".footerbuttongroup>a:first").click()
    })

    it( "Should be on about page." ,()=> {
      cy.url().should('eq', 'http://localhost:8080/about')
    });

    it( "Should have a disabled button for the first footer button." ,()=> {
      cy.get(".footerbuttongroup>a:first").should("have.class", "disabled")
    });

    it( "Other footer buttons should work perfectly." ,()=> {
      cy.get(".footerbuttongroup>a:last").should("not.have.class", "disabled")
      cy.get(".footerbuttongroup>a:first").next().should("not.have.class", "disabled")
    });
  });

  describe("Contact Page Link Tests -> ", ()=>{
    beforeEach(() => {
      cy.visit('http://localhost:8080/')
      cy.get(".footerbuttongroup>a:first").next().click()
    })

    it( "Should be on about page." ,()=> {
      cy.url().should('eq', 'http://localhost:8080/contact')
    });

    it( "Should have a disabled button for the second footer button." ,()=> {
      cy.get(".footerbuttongroup>a:first").next().should("have.class", "disabled")
    });

    it( "Other footer buttons should work perfectly." ,()=> {
      cy.get(".footerbuttongroup>a:last").should("not.have.class", "disabled")
      cy.get(".footerbuttongroup>a:first").should("not.have.class", "disabled")
    });
  });

  describe("FAQ Page Link Tests -> ", ()=>{
    beforeEach(() => {
      cy.visit('http://localhost:8080/')
      cy.get(".footerbuttongroup>a:last").click()
    })

    it( "Should be on about page." ,()=> {
      cy.url().should('eq', 'http://localhost:8080/faq')
    });

    it( "Should have a disabled button for the last footer button." ,()=> {
      cy.get(".footerbuttongroup>a:last").should("have.class", "disabled")
    });

    it( "Other footer buttons should work perfectly." ,()=> {
      cy.get(".footerbuttongroup>a:first").next().should("not.have.class", "disabled")
      cy.get(".footerbuttongroup>a:first").should("not.have.class", "disabled")
    });
  });
});
