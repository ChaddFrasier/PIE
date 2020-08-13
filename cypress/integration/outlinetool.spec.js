describe("Outline Tests > ", () => {
    beforeEach(()=> {
        cy.visit('/');

        // Click pencil and draw  a line
        cy.get("#outlinebtnopt").click();

        cy.get("#figurecontainer").trigger("mousedown", {clientX:415, clientY: 209})
        .trigger("mousemove", {clientX: 638, clientY: 452})
        .trigger("mouseup", {clientX: 704, clientY: 507})
    })

    it("Test that the outline exists", () => {
        cy.get("#figurecontainer>rect").should("exist")
    })

    it("Test that the outline color changes when needed", () => {
        // test color val
        let testcolor = "#1d84b5"

        // change the color of the line
        cy.get("input[type='color']").last()
            .invoke("val", testcolor)
            .trigger("change")

        // test that the color works
        cy.get("#figurecontainer>rect").should("have.attr", "stroke", testcolor)
    })

    it("Test that the outline X point moves when changed in input", () => {
        // change the x val
        cy.get("input[type='number']").eq(3)
            .clear().type("300{enter}")
            .trigger("change")

        // test that x changed
        cy.get("#figurecontainer>rect").should("have.attr", "x", 300)
    })

    it("Test that the outline Y point moves when changed in input field", () => {
        cy.get("#figurecontainer>rect").should("exist")
        // change the y value
        cy.get("input[type='number']").eq(4)
            .clear().type("300{enter}")
            .trigger("change")

        // test that y changed
        cy.get("#figurecontainer>rect").should("have.attr", "y", 300)
    })

    it("Test that the outline thickness works", () =>{ 
        // change the stroke-width
        cy.get("input[type='number']").first()
            .clear().type("150{enter}")
            .trigger("change")

        // test that stroke-width changed
        cy.get("#figurecontainer>rect").last().should("have.attr", "stroke-width", 150)
    })

    it("Test that the outline width works", () => {
        // change the width
        cy.get("input[type='number']").eq(1)
            .clear().type("150{enter}")
            .trigger("change")

        // test that width changed
        cy.get("#figurecontainer>rect").should("have.attr", "width", 150)
    })

    it("Test that the outline height works", () => {
        // change the height
        cy.get("input[type='number']").eq(2)
            .clear().type("150{enter}")
            .trigger("change")

        // test that height changed
        cy.get("#figurecontainer>rect").should("have.attr", "height", 150)
    })

    it("Test that the outline removes when the button is clicked", () => {
        // check that it is removed
        cy.get(".windowremovebtn").last()
            .click()
        cy.get("#figurecontainer>rect").should("not.exist")
    })
})