/** 
 * Main Testing File 
 * 
 * This file will be the main testing file that must be run before pushing any docker container or code to the main docker image
 * */

/// <reference types="cypress" />

context('Tools Tests', () => {
  // add an image and caption element before each testing set
  beforeEach(() => {
    cy.visit('http://localhost:8080/')
    cy.get("#addcaptionbtn").click()
    cy.get("#addimagebtn").click()
  })
  
  // https://on.cypress.io/interacting-with-elements

  /** Icon Tests */
  describe("Icon Tests ->", () => {
    // run before each icon test set
    beforeEach(() => {
      // upload the test cub image
      cy.get(".windowminimizebtn").eq(1).click()
      cy.get("input[type='file']").attachFile('3640r.stretch.cub')
        .trigger("change", {bubbles: true}).wait(1000)
        .then((res) =>
      {
        console.log(res)
        // validate when upload finishes
        cy.get('image.holder').invoke("attr", "href").should("match", /^(data\:image\/jpeg;base64,).*/i)
      })
    });

    it("Should scale the icon when input updates.", () => {
      cy.get("#observerarrowopt").trigger("mousedown", {button: 0, bubbles: true}).then((btn) => {
        cy.document().trigger("mouseup", { target: cy.get("image[GEO='true']"), bubbles: true})
      });

      // capture the old scale value
      var oldscale = cy.get('rect.marker').last().invoke("attr","scale")

      // enter the new value and test that the scale is different
      cy.get("input[name='iconscaleinput']").clear().type("10{enter}")
      cy.get('rect.marker').last().invoke("attr", "scale").should("not.eq", oldscale)

      // check that the scale equals the input
      cy.get('rect.marker').last().parent().invoke("attr", "scale").should("eq", '10')
    });

    it("Should change the main color of the icon when input updates.", () => {
      // capture the old icon group
      var oldGroup = cy.get("g.holder").children().first()

      // update the main color input
      cy.get("input[name='iconmaincolorinput']").invoke("val", "#ff0000").trigger("change")

      // check that the group changes
      cy.get("g.holder").children().first().should("not.eq", oldGroup)
    });

    // same as main color
    it("Should change the secondary color of the icon when input updates.", () => {
      var oldGroup = cy.get("g.holder").children().first()
      cy.get("input[name='iconsecondarycolorinput']").invoke("val", "#00fff0").trigger("change")
      cy.get("g.holder").children().first().should("not.eq", oldGroup)
    });

    it("Should have all the icons on the uploaded image.", () => {

      // add all the icons and test that all can be added
      cy.get("#sunarrowopt").trigger("mousedown", {button: 0}).then((btn) => {
        cy.document().trigger("mousmove", {pageX: 2000, pageY: 2000})
        cy.document().trigger("mouseup", {target: cy.get("image[GEO='true']"), force:true})
      });
      cy.get("#observerarrowopt").trigger("mousedown", {button: 0}).then((btn) => {
        cy.document().trigger("mousmove", {pageX: 2000, pageY: 1500})
        cy.document().trigger("mouseup", {target: cy.get("image[GEO='true']"), force:true})
      });
      cy.get("#scalebarbtnopt").trigger("mousedown", {button: 0}).then((btn) => {
        cy.document().trigger("mousmove", {pageX: 2000, pageY: 2500})
        cy.document().trigger("mouseup", {target: cy.get("image[GEO='true']"), force:true})
      });

      // test all icons exist
      cy.get("image.holder").should("exist")
      cy.get("image.holder").next().invoke("attr", "id").should("match", /^northIcon-.*/i)
      cy.get("image.holder").next().next().invoke("attr", "id").should("match", /^sunIcon-.*/i)
      cy.get("image.holder").next().next().next().invoke("attr", "id").should("match", /^observerIcon-.*/i)
      cy.get("image.holder").next().next().next().next().invoke("attr", "id").should("match", /^scalebarIcon-.*/i)
    });

    it("Should be able to change the x and y input for the icons.", () => {
      // get old coordinates
      var oldx = cy.get('rect.marker').last().invoke("attr","x")
      var oldy = cy.get('rect.marker').last().invoke("attr","y")

      // change the input values
      cy.get("input[name='iconxcoordinput']").clear().type("200{enter}")
      cy.get("input[name='iconycoordinput']").clear().type("400{enter}")

      // x and y should be equal to the input and not equal to the old values
      cy.get('rect.marker').last().invoke("attr", "x").should("not.eq", oldx)
      cy.get('rect.marker').last().invoke("attr", "y").should("not.eq", oldy)
      cy.get('rect.marker').last().parent().invoke("attr", "x").should("eq", '200')
      cy.get('rect.marker').last().parent().invoke("attr", "y").should("eq", '400')
    });

    it("Should be able to drag each of the icons.", () => { 

      // same as above but testing the location changes using drag event
      var oldx = cy.get('rect.marker').last().invoke("attr","x")
      var oldy = cy.get('rect.marker').last().invoke("attr","y")

      cy.get("image.holder").last().then( () => {
        cy.get("svg#figurecontainer")
        .trigger("mousedown", {target: cy.get('rect.marker').last()})
        .trigger("mousemove",{clientX: 1000, clientY: 400})
        .trigger("mouseup").then( ()=> {
          cy.get('rect.marker').last().invoke("attr", "x").should("not.eq", oldx)
          cy.get('rect.marker').last().invoke("attr", "y").should("not.eq", oldy)
          cy.get('.windowremovebtn').eq(1).click()
        });
      });

      // same as above but with sun icon
      cy.get("#sunarrowopt").trigger("mousedown", {button: 0}).then((btn) => {
        cy.document().trigger("mousmove", {pageX: 2000, pageY: 2000})
        cy.document().trigger("mouseup", {target: cy.get("image[GEO='true']"), force:true})
      });
      oldx = cy.get('rect.marker').last().invoke("attr","x")
      oldy = cy.get('rect.marker').last().invoke("attr","y")
      cy.get("image.holder").last().then( () => {
        cy.get("svg#figurecontainer")
        .trigger("mousedown", {target: cy.get('rect.marker').last()})
        .trigger("mousemove",{clientX: 1000, clientY: 400})
        .trigger("mouseup").then( ()=> {
          cy.get('rect.marker').last().invoke("attr", "x").should("not.eq", oldx)
          cy.get('rect.marker').last().invoke("attr", "y").should("not.eq", oldy)

          cy.get('.windowremovebtn').eq(1).click()
        });
      });

      // observer icon dragging
      cy.get("#observerarrowopt").trigger("mousedown", {button: 0}).then((btn) => {
        cy.document().trigger("mousmove", {pageX: 2000, pageY: 1500})
        cy.document().trigger("mouseup", {target: cy.get("image[GEO='true']"), force:true})
      });
      oldx = cy.get('rect.marker').last().invoke("attr","x")
      oldy = cy.get('rect.marker').last().invoke("attr","y")
      cy.get("image.holder").last().then( () => {
        cy.get("svg#figurecontainer")
        .trigger("mousedown", {target: cy.get('rect.marker').last()})
        .trigger("mousemove",{clientX: 1000, clientY: 400})
        .trigger("mouseup").then( ()=> {
          cy.get('rect.marker').last().invoke("attr", "x").should("not.eq", oldx)
          cy.get('rect.marker').last().invoke("attr", "y").should("not.eq", oldy)
          cy.get('.windowremovebtn').eq(1).click()
        });
      });

      // scalebar icon dragging
      cy.get("#scalebarbtnopt").trigger("mousedown", {button: 0}).then((btn) => {
        cy.document().trigger("mousmove", {pageX: 2000, pageY: 2500})
        cy.document().trigger("mouseup", {target: cy.get("image[GEO='true']"), force:true})
      });
      oldx = cy.get('rect.marker').last().invoke("attr","x")
      oldy = cy.get('rect.marker').last().invoke("attr","y")
      cy.get("image.holder").last().then( () => {
        cy.get("svg#figurecontainer")
        .trigger("mousedown", {target: cy.get('rect.marker').last(), force: true})
        .trigger("mousemove",{clientX: 1000, clientY: 400})
        .trigger("mouseup").then( ()=> {
          cy.get('rect.marker').last().invoke("attr", "x").should("not.eq", oldx)
          cy.get('rect.marker').last().invoke("attr", "y").should("not.eq", oldy)
          cy.get('.windowremovebtn').eq(1).click()
        });
      });
    });
  });
});