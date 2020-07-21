describe("Image Tool Box Tests > ", () => {
    // refresh the page after every test function
    beforeEach(() => {
        cy.visit('/');
    });

    it("Should change image href when image in the input box changes", () => {
        // adds image object
        cy.addTestImage('galaxycolor.jpg')
        // check that image is not default image
        cy.get("#figurecontainer > image").should("have.length",1);
        cy.get("#figurecontainer > image").not("href",'test/moonphasestest.jpg').should("have.length", 1);

        cy.get("#addimagebtn").click()
        cy.get("#figurecontainer > image[href='test/moonphasestest.jpg']").should("have.length", 1);
    });

    it("Should change the image width and height when the image width and height is adjusted", () => {
        // adds image object
        cy.addTestImage('galaxycolor.jpg')

        cy.get("#figurecontainer>image").should("have.attr", "width", "1500")
        cy.get("#figurecontainer>image").should("have.attr", "height", "1000")
        
        cy.get("input[name='widthinput']").type("1850{enter}")    
        cy.get("input[name='heightinput']").type("1850{enter}")    
        cy.get("#figurecontainer>image").should("have.attr", "width", "1850")
        cy.get("#figurecontainer>image").should("have.attr", "height", "1850")
    });

    it("Should change the image x and y when the image x and y is adjusted", () => {
        // adds image object
        cy.addTestImage('galaxycolor.jpg')

        cy.get("#figurecontainer>image").should("have.attr", "x", "0")
        cy.get("#figurecontainer>image").should("have.attr", "y", "0")
        
        cy.get("input[name='xcoordinput']").type("1850{enter}")    
        cy.get("input[name='ycoordinput']").type("1850{enter}")    
        cy.get("#figurecontainer>image").should("have.attr", "x", "1850")
        cy.get("#figurecontainer>image").should("have.attr", "y", "1850")
    });

    it("Should delete the image object when the x button is clicked", () => {
        // adds image object
        cy.addTestImage('galaxycolor.jpg')
        cy.get(".windowoptionsbar>.windowremovebtn").click()
        cy.get("#figurecontainer > image").should("have.length",0);
    });
});