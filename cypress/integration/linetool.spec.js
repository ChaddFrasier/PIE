describe("Line Tests > ", () => {

    beforeEach(()=> {
        cy.visit('/');

        cy.get("#editminibtn").click();

        cy.get("#penciloptbtn").click();

        cy.get("#figurecontainer").trigger("mousedown", {clientX:415, clientY: 209})
        .trigger("mousemove", {clientX: 638, clientY: 452})
        .trigger("mouseup", {clientX: 704, clientY: 507})
    

    })

    it("Test that the color input changes color of line and marker", ()=> {

        let testcolor = "#1d84b5";
        
        cy.get("input[type='color']").last()
            .invoke("val", testcolor)
            .trigger("change")

        cy.get("line").should("have.attr", "stroke", testcolor)

        // add arrow end
        cy.get("select").last().select("arrow")

        cy.get("line").then(line => {
           if ( line.css("marker-end").indexOf(line.attr("id")) > -1)
           {
               cy.get("#"+line.attr("id")+"-marker > path").should("have.attr", "fill", testcolor)
           }
        })
    })
})
