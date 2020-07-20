describe('Editor Page Tests > ', () => {

    beforeEach(() => {
        cy.visit('/');
    });

    it("Should have no objects in layers at start", () => {
        // tooldivider should have no siblings after it
        cy.get("#tooldivider").siblings(".imagetoolsbox").should("have.length", 0)
        cy.get("#tooldivider").siblings(".captiontoolsbox").should("have.length", 0)
    });

    it("Should Add Image tools box when image button is clicked", () => {
        // add an image using the btn
        cy.get("#addimagebtn").click()
        cy.get("#tooldivider").siblings(".imagetoolsbox").should("have.length", 1)

        cy.get("#addimagebtn").click()
        cy.get("#tooldivider").siblings(".imagetoolsbox").should("have.length", 2)
    });

    it("Should Add Caption tools box when caption button is clicked", () => {
        // add an image using the btn
        cy.get("#addcaptionbtn").click()
        cy.get("#addcaptionbtn").click()
        cy.get("#tooldivider").siblings(".captiontoolsbox").should("have.length", 2)
    });

    
    it("Should Close and disable add buttons when sidebar is closed", () => {
        // close the sidebar for tools window
        cy.get(".toolboxminimizebtn").click()
        cy.get("#addimagebtn.disabled").should("have.length", 1)
        cy.get("#addcaptionbtn.disabled").should("have.length", 1)

        // when clicked again it should remove the disabled class
        cy.get(".toolboxminimizebtn").click()
        cy.get("#addimagebtn.disabled").should("have.length", 0)
        cy.get("#addcaptionbtn.disabled").should("have.length", 0)

    });

    it("Background should change when value changes", () => {
        let testcolor = "#374783";

        // change bg color and check
        cy.get("#backgroundcolor").invoke('val', testcolor).trigger('change')

        cy.get("svg#figurecontainer").should("have.css", "background-color", "rgb(55, 71, 131)")
    });

    it("Figure Size Changes SVG viewBox", () => {
        // change bg color and check
        cy.get("#figsizeselect").select('2500x2000')

        cy.get("svg#figurecontainer[viewBox='0 0 2500 2000']").should("have.length",1)
    
        // change bg color and check
        cy.get("#figsizeselect").select('1500x1500')

        cy.get("svg#figurecontainer[viewBox='0 0 2500 2000']").should("have.length",0)
    });

});