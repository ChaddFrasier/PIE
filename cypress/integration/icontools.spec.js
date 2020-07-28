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

    it("Test if all three icons can be added", ()=>{
        
        cy.get("#northarrowopt").trigger("mousedown");
        cy.get("svg>image").last().trigger("mouseup", {clientX:1000, clientY: 300});
        cy.get('svg#figureContainer>g').should("have.length", 1);
        
        cy.get("#sunarrowopt").trigger("mousedown");
        cy.get("svg>image").last().trigger("mouseup", {clientX:1000, clientY: 400});
        cy.get('svg#figureContainer>g').should("have.length", 2);

        cy.get("#observerarrowopt").trigger("mousedown");
        cy.get("svg>image").last().trigger("mouseup");

        cy.get('svg#figureContainer>g').should("have.length", 3);
    });

    it("Test if icon color changes when change color runs in the tool box of each icon", ()=>{
        
        let testcolor = "#1d84b5";
        cy.get("#northarrowopt").trigger("mousedown");
        cy.get("svg>image").last().trigger("mouseup");
        cy.get('svg#figureContainer>g').should("have.length", 1);

        cy.get(".icontoolbox>input[type='color']").first()
            .invoke("val", testcolor)
            .trigger("change")

        cy.get('svg#figureContainer>g>text').should("have.attr", "fill", testcolor);

        cy.get(".icontoolbox>input[type='color']").last()
            .invoke("val", testcolor)
            .trigger("change")
        
        cy.get('svg#figureContainer>g>text').should("have.attr", "stroke", testcolor);

    });

});