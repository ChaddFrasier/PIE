/// <reference types="cypress" />

context('Tools Tests', () => {
    beforeEach(() => {
      cy.visit('http://localhost:8080/')
      cy.get("#addcaptionbtn").click()
      cy.get("#addimagebtn").click()
    })
  
    // https://on.cypress.io/interacting-with-elements
  
    describe("Caption Tests -> ", () =>{ 
      it( "Should start on home page." ,() => {
        cy.url().should('eq', 'http://localhost:8080/')
      });

      it( "Should add caption when add caption button is clicked." ,() => {
        cy.get("svg>text").should("exist")
      });

      it("Change the text should also change the text inside the caption", () => {
        cy.get("textarea[name='captiontextinput']")
            .type("This is a test to see if typing inside of the editable textarea changes html")

        cy.get("text[data-cy='caption']>tspan>tspan").should("have.html", "This is a test to see if typing inside of the editable textarea changes html")
      });
    });


    describe("Image Tests -> ", () =>{ 
        it( "Should add caption when add caption button is clicked." ,() => {
          cy.get("image.holder").should("exist")
        });
      });
});