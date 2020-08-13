describe("Icon Tests > ", () => {
    // add the image and open the edit frame
    beforeEach(()=> {
        cy.visit('/');

        cy.get("#addimagebtn").click();
    });

    it("Icon is added to SVG when dragged and dropped on an image", ()=>{
        // mousedown and hold
        cy.get("#northarrowopt").trigger("mousedown");
        
        // release the mouse over the image location doesnt matter
        cy.get("#figurecontainer>image").last().trigger("mouseup");

        // test that the icon grounp is there
        cy.get('svg#figureContainer>g').should("have.length", 1)
    });

    it("Icon is not added when there is no image to select", ()=>{
        // remove the image
        cy.get(".windowremovebtn").click();
        
        // try to add the icon
        cy.get("#northarrowopt").trigger("mousedown");
        cy.get("svg#figureContainer").trigger("mouseup");

        // should not exist
        cy.get('svg#figureContainer>g').should("not.exist")
    });

    it("Test if all three icons can be added", ()=>{
        // add the icon
        cy.get("#northarrowopt").trigger("mousedown");
        cy.get("svg>image").last().trigger("mouseup", {clientX:1000, clientY: 300});
      
        // add the sun icon
        cy.get("#sunarrowopt").trigger("mousedown");
        cy.get("svg>image").last().trigger("mouseup", {clientX:1000, clientY: 400});
        
        // test that there is two icons
        cy.get('svg#figureContainer>g').should("have.length", 2);

        // add another icon
        cy.get("#observerarrowopt").trigger("mousedown");
        cy.get("svg>image").last().trigger("mouseup");

        // test for all 3 icons
        cy.get('svg#figureContainer>g').should("have.length", 3);
    });

    it("Test if north icon color changes when change color runs in the tool box", ()=>{
        
        // make color variable
        let testcolor = "#1d84b5";
        
        // add the icon 
        cy.get("#northarrowopt").trigger("mousedown");
        cy.get("#figurecontainer").trigger("mouseup");
        
        // change the value of the color input
        cy.get(".icontoolbox>input[type='color']").first()
            .invoke("val", testcolor)
            .trigger("change")

        // test that the fill of the path is the test var
        cy.get('svg#figureContainer>g>path').first().should("have.attr", "stroke", testcolor);

        // change secondary color
        cy.get(".icontoolbox>input[type='color']").last()
            .invoke("val", testcolor)
            .trigger("change")
        
        // test secondary color
        cy.get('svg#figureContainer>g>path').first().should("have.attr", "fill", testcolor);

    });

    it("Test that the sun icon colors change accordingly", ()=>{
        // set test var
        let testcolor = "#1d84b5";
        
        // add icon
        cy.get("#sunarrowopt").trigger("mousedown");
        cy.get("svg>image").last().trigger("mouseup");
        cy.get('svg#figureContainer>g').should("have.length", 1);

        // change color
        cy.get(".icontoolbox>input[type='color']").first()
            .invoke("val", testcolor)
            .trigger("change")

        // test color primary
        cy.get('svg#figureContainer>g>ellipse').first().should("have.attr", "stroke", testcolor);

        // secondary color
        cy.get(".icontoolbox>input[type='color']").last()
            .invoke("val", testcolor)
            .trigger("change")
        
        // test secondary color
        cy.get('svg#figureContainer>g>ellipse').first().should("have.attr", "stroke", testcolor);
    });

    
    it("Test that the observer icon colors change accordingly", ()=>{
        // test var
        let testcolor = "#1d84b5";
        
        // add icon
        cy.get("#observerarrowopt").trigger("mousedown");
        cy.get("svg>image").last().trigger("mouseup");
        cy.get('svg#figureContainer>g').should("have.length", 1);

        // change primary color
        cy.get(".icontoolbox>input[type='color']").first()
            .invoke("val", testcolor)
            .trigger("change")

        // test primary color
        cy.get('svg#figureContainer>g>ellipse').first().should("have.attr", "stroke", testcolor);

        // change secondary color
        cy.get(".icontoolbox>input[type='color']").last()
            .invoke("val", testcolor)
            .trigger("change")
        
        // test change color
        cy.get('svg#figureContainer>g>ellipse').first().should("have.attr", "fill", testcolor);
    });

    it("Test that the observer icon translates when changes occur", ()=>{
        
        // add icon
        cy.get("#observerarrowopt").trigger("mousedown");
        cy.get("svg>image").last().trigger("mouseup");
        cy.get('svg#figureContainer>g').should("have.length", 1);

        // test location x
        cy.get(".icontoolbox>input[type='number']")
            .eq(1).clear()
            .type('1100{enter}')

        // find the group and check the inner style, throw an error to stop
        cy.get('svg#figureContainer>g').then( icongroup => {
            console.log(String("translate("+ (1100/5)))
            if( icongroup.attr("style").indexOf(String("translate("+ (1100/5))) <= -1 )
            {
                throw new Error("Should contain a translate of x/scale")
            }
        });
    });

    
    it("Test that the observer icon scale changed the translate", ()=>{
        // set blank var
        let oldTransform;
        
        // add icon
        cy.get("#observerarrowopt").trigger("mousedown");
        cy.get("svg>image").last().trigger("mouseup");

        // save old transform
        cy.get('svg#figureContainer>g').then( icongroup => {
            oldTransform = icongroup.css("transform")
        });

        // change scale
        cy.get(".icontoolbox>input[type='number']")
            .first().clear()
            .type('0.25{enter}')

        // test that the translate changes when the scale changes
        cy.get('svg#figureContainer>g').then( icongroup => {
            if( icongroup.css("transform").indexOf(oldTransform) > -1 )
            {
                throw new Error("Should change the translate when scale changes")
            }
        });
    })
});