/// <reference types="cypress" />

context('Tools Tests', () => {
    beforeEach(() => {
      cy.visit('http://localhost:8080/')
      cy.get("#addcaptionbtn").click()
      cy.get("#addimagebtn").click()
    })
  
    // https://on.cypress.io/interacting-with-elements

    describe("Icon Tests ->", () => {

      beforeEach(() => {
        cy.get("input[type='file']").attachFile('M102200199CE.vis.even.band0004.geo.cub').then(() =>
        {
          cy.get('image.holder').invoke("attr", "href").should("match", /^(data\:image\/jpeg;base64,)/i)
        });

        // drag icons into the image
        cy.get(".windowminimizebtn").eq(1).click()
        cy.get("#northarrowopt").trigger("mousedown", {which: 1}).then((btn) => {
          cy.document().trigger("mousmove", {pageX: 2000, pageY: 1000})
          cy.document().trigger("mouseup", {target: cy.get("image[GEO='true']")})
        });
      });

      it("Should scale the icon when input updates.", () => {
        var oldscale = cy.get('rect.marker').last().invoke("attr","scale")

        cy.get("input[name='iconscaleinput']").clear().type("10{enter}")
        cy.get('rect.marker').last().invoke("attr", "scale").should("not.eq", oldscale)

        cy.get('rect.marker').last().parent().invoke("attr", "scale").should("eq", '10')
      });

      it("Should have all the icons on the uploaded image.", () => {

        cy.get("#sunarrowopt").trigger("mousedown", {which: 1}).then((btn) => {
          cy.document().trigger("mousmove", {pageX: 2000, pageY: 2000})
          cy.document().trigger("mouseup", {target: cy.get("image[GEO='true']"), force:true})
        });

        cy.get("#observerarrowopt").trigger("mousedown", {which: 1}).then((btn) => {
          cy.document().trigger("mousmove", {pageX: 2000, pageY: 1500})
          cy.document().trigger("mouseup", {target: cy.get("image[GEO='true']"), force:true})
        });

        cy.get("#scalebarbtnopt").trigger("mousedown", {which: 1}).then((btn) => {
          cy.document().trigger("mousmove", {pageX: 2000, pageY: 2500})
          cy.document().trigger("mouseup", {target: cy.get("image[GEO='true']"), force:true})
        });

        cy.get("image.holder").should("exist")
        cy.get("image.holder").next().invoke("attr", "id").should("match", /^northIcon-.*/i)
        cy.get("image.holder").next().next().invoke("attr", "id").should("match", /^sunIcon-.*/i)
        cy.get("image.holder").next().next().next().invoke("attr", "id").should("match", /^observerIcon-.*/i)
        cy.get("image.holder").next().next().next().next().invoke("attr", "id").should("match", /^scalebarIcon-.*/i)
      });

      it("Should be able to change the x and y input for the icons.", () => {
        var oldx = cy.get('rect.marker').last().invoke("attr","x")
        var oldy = cy.get('rect.marker').last().invoke("attr","y")

        cy.get("input[name='iconxcoordinput']").clear().type("200{enter}")
        cy.get("input[name='iconycoordinput']").clear().type("400{enter}")

        cy.get('rect.marker').last().invoke("attr", "x").should("not.eq", oldx)
        cy.get('rect.marker').last().invoke("attr", "y").should("not.eq", oldy)

        cy.get('rect.marker').last().parent().invoke("attr", "x").should("eq", '200')
        cy.get('rect.marker').last().parent().invoke("attr", "y").should("eq", '400')
      });

      it("Should be able to drag each of the icons.", () => { 
        var oldx = cy.get('rect.marker').last().invoke("attr","x")
        var oldy = cy.get('rect.marker').last().invoke("attr","y")

        cy.get("image.holder").last().then( () => {
          cy.get("svg#figurecontainer")
          .trigger("mousedown", {target: cy.get('rect.marker').last()})
          .trigger("mousemove",{clientX: 1000, clientY: 400})
          .trigger("mouseup").then( ()=> {
            cy.get('rect.marker').last().invoke("attr", "x").should("not.eq", oldx)
            cy.get('rect.marker').last().invoke("attr", "y").should("not.eq", oldy)

            cy.get('.windowremovebtn').eq(1).click()
          });
        });

        cy.get("#sunarrowopt").trigger("mousedown", {which: 1}).then((btn) => {
          cy.document().trigger("mousmove", {pageX: 2000, pageY: 2000})
          cy.document().trigger("mouseup", {target: cy.get("image[GEO='true']"), force:true})
        });

        oldx = cy.get('rect.marker').last().invoke("attr","x")
        oldy = cy.get('rect.marker').last().invoke("attr","y")

        cy.get("image.holder").last().then( () => {
          cy.get("svg#figurecontainer")
          .trigger("mousedown", {target: cy.get('rect.marker').last()})
          .trigger("mousemove",{clientX: 1000, clientY: 400})
          .trigger("mouseup").then( ()=> {
            cy.get('rect.marker').last().invoke("attr", "x").should("not.eq", oldx)
            cy.get('rect.marker').last().invoke("attr", "y").should("not.eq", oldy)

            cy.get('.windowremovebtn').eq(1).click()
          });
        });

        cy.get("#observerarrowopt").trigger("mousedown", {which: 1}).then((btn) => {
          cy.document().trigger("mousmove", {pageX: 2000, pageY: 1500})
          cy.document().trigger("mouseup", {target: cy.get("image[GEO='true']"), force:true})
        });

        oldx = cy.get('rect.marker').last().invoke("attr","x")
        oldy = cy.get('rect.marker').last().invoke("attr","y")

        cy.get("image.holder").last().then( () => {
          cy.get("svg#figurecontainer")
          .trigger("mousedown", {target: cy.get('rect.marker').last()})
          .trigger("mousemove",{clientX: 1000, clientY: 400})
          .trigger("mouseup").then( ()=> {
            cy.get('rect.marker').last().invoke("attr", "x").should("not.eq", oldx)
            cy.get('rect.marker').last().invoke("attr", "y").should("not.eq", oldy)

            cy.get('.windowremovebtn').eq(1).click()
          });
        });

        cy.get("#scalebarbtnopt").trigger("mousedown", {which: 1}).then((btn) => {
          cy.document().trigger("mousmove", {pageX: 2000, pageY: 2500})
          cy.document().trigger("mouseup", {target: cy.get("image[GEO='true']"), force:true})
        });

        oldx = cy.get('rect.marker').last().invoke("attr","x")
        oldy = cy.get('rect.marker').last().invoke("attr","y")

        cy.get("image.holder").last().then( () => {
          cy.get("svg#figurecontainer")
          .trigger("mousedown", {target: cy.get('rect.marker').last()})
          .trigger("mousemove",{clientX: 1000, clientY: 400})
          .trigger("mouseup").then( ()=> {
            cy.get('rect.marker').last().invoke("attr", "x").should("not.eq", oldx)
            cy.get('rect.marker').last().invoke("attr", "y").should("not.eq", oldy)

            cy.get('.windowremovebtn').eq(1).click()
          });
        });
      });
    });

    describe("Image Tests ->", () =>{ 
      it( "Should add caption w/ default config when add caption button is clicked." ,() => {
        cy.get("image.holder").should("exist")
        cy.get("image.holder").should("have.attr", "href", "#")
        cy.get("input[type='file']").attachFile('testimg.jpg')
        cy.get("image.holder").should("not.have.attr", "href", "#")
      });

      it( "Should change image dimensions and position when input changes." ,() => {
        cy.get("input[type='file']").attachFile('testimg.jpg')

        cy.get('input[name="widthinput"]').first().clear().type("750{enter}")
        cy.get('image.holder').should("have.attr", "width", "750")
        cy.get('input[name="heightinput"]').first().clear().type("1000{enter}")
        cy.get('image.holder').should("have.attr", "height", "1000")

        cy.get('input[name="xcoordinput"]').first().clear().type("200{enter}")
        cy.get('image.holder').should("have.attr", "x", "200")
        cy.get('input[name="ycoordinput"]').first().clear().type("1500{enter}")
        cy.get('image.holder').should("have.attr", "y", "1500")
      });

      it('Should display a cub image on upload', () => {
        cy.get("input[type='file']").attachFile('M102200199CE.vis.even.band0004.geo.cub').then(() =>
        {
          cy.get('image.holder').invoke("attr", "href").should("match", /^(data\:image\/jpeg;base64,)/i)
        });
      });

      it("Should fail and delete the image on failure.", () => {
        // test failure
        cy.get("input[type='file']").attachFile('failuretest.cub').then(() =>
        {
          cy.get('image.holder').invoke("attr", "href").should("not.match", /^(data\:image\/jpeg;base64,)/i)
            .then(() => {
              cy.get('image.holder').should("not.exist")
            })
        });
      });

      it("Should be able to upload a png.", () => {
        cy.get("input[type='file']").attachFile('testpng.png').then(() =>
        {
          cy.get('image.holder').invoke("attr", "href").should("match", /^(data\:image\/png;base64,)/i)
            .then(() => {
              cy.get('image.holder').should("exist")
            })
        });
      });

      // TODO: upload a geotiff
    });

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

      it("Should bea able to add custom width and height.", () => {
        cy.get("input[name='rectwidthinput']").clear().type('202{enter}')
        cy.get("input[name='rectheightinput']").clear().type('500{enter}')
        cy.get('rect.placed').should("have.attr", "width", 202)
        cy.get('rect.placed').should("have.attr", "height", 500)
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

      it("Should be able to drag toolboxes to shift the svg layers.", () => {
        const startTopObject = {
          toolbox: cy.get('.draggableToolbox').first(),
          svg: cy.get('#figurecontainer').children().last()
        };
        cy.get("button.windowminimizebtn").eq(2).click()
        cy.get("button.windoworderingbtn").first()
          .trigger("mousedown")
          .then(() => {
            cy.document().trigger("mousemove", {pageY:1300, pageX:293})
            cy.get("#toolbox").trigger("mousemove", {pageY:1300, pageX:293})
          })
          
          cy.get('#figurecontainer').children().last().should('not.eq', startTopObject.svg)
          cy.get('.draggableToolbox').first().should('not.eq', startTopObject.toolbox)
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
});