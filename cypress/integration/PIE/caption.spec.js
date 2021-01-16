/// <reference types="cypress" />

context("Caption Tests ->", () => 
{
    // add an image and caption element before each testing set
    beforeEach(() => {
        cy.visit('http://localhost:8080/')
        cy.get("#addcaptionbtn").click()
        cy.get("#addimagebtn").click()
    })

    /** Caption Tests */
    describe("Caption Tests -> ", () =>
    { 
        // test that it starts on the home page
        it( "Should start on home page." ,() => 
        {
            cy.url().should('eq', 'http://localhost:8080/')
        });
        // test that the caption object is on screen
        it( "Should add caption when add caption button is clicked." ,() => 
        {
            cy.get("svg>text").should("exist")
        });
        // test that the input box will update the text in the caption
        it("Change the text should also change the text inside the caption", () => 
        {
            cy.fixture("data").then(json => 
            {
                cy.get("textarea[name='captiontextinput']").type(json["LoremIpsum"])
                cy.get("text[data-cy='caption']>tspan").should("not.have.html", json["LoremIpsum"])
            }).then(() => 
            {
                cy.get("textarea[name='captiontextinput']").clear().type("This is a short test")
                cy.get("text[data-cy='caption']>tspan").should("have.html", "This is a short test")
            });
        });
        // be able to change the width nd height input
        it( "Should change caption width when caption input changes." ,() => 
        {
            cy.get('input[name="widthinput"]').last().clear().type("540{enter}")
            cy.get('text[data-cy="caption"]').parent().should("have.attr", "width", "540")
            cy.get('input[name="heightinput"]').last().clear().type("250{enter}")
            cy.get('text[data-cy="caption"]').parent().should("have.attr", "height", "250")
        });
        // test that the x and y positions can chnage
        it( "Should change position coordinates x and y when caption input changes." ,() => 
        {
            cy.get('button.windowminimizebtn').eq(2).click();
            cy.get('input[name="xcoordinput"]').last().clear().type("540{enter}");
            cy.get('text[data-cy="caption"]').parent().should("have.attr", "x", "540");
            cy.get('input[name="ycoordinput"]').last().clear().type("250{enter}");
            cy.get('text[data-cy="caption"]').parent().should("have.attr", "y", "250");
        });
        // test that removing the caption works
        it('Should remove the caption when the button is clicked.', () => 
        {
            cy.get('button.windowremovebtn').eq(1).click()
            cy.get("svg>text").should("not.exist")
        });
        // input can handle error tests
        it('Should handle invalid input.', () => 
        {
            cy.get('button.windowminimizebtn').eq(2).click();
            cy.get('input[name="widthinput"]').last().clear().type("abcdlookatme{enter}")
            cy.get('text[data-cy="caption"]').parent().should("have.attr", "width", "500")
            cy.get('input[name="heightinput"]').last().clear().type("thisshouldgotominimum{enter}")
            cy.get('text[data-cy="caption"]').parent().should("have.attr", "height", "100")

            cy.get('input[name="xcoordinput"]').last().clear().type("abcdlookatme{enter}")
            cy.get('text[data-cy="caption"]').parent().should("have.attr", "x", "0")
            cy.get('input[name="ycoordinput"]').last().clear().type("thisshouldgotominimum{enter}")
            cy.get('text[data-cy="caption"]').parent().should("have.attr", "y", "0")
        });
        // test the caption color functionality
        it("Should be able to change color of the background and text.", () => 
        {
            cy.get('button.windowminimizebtn').eq(2).click();
            // change background
            cy.get("input[type='color']").eq(2)
                .invoke('val', '#ff0000')
                .trigger('change');
            cy.get("svg>text").prev().should("have.attr", "fill", "#ff0000")
            // change text
            cy.get("input[type='color']").eq(1)
                .invoke('val', '#ffffff')
                .trigger('change');
            cy.get("svg>text").parent().should("have.attr", "fill", "#ffffff")
        });
    });
});