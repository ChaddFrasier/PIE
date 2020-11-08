/// <reference types="cypress" />

context('Tools Tests', () => {
    beforeEach(() => {
      cy.visit('http://localhost:8080/')
      cy.get("#addcaptionbtn").click()
      cy.get("#addimagebtn").click()
    })
  
    // https://on.cypress.io/interacting-with-elements


    describe("Line Tests -> ", () => {
      beforeEach(() => {
        cy.get(".windowminimizebtn").eq(1).click()
        cy.get("#penciloptbtn").click()
        cy.get("#figurecontainer")
          .trigger("mousedown", {which:1, clientX: 500, clientY: 150})
          .trigger("mousemove", {clienX: 700, clientY: 300})
          .trigger("mouseup")
      });

      it("Should draw a line when the button is clicked and then drag and drop occurs.", () => {
        cy.get("line.placed").should("exist")
      })

      it("Should change colors of the line when there is no heads.", () => {
          cy.get("input[name='linecolorinput']").invoke("val", "#ff0000").trigger("change")
          cy.get("line.placed").should("have.attr", "stroke", "#ff0000")
      })

      it("Should add an arrow head and a circle to the head and tail repectivley", () => {
        cy.get('select[name="lineheadinput"]').select("Arrow Head")
        cy.get('select[name="linetailinput"]').select("Circle Head")

        cy.get("marker[data-cy='markerhead']").should("exist")
        cy.get("marker[data-cy='markertail']").should("exist")
      });

      it("Should change colors of the line after add head and the colors should match.", () => {
        cy.get('select[name="lineheadinput"]').select("Arrow Head")


        cy.get("input[name='linecolorinput']").invoke("val", "#ff0000").trigger("change")
        cy.get("line.placed").should("have.attr", "stroke", "#ff0000")
      })

      it("Should change colors of the line and add head of same color.", () => {
        cy.get("input[name='linecolorinput']").invoke("val", "#ff0000").trigger("change")
        cy.get("line.placed").should("have.attr", "stroke", "#ff0000")
      })
    });

    describe("Outline Box Tests -> ", () => {
      beforeEach(() => {
        cy.get(".windowminimizebtn").eq(1).click()
        cy.get("#outlinebtnopt").click()
        cy.get("#figurecontainer")
          .trigger("mousedown", {which:1, clientX: 500, clientY: 150})
          .trigger("mousemove", {clienX: 700, clientY: 300})
          .trigger("mouseup")
      });

      it("Should draw an outline when the button is clicked and then drag and drop occurs.", () => {
        cy.get("rect.placed").should("exist")
      })

      it("Should be able to change the color of the rectangle outline.", () => {
        cy.get('input[name="rectcolorinput"]').invoke("val", "#00ffff").trigger("change")
        cy.get("rect.placed").should("have.attr","stroke", "#00ffff")
      })

      it("Should change the x position and y position.", () => {
        cy.get("input[name='rectxinput']").clear().type('200{enter}')
        cy.get("input[name='rectyinput']").clear().type('200{enter}')
        cy.get('rect.placed').should("have.attr", "x", 200).should("have.attr", "y", 200)
      });

      it("Should change the thickness of the outline.", () => {
        cy.get("input[name='rectthicknessinput']").clear().type('24{enter}')
        cy.get('rect.placed').should("have.attr", "stroke-width", 24)
      });
    });

    describe("Main Editor Tests -> ", () => {
      it("Background should change when the main background color input changes.", () => {
        cy.get("button.windowminimizebtn").first().click()

        cy.get("input[type='color']").first().invoke("val", '#ffeebb').trigger("change")
        cy.get('#bgelement').should("have.attr", "fill", "#ffeebb")
      });

      it("Figure dimensions should change when the selected figure size changes.", () => {
        cy.get("button.windowminimizebtn").first().click()

        cy.get("select#figsizeselect").select("2500x2000")

        cy.get("svg#figurecontainer").should("have.attr", "viewBox", "0 0 2500 2000")
      });

      it("Figure dimensions should change when the selected figure size changes.", () => {
        cy.get("button.toolboxminimizebtn").click()

        cy.get(".toolboxcontainer.closed").should("exist")
      });
    });
  
    describe("Caption Tests -> ", () =>{ 
      it( "Should start on home page." ,() => {
        cy.url().should('eq', 'http://localhost:8080/')
      });

      it( "Should add caption when add caption button is clicked." ,() => {
        cy.get("svg>text").should("exist")
      });

      it("Change the text should also change the text inside the caption", () => {

        cy.fixture("data").then(json => {
          cy.get("textarea[name='captiontextinput']")
          .type(json["LoremIpsum"])
          cy.get("text[data-cy='caption']>tspan>tspan").should("not.have.html", json["LoremIpsum"])
        });

        cy.get("textarea[name='captiontextinput']").clear()
        .type("This is a short test")
        cy.get("text[data-cy='caption']>tspan>tspan").should("have.html", "This is a short test")
        
      });

      it( "Should change caption width when caption input changes." ,() => {
        cy.get('input[name="widthinput"]').last().clear().type("540{enter}")
        cy.get('text[data-cy="caption"]').parent().should("have.attr", "width", "540")
        cy.get('input[name="heightinput"]').last().clear().type("250{enter}")
        cy.get('text[data-cy="caption"]').parent().should("have.attr", "height", "250")
      });

      it( "Should change position coordinates x and y when caption input changes." ,() => {
        cy.get('button.windowminimizebtn').eq(2).click();
        cy.get('input[name="xcoordinput"]').last().clear().type("540{enter}");
        cy.get('text[data-cy="caption"]').parent().should("have.attr", "x", "540");
        cy.get('input[name="ycoordinput"]').last().clear().type("250{enter}");
        cy.get('text[data-cy="caption"]').parent().should("have.attr", "y", "250");
      });

      it('Should remove the caption when the button is clicked.', () => {
        cy.get('button.windowremovebtn').eq(1).click()
        cy.get("svg>text").should("not.exist")
      });


      // Start error tests
      it('Should handle invalid input.', () => {
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

      it("Should be able to change color of the background and text.", () => {
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

    describe("Image Tests -> ", () =>{ 
        it( "Should add caption w/ default config when add caption button is clicked." ,() => {
          cy.get("image.holder").should("exist")
          cy.get("image.holder").should("have.attr", "href", "#")
        });

        it( "Should change image dimensions and position when input changes." ,() => {
          cy.get('input[name="widthinput"]').first().clear().type("750{enter}")
          cy.get('image.holder').should("have.attr", "width", "750")
          cy.get('input[name="heightinput"]').first().clear().type("1000{enter}")
          cy.get('image.holder').should("have.attr", "height", "1000")

          cy.get('input[name="xcoordinput"]').first().clear().type("200{enter}")
          cy.get('image.holder').should("have.attr", "x", "200")
          cy.get('input[name="ycoordinput"]').first().clear().type("1500{enter}")
          cy.get('image.holder').should("have.attr", "y", "1500")
        });
      });
});