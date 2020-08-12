describe("Outline Tests > ", () => {
    // TODO: comment
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
        let testcolor = "#1d84b5"
        // change the color of the line
        cy.get("input[type='color']").last()
            .invoke("val", testcolor)
            .trigger("change")

        // test that the color works
        cy.get("#figurecontainer>rect").should("have.attr", "stroke", testcolor)
    })

    it("Test that the outline X point moves when changed in input", () => {
        // change the color of the line
        cy.get("input[type='number']").first()
            .clear().type("300{enter}")
            .trigger("change")

        // test that x changed
        cy.get("#figurecontainer>rect").should("have.attr", "x", 300)
    })

    it("Test that the outline Y point moves when changed in input field", () => {
        cy.get("#figurecontainer>rect").should("exist")
        // change the color of the line
        cy.get("input[type='number']").eq(1)
            .clear().type("300{enter}")
            .trigger("change")

        // test that x changed
        cy.get("#figurecontainer>rect").should("have.attr", "y", 300)
    })

    it("Test that the outline thickness works", () =>{ 
        // change the color of the line
        cy.get("input[type='number']").last()
            .clear().type("150{enter}")
            .trigger("change")

        // test that x changed
        cy.get("#figurecontainer>rect").last().should("have.attr", "stroke-width", 150)
    })

    it("Test that the outline width works", () => {
        // change the color of the line
        cy.get("input[type='number']").eq(2)
            .clear().type("150{enter}")
            .trigger("change")

        // test that x changed
        cy.get("#figurecontainer>rect").should("have.attr", "width", 150)
    })

    it("Test that the outline height works", () => {
        // change the color of the line
        cy.get("input[type='number']").eq(3)
            .clear().type("150{enter}")
            .trigger("change")

        // test that x changed
        cy.get("#figurecontainer>rect").should("have.attr", "height", 150)
    })

    it("Test that the outline removes when the button is clicked", () => {
        cy.get(".windowremovebtn").first()
            .click()
        cy.get("#figurecontainer>rect").should("not.exist")
    })
})