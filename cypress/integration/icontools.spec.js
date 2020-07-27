describe("Icon Tests > ", () => {

    beforeEach(()=> {
        cy.visit('/');

        cy.get("#addimagebtn").click();
        cy.get("#editminibtn").click();
    });


    it("Icon is added to SVG when dragged and dropped on an image", ()=>{
        
        cy.get("#northarrowopt").trigger("mousedown");
        cy.get("svg>image").last().trigger("mouseup");

        cy.get('svg#figureContainer>g').should("have.length", 1)
    });

    it("Icon is not added when there is no image to select", ()=>{
        
        cy.get(".windowremovebtn").click();
        cy.get("#northarrowopt").trigger("mousedown");
        cy.get("svg#figureContainer").trigger("mouseup");

        cy.get('svg#figureContainer>g').should("not.exist")
    });
});