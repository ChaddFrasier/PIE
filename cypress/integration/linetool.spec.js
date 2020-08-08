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

    it("Test that line x and y for head and tail both work", ()=> {        
        cy.get("input[type='number']").eq(1)
        .clear()
            .type("1000{enter}")
            .trigger("change")

        cy.get("line").should("have.attr", "x1", 1000)

        cy.get("input[type='number']").eq(2)
        .clear()
            .type("250{enter}")
            .trigger("change")

        cy.get("line").should("have.attr", "y1", 250)

        cy.get("input[type='number']").eq(3)
        .clear()
            .type("100{enter}")
            .trigger("change")

        cy.get("line").should("have.attr", "x2", 100)

        cy.get("input[type='number']").eq(4)
        .clear()
            .type("400{enter}")
            .trigger("change")

        cy.get("line").should("have.attr", "y2", 400)
    })

    it("Test that the removing the line element remove function is working", ()=> {        
        cy.get("input[type='number']").eq(1)
        .clear()
            .type("1000{enter}")
            .trigger("change")


        cy.get(".windowremovebtn").first()
            .click()

        cy.get("line").should("not.exist")
        cy.get(".linetoolsbox").should("not.exist")
    })
})
