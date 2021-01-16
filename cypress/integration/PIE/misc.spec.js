/// <reference types="cypress" />

context('Navigation Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/')
    cy.get("#addcaptionbtn").click()
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

  /** Main Tests */
  describe("Main Editor Tests -> ", () => {
    // test that the background color can change
    it("Background should change when the main background color input changes.", () => {
      cy.get("button.windowminimizebtn").first().click()
      cy.get("input[type='color']").first().invoke("val", '#ffeebb').trigger("change")
      cy.get('#bgelement').should("have.attr", "fill", "#ffeebb")
    });
    // test that the dimensions work
    it("Figure dimensions should change when the selected figure size changes.", () => {
      cy.get("button.windowminimizebtn").first().click()
      cy.get("select#figsizeselect").select("2500x2000")
      cy.get("svg#figurecontainer").should("have.attr", "viewBox", "0 0 2500 2000")
    });
    // test that the toolbox can be hidden.
    it("Should be able to minimize or close thetoolbox", () => {
      cy.get("button.toolboxminimizebtn").click()
      cy.get(".toolboxcontainer.closed").should("exist")
    });
    // test that the toolbox can be dragged and change the svg layers.
    it("Should be able to drag toolboxes to shift the svg layers.", () => {
      const startTopObject = {
        toolbox: cy.get('.draggableToolbox').first(),
        svg: cy.get('#figurecontainer').children().last()
      };
      cy.get("button.windowminimizebtn").eq(2).click()
      cy.get("button.windoworderingbtn").first()
        .trigger("mousedown")
        .then(() => {
          cy.document().trigger("mousemove", {pageY:1300, pageX:293})
          cy.get("#toolbox").trigger("mousemove", {pageY:1300, pageX:293})
        })
        cy.get('#figurecontainer').children().last().should('not.eq', startTopObject.svg)
        cy.get('.draggableToolbox').first().should('not.eq', startTopObject.toolbox)
    });
  });
});
