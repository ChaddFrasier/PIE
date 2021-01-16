/// <reference types="cypress" />

context('Annotation Tools Tests', () => 
{
  // add an image and caption element before each testing set
  beforeEach(() => {
    cy.visit('http://localhost:8080/')
    cy.get("#addcaptionbtn").click()
    cy.get("#addimagebtn").click()
  });

    /** Outline Tests */
  describe("Outline Box Tests -> ", () => 
  {
    beforeEach(() => 
    {
      cy.get(".windowminimizebtn").eq(1).click()
      cy.get("#outlinebtnopt").click()
      cy.get("#figurecontainer")
        .trigger("mousedown", {button:0, clientX: 500, clientY: 150})
        .trigger("mousemove", {clienX: 700, clientY: 300})
        .trigger("mouseup")
    });
    // test that drawing works
    it("Should draw an outline when the button is clicked and then drag and drop occurs.", () => 
    {
      cy.get("rect.placed").should("exist")
    });
    // test that color change works
    it("Should be able to change the color of the rectangle outline.", () => 
    {
      cy.get('input[name="rectcolorinput"]').invoke("val", "#00ffff").trigger("change")
      cy.get("rect.placed").should("have.attr","stroke", "#00ffff")
    })
    // test that the x and y position can update
    it("Should change the x position and y position.", () => 
    {
      cy.get("input[name='rectxinput']").clear().type('200{enter}')
      cy.get("input[name='rectyinput']").clear().type('200{enter}')
      cy.get('rect.placed').should("have.attr", "x", 200).should("have.attr", "y", 200)
    });
    // test that the outline thickness works
    it("Should change the thickness of the outline.", () => 
    {
      cy.get("input[name='rectthicknessinput']").clear().type('24{enter}')
      cy.get('rect.placed').should("have.attr", "stroke-width", 24)
    });
    // test that custome width height works for the images
    it("Should be able to add custom width and height.", () => 
    {
      cy.get("input[name='rectwidthinput']").clear().type('202{enter}')
      cy.get("input[name='rectheightinput']").clear().type('500{enter}')
      cy.get('rect.placed').should("have.attr", "width", 202)
      cy.get('rect.placed').should("have.attr", "height", 500)
    });
    // test that the user can drag and drop the outline
    it("Should be able to drag the outline around around.", () => 
    {
      var oldx = cy.get('rect.placed[fill="none"]').invoke("attr", "x")
      var oldy = cy.get('rect.placed[fill="none"]').invoke("attr", "y")
      cy.get("svg#figurecontainer")
        .trigger("mousedown", {target: cy.get('rect.placed'), force: true})
        .trigger("mousemove",{clientX: 400, clientY: 500, force: true})
        .trigger("mouseup", {force:true})
      .then( () => 
      {
        cy.get('rect.placed').invoke("attr", "x").should("not.eq", oldx)
        cy.get('rect.placed').invoke("attr", "y").should("not.eq", oldy)
      });
    });
  });

  /** Line Tests */
  describe("Line Tests -> ", () => {
    beforeEach(() => {
      cy.get(".windowminimizebtn").eq(1).click()
      cy.get("#penciloptbtn").click()
      cy.get("#figurecontainer")
        .trigger("mousedown", {button:0, clientX: 500, clientY: 150})
        .trigger("mousemove", {clienX: 700, clientY: 300})
        .trigger("mouseup")
    });
    // Line should be on screen
    it("Should draw a line when the button is clicked and then drag and drop occurs.", () => {
      cy.get("line.placed").should("exist")
    })
    // line can change colors with no head or tail
    it("Should change colors of the line when there is no heads.", () => {
        cy.get("input[name='linecolorinput']").invoke("val", "#ff0000").trigger("change")
        cy.get("line.placed").should("have.attr", "stroke", "#ff0000")
    })
    // can add a head and tail
    it("Should add an arrow head and a circle to the head and tail respectivley", () => {
      cy.get('select[name="lineheadinput"]').select("Arrow Head")
      cy.get('select[name="linetailinput"]').select("Circle Head")
      cy.get("marker[data-cy='markerhead']").should("exist")
      cy.get("marker[data-cy='markertail']").should("exist")
    });
    // can change color of the markers after they have been added
    it("Should change colors of the line after add head and the colors should match.", () => {
      cy.get('select[name="lineheadinput"]').select("Arrow Head")
      cy.get('select[name="linetailinput"]').select("Square Head")
      cy.get("input[name='linecolorinput']").invoke("val", "#ff0000").trigger("change")
      cy.get("line.placed").should("have.attr", "stroke", "#ff0000")
      cy.get("marker").last().children().first().should("have.attr", "fill", "#ff0000")
      cy.get("marker").last().prev().children().first().should("have.attr", "fill", "#ff0000")
    });
    // can change add markers with any color
    it("Should change colors of the line and add head of same color.", () => {
      cy.get("input[name='linecolorinput']").invoke("val", "#ff0000").trigger("change")
      cy.get("line.placed").should("have.attr", "stroke", "#ff0000")
      cy.get('select[name="lineheadinput"]').select("Arrow Head")
      cy.get('select[name="linetailinput"]').select("Circle Head")
      cy.get("marker").last().children().first().should("have.attr", "fill", "#ff0000")
      cy.get("marker").last().prev().children().first().should("have.attr", "fill", "#ff0000")
    });
    // can change marker thickness and still have markers
    it("Should be able to add markers after changing thickness.", () => {
      cy.get('input[name="linethicknessinput"]').clear().type("20{enter}")
      cy.get('select[name="lineheadinput"]').select("Arrow Head")
      cy.get('select[name="linetailinput"]').select("Circle Head")
      cy.get("marker[data-cy='markerhead']").should("exist")
      cy.get("marker[data-cy='markertail']").should("exist")
    });
    // can have lines with markers that are different colors
    it("Should be able to add multiple lines with different colored markers.", () => {
      // first line
      cy.get('select[name="lineheadinput"]').first().select("Arrow Head")
      cy.get('select[name="linetailinput"]').first().select("Square Head")
      cy.get("input[name='linecolorinput']").first().invoke("val", "#ff0000").trigger("change")
      cy.get("line.placed").last().should("have.attr", "stroke", "#ff0000")
      cy.get("marker").last().children().first().should("have.attr", "fill", "#ff0000")
      cy.get("marker").last().prev().children().first().should("have.attr", "fill", "#ff0000")

      cy.get("#penciloptbtn").click()
      cy.get("#figurecontainer")
        .trigger("mousedown", {button:0, clientX: 700, clientY: 200})
        .trigger("mousemove", {clienX: 900, clientY: 1000})
        .trigger("mouseup")
      // second line
      cy.get('select[name="lineheadinput"]').first().select("Arrow Head")
      cy.get('select[name="linetailinput"]').first().select("Square Head")
      cy.get("input[name='linecolorinput']").first().invoke("val", "#00ff00").trigger("change")
      cy.get("line.placed").last().should("have.attr", "stroke", "#00ff00")
      cy.get("marker").eq(5).children().first().should("have.attr", "fill", "#00ff00")
      cy.get("marker").last().children().first().should("have.attr", "fill", "#00ff00")
    });
    // drag lines with the mouse
    it("Should be able to drag the line around.", () => {
      var oldx = cy.get('line.placed').last().invoke("attr", "x")
      var oldy = cy.get('line.placed').last().invoke("attr", "y")
      cy.get("svg#figurecontainer")
        .trigger("mousedown", {target: cy.get('line.placed').last()})
        .trigger("mousemove",{clientX: 1000, clientY: 400})
        .trigger("mouseup").then( ()=> {
          cy.get('line.placed').last().invoke("attr", "x").should("not.eq", oldx)
          cy.get('line.placed').last().invoke("attr", "y").should("not.eq", oldy)
          cy.get('.windowremovebtn').eq(1).click()
        });
    });
  });
});