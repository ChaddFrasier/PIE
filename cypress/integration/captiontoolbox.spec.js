describe("Caption Tool Box Tests > ", () => {
    // refresh the page after every test function
    beforeEach(() => {
        cy.visit('/');
    });

    it("Should change caption contents when caption textbox content changes", () => {
        // add empty caption
        cy.get('#addcaptionbtn').click()

        // check it was created
        cy.get("#figurecontainer>.captionObject").should("have.length",1);
        cy.get("textarea[name='captiontextinput']").type("This is an automated cypress test that is intended to\
        check and see if the caption object is working in terms of reflecting what is in this box{enter}");

        cy.get("#figurecontainer > .captionObject>div").contains("his is an automated")

    });

    it("Should change the caption width and height when the caption width and height is adjusted", () => {
        // add empty caption
        cy.get('#addcaptionbtn').click()

        cy.get("#figurecontainer>.captionObject").should("have.attr", "width", "1500")
        cy.get("#figurecontainer>.captionObject").should("have.attr", "height", "250")
        
        cy.get(".captiontoolsbox>input[name='widthlabelinput']").type("1850{enter}")    
        cy.get(".captiontoolsbox>input[name='heightlabelinput']").type("1850{enter}")    
        cy.get("#figurecontainer>.captionObject").should("have.attr", "width", "1850")
        cy.get("#figurecontainer>.captionObject").should("have.attr", "height", "1850")
    });

    it("Should change the caption x and y when the caption x and y is adjusted", () => {
        // add empty caption
        cy.get('#addcaptionbtn').click()
        cy.get("#figurecontainer>.captionObject").should("have.attr", "x", "0")
        cy.get("#figurecontainer>.captionObject").should("have.attr", "y", "0")
        
        cy.get(".captiontoolsbox>input[name='xcoordlabelinput']").type("1850{enter}")    
        cy.get(".captiontoolsbox>input[name='ycoordlabelinput']").type("1850{enter}")    
        cy.get("#figurecontainer>.captionObject").should("have.attr", "x", "1850")
        cy.get("#figurecontainer>.captionObject").should("have.attr", "y", "1850")
    });

    it("Should delete the image object when the x button is clicked", () => {
        // add empty caption
        cy.get('#addcaptionbtn').click()
        cy.get(".windowoptionsbar>.windowremovebtn").click()
        cy.get("#figurecontainer > .captionObject").should("have.length", 0);
    });
});