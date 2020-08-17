describe("Line Tests > ", () => {


    beforeEach(()=> {
        cy.visit('/');

        // Click pencil and draw  a line
        cy.get("#penciloptbtn").click();

        cy.get("#figurecontainer").trigger("mousedown", {clientX:415, clientY: 209})
        .trigger("mousemove", {clientX: 638, clientY: 452})
        .trigger("mouseup", {clientX: 704, clientY: 507})
    })

    it("Test that the color input changes color of line and marker", ()=> {
        // set test color
        let testcolor = "#1d84b5";
        
        // change the color of the line
        cy.get("input[type='color']").last()
            .invoke("val", testcolor)
            .trigger("change")

        // test that the color works
        cy.get("line").should("have.attr", "stroke", testcolor)

        // add arrow end
        cy.get("select").last().select("arrow")

        // test that the marker end is the right color
        cy.get("line").then(line => {
           if ( line.css("marker-end").indexOf(line.attr("id")) > -1)
           {
               cy.get("#"+line.attr("id")+"-marker > path").should("have.attr", "fill", testcolor)
           }
        })
    })

    it("Test that line x and y for head and tail both work", ()=> {

        // set the number of x1
        cy.get("input[type='number']").eq(1)
        .clear()
            .type("1000{enter}")
            .trigger("change")

        // test that the x1 attr is right
        cy.get("line").should("have.attr", "x1", 1000)

        // set the number of y1
        cy.get("input[type='number']").eq(2)
        .clear()
            .type("250{enter}")
            .trigger("change")

        // test that y1 value is correct
        cy.get("line").should("have.attr", "y1", 250)

        // set the number of x2
        cy.get("input[type='number']").eq(3)
        .clear()
            .type("100{enter}")
            .trigger("change")

        // test that x2 is right
        cy.get("line").should("have.attr", "x2", 100)

        // set the number of y2
        cy.get("input[type='number']").eq(4)
        .clear()
            .type("400{enter}")
            .trigger("change")

        // test that y2 matches
        cy.get("line").should("have.attr", "y2", 400)
    })

    it("Test that line marker end and start both work", ()=> {
        // add arrow end
        cy.get("select").last().select("arrow")

        // add arrow start
        cy.get("select").eq(1).select("arrow")

        // test that the marker end is the right color
        cy.get("line").then(line => {
           if ( line.css("marker-end").indexOf(line.attr("id")) > -1)
           {
               cy.get("#"+line.attr("id")+"-marker > path").should("exist")
           }
        })

        // test that the marker end is the right color
        cy.get("line").then(line => {
           if ( line.css("marker-start").indexOf(line.attr("id")) > -1)
           {
               cy.get("#"+line.attr("id")+"-markerEnd > path").should("exist")
           }
        })
    })

    it("Test the line markers are removed when the line is removed", ()=> {
        // set test color
        let testcolor = "#1d84b5";
        
        // change the color of the line
        cy.get("input[type='color']").last()
            .invoke("val", testcolor)
            .trigger("change")

        // add arrow end
        cy.get("select").last().select("arrow")

        // add arrow start
        cy.get("select").eq(1).select("circle")

        // test that the marker end is the right color
        cy.get("line").then(line => {
            if ( line.css("marker-end").indexOf(line.attr("id")) > -1)
            {
                cy.get("#"+line.attr("id")+"-marker > circle").should("exist")
            }
         })
 
         // test that the marker end is the right color
         cy.get("line").then(line => {
            if ( line.css("marker-start").indexOf(line.attr("id")) > -1)
            {
                cy.get("#"+line.attr("id")+"-markerEnd > path").should("exist")
            }
         })

        // remove the element
        cy.get(".windowremovebtn").first()
            .click()

        // test that the marker end is not there
        cy.get("marker").should("have.length", 3)
        
    })

    it("Test that the removing the line element remove function is working", ()=> {
        
        // action to test that toolbox exists
        cy.get(".linetoolsbox").should("exist")
        cy.get("line").should("exist")


        // test that the window remove works     
        cy.get(".windowremovebtn").first()
            .click()
        cy.get("line").should("not.exist")
        cy.get(".linetoolsbox").should("not.exist")
    })
})
