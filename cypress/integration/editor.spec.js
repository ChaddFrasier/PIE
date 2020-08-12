describe('Editor Page Tests > ', () => {
    // refresh the page
    beforeEach(() => {
        cy.visit('/');
    });

    it("Should have no objects in layers at start", () => {
        // tooldivider should have no siblings that care related to captions or images
        cy.get("#tooldivider").siblings(".imagetoolsbox").should("have.length", 0)
        cy.get("#tooldivider").siblings(".captiontoolsbox").should("have.length", 0)
    });

    it("Should Add Image tools box when image button is clicked", () => {
        // add an image using the btn
        cy.get("#addimagebtn").click()
        
        // check that there is 1 tool box exists
        cy.get("#tooldivider").siblings(".imagetoolsbox").should("have.length", 1)

        // add another image
        cy.get("#addimagebtn").click()

        // check that there are two now
        cy.get("#tooldivider").siblings(".imagetoolsbox").should("have.length", 2)
    });

    it("Should Add Caption tools box when caption button is clicked", () => {
        // add 2 captions
        cy.get("#addcaptionbtn").click()
        cy.get("#addcaptionbtn").click()
        // check there are 2 caption tool boxes
        cy.get("#tooldivider").siblings(".captiontoolsbox").should("have.length", 2)
    });

    
    it("Should Close and disable add buttons when sidebar is closed", () => {
        // close the sidebar for tools window
        cy.get(".toolboxminimizebtn").click()

        // check that buttons are disabled when closed
        cy.get("#addimagebtn.disabled").should("have.length", 1)
        cy.get("#addcaptionbtn.disabled").should("have.length", 1)

        // when clicked again it should remove the disabled class
        cy.get(".toolboxminimizebtn").click()
        cy.get("#addimagebtn.disabled").should("have.length", 0)
        cy.get("#addcaptionbtn.disabled").should("have.length", 0)

    });

    it("Background should change when value changes", () => {
        // color to test
        let testcolor = "#374783";

        // change bg color and check
        cy.get("#backgroundcolor").invoke('val', testcolor).trigger('change')

        // check the background of the figure svg element
        cy.get("svg#figurecontainer").should("have.css", "background-color", "rgb(55, 71, 131)")
    });

    it("Figure Size Changes SVG viewBox", () => {
        // change bg color and check
        cy.get("#figsizeselect").select('2500x2000')

        // check that the viewBox has the correct dimensions when it is changed
        cy.get("svg#figurecontainer[viewBox='0 0 2500 2000']").should("have.length", 1)
    
        // change bg color and check
        cy.get("#figsizeselect").select('1500x1500')
        
        // should be changed when the select is changed
        cy.get("svg#figurecontainer[viewBox='0 0 2500 2000']").should("have.length", 0)
    });

    it("Window Size Changes when the mini button is clicked", () => {
        // check that there is no closed tool box
        cy.get("#edittoolsbox[class='closed']").should("have.length", 0)
        
        // click the minimize again
        cy.get("#editminibtn").click()

        // check that it is closed
        cy.get("#edittoolsbox").should("have.class", "closed")
    });

    it("Navigate to 'Getting Started'", () => {
        // should be closed when the mini button is clicked
        cy.get(".footerbuttongroup>a").first().click();

        cy.get("title").should("have.html", "Get Started");
    });

    it("Navigate to 'FAQ'", () => {
        // should be closed when the mini button is clicked
        cy.get(".footerbuttongroup>a").last().click();

        cy.get("title").should("have.html", "FAQ");
    });

    it("Navigate to 'Contact Us' and back to index.html", () => {
        // should be closed when the mini button is clicked
        cy.get(".footerbuttongroup>a").first().next().click();
        
        // check for proper page header
        cy.get("title").should("have.html", "Contact Us");

        // navigate home
        cy.get(".pips2Header > a.centercontainer").click();

        // test for home
        cy.get("title").should("have.html", "PIE");
    });

    it("Test that the pencil button disables other buttons", () => {
        
        // open the mini button and clikc the penicl button
        cy.get("#penciloptbtn").click();

        // test that the UI disables all the buttons
        cy.get("#northarrowopt").should("have.attr", "class", 'disabled');
        cy.get("#sunarrowopt").should("have.attr", "class", 'disabled');
        cy.get("#observerarrowopt").should("have.attr", "class", 'disabled');
        cy.get("#outlinebtnopt").should("have.attr", "class", 'disabled');

        // test that it turn back on
        cy.get("#penciloptbtn").click();

        cy.get("#northarrowopt").should("have.attr", "class", '');
        cy.get("#sunarrowopt").should("have.attr", "class", '');
        cy.get("#observerarrowopt").should("have.attr", "class", '');
        cy.get("#outlinebtnopt").should("have.attr", "class", '');
    });

});