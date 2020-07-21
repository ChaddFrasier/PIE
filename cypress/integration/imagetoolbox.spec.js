describe("Image Tool Box Tests > ", () => {
    // refresh the page after every test function
    beforeEach(() => {
        cy.visit('/');
    });

    it("Should change image href when image in the input box changes", () => {
        // adds image object
        cy.addTestImage('galaxycolor.jpg')

        // check that image exists and that it is not a default image
        cy.get("#figurecontainer > image").should("have.length",1);
        cy.get("#figurecontainer > image").not("href",'test/moonphasestest.jpg').should("have.length", 1);

        // clikc the add btn again and check for default image
        cy.get("#addimagebtn").click()
        cy.get("#figurecontainer > image[href='test/moonphasestest.jpg']").should("have.length", 1);
    });

    it("Should change the image width and height when the image width and height is adjusted", () => {
        // adds image object
        cy.addTestImage('galaxycolor.jpg')

        // check width and height at start
        cy.get("#figurecontainer>image").should("have.attr", "width", "1500")
        cy.get("#figurecontainer>image").should("have.attr", "height", "1000")
        
        // change width and height of the image
        cy.get("input[name='widthinput']").type("1850{enter}")    
        cy.get("input[name='heightinput']").type("1850{enter}")    
        
        // check for the peoper change in the svg
        cy.get("#figurecontainer>image").should("have.attr", "width", "1850")
        cy.get("#figurecontainer>image").should("have.attr", "height", "1850")
    });

    it("Should change the image x and y when the image x and y is adjusted", () => {
        // adds image object
        cy.addTestImage('galaxycolor.jpg')

        // check image position at the start
        cy.get("#figurecontainer>image").should("have.attr", "x", "0")
        cy.get("#figurecontainer>image").should("have.attr", "y", "0")
        
        // type the new dimensions and then check for svg element change
        cy.get("input[name='xcoordinput']").type("1850{enter}")    
        cy.get("input[name='ycoordinput']").type("1850{enter}")    
        cy.get("#figurecontainer>image").should("have.attr", "x", "1850")
        cy.get("#figurecontainer>image").should("have.attr", "y", "1850")
    });

    it("Should delete the image object when the x button is clicked", () => {
        // adds image object
        cy.addTestImage('galaxycolor.jpg')
        
        // click the remove button
        cy.get(".windowoptionsbar>.windowremovebtn").click()

        // check for a valid image, should be undefined
        cy.get("#figurecontainer>image").should("have.length",0);
    });

    it("Should change the image x and y when the image x and y is NaN", () => {
        // add empty caption
        cy.get('#addimagebtn').click()

        // change the contents of the input
        cy.get(".imagetoolsbox>input[name='xcoordinput']").type("dafjsg{enter}")    
        cy.get(".imagetoolsbox>input[name='ycoordinput']").type("heaufgwy{enter}")    
       
        cy.get("#figurecontainer>image").should("have.attr", "x", "0")
        cy.get("#figurecontainer>image").should("have.attr", "y", "0")
    });

    it("Should change the image width and height when the image width and height is NaN", () => {
        // add empty caption
        cy.get('#addimagebtn').click()

        // change the contents of the input
        cy.get(".imagetoolsbox>input[name='widthinput']").type("dafjsg{enter}")    
        cy.get(".imagetoolsbox>input[name='heightinput']").type("heaufgwy{enter}")    
       
        cy.get("#figurecontainer>image").should("have.attr", "width", "1500")
        cy.get("#figurecontainer>image").should("have.attr", "height", "1000")
    });
});