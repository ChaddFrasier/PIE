describe("Caption Tool Box Tests > ", () => {
    // refresh the page after every test function
    beforeEach(() => {
        cy.visit('/');
    });

    it("Should change caption contents when caption textbox content changes", () => {
        // add empty caption
        cy.get('#addcaptionbtn').click()

        // try to find a captionObject and if there is 1 on the page the button worked
        cy.get("#figurecontainer>.captionObject").should("have.length",1);
        // get the caption editing box and then type in the field
        cy.get("textarea[name='captiontextinput']").type("This is an automated cypress test that is intended to\
        check and see if the caption object is working in terms of reflecting what is in this box{enter}");
        // check that the new contents of the svg object contains part of the required string
        cy.get("#figurecontainer > .captionObject>div").contains("reflecting what")

    });

    it("Should change the caption width and height when the caption width and height is adjusted", () => {
        // add empty caption
        cy.get('#addcaptionbtn').click()

        // check that the caption is there with presets
        cy.get("#figurecontainer>.captionObject").should("have.attr", "width", "1500")
        cy.get("#figurecontainer>.captionObject").should("have.attr", "height", "250")
        
        // change the contents of the input
        cy.get(".captiontoolsbox>input[name='widthlabelinput']").type("1850{enter}")    
        cy.get(".captiontoolsbox>input[name='heightlabelinput']").type("1850{enter}")    
        
        // check that the new entry is the new dimensions 
        cy.get("#figurecontainer>.captionObject").should("have.attr", "width", "1850")
        cy.get("#figurecontainer>.captionObject").should("have.attr", "height", "1850")
    });

    it("Should change the caption x and y when the caption x and y is adjusted", () => {
        // add empty caption
        cy.get('#addcaptionbtn').click()

        // check for position initialization 
        cy.get("#figurecontainer>.captionObject").should("have.attr", "x", "0")
        cy.get("#figurecontainer>.captionObject").should("have.attr", "y", "0")
        
        // enter new position and check that it changes the position of the caption
        cy.get(".captiontoolsbox>input[name='xcoordlabelinput']").type("1850{enter}")    
        cy.get(".captiontoolsbox>input[name='ycoordlabelinput']").type("1850{enter}")    
        cy.get("#figurecontainer>.captionObject").should("have.attr", "x", "1850")
        cy.get("#figurecontainer>.captionObject").should("have.attr", "y", "1850")
    });

    it("Should delete the image object when the x button is clicked", () => {
        // add empty caption
        cy.get('#addcaptionbtn').click()

        // test remove actually removes object
        cy.get(".windowoptionsbar>.windowremovebtn").click()

        // find length 0 of .captionObjects
        cy.get("#figurecontainer > .captionObject").should("have.length", 0);
    });

    it("Should not change the caption width and height when the inputs are not numbers and cannot be converted", () => {
        // add empty caption
        cy.get('#addcaptionbtn').click()

        // change the contents of the input
        cy.get(".captiontoolsbox>input[name='widthlabelinput']").type("dafjsg{enter}")    
        cy.get(".captiontoolsbox>input[name='heightlabelinput']").type("heaufgwy{enter}")    
       
        cy.get("#figurecontainer>.captionObject").should("have.attr", "width", "1500")
        cy.get("#figurecontainer>.captionObject").should("have.attr", "height", "250")
    });

    it("Should change the caption x and y when the caption x and y is NaN", () => {
        // add empty caption
        cy.get('#addcaptionbtn').click()

        // change the contents of the input
        cy.get(".captiontoolsbox>input[name='xcoordlabelinput']").type("dafjsg{enter}")    
        cy.get(".captiontoolsbox>input[name='ycoordlabelinput']").type("heaufgwy{enter}")    
       
        cy.get("#figurecontainer>.captionObject").should("have.attr", "x", "0")
        cy.get("#figurecontainer>.captionObject").should("have.attr", "y", "0")
    });
});