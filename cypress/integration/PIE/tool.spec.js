/** 
 * Main Testing File 
 * 
 * This file will be the main testing file that must be run before pushing any docker container or code to the main docker image
 * */

/// <reference types="cypress" />

context('Tools Tests', () => {
  // add an image and caption element before each testing set
  beforeEach(() => {
    cy.visit('http://localhost:8080/')
    cy.get("#addcaptionbtn").click()
    cy.get("#addimagebtn").click()
  })
  
  // https://on.cypress.io/interacting-with-elements

  /** Outline Tests */
  describe("Outline Box Tests -> ", () => {
    beforeEach(() => {
      cy.get(".windowminimizebtn").eq(1).click()
      cy.get("#outlinebtnopt").click()
      cy.get("#figurecontainer")
        .trigger("mousedown", {which:1, clientX: 500, clientY: 150})
        .trigger("mousemove", {clienX: 700, clientY: 300})
        .trigger("mouseup")
    });
    // test that drawing works
    it("Should draw an outline when the button is clicked and then drag and drop occurs.", () => {
      cy.get("rect.placed").should("exist")
    })
    // test that color change works
    it("Should be able to change the color of the rectangle outline.", () => {
      cy.get('input[name="rectcolorinput"]').invoke("val", "#00ffff").trigger("change")
      cy.get("rect.placed").should("have.attr","stroke", "#00ffff")
    })
    // test that the x and y position can update
    it("Should change the x position and y position.", () => {
      cy.get("input[name='rectxinput']").clear().type('200{enter}')
      cy.get("input[name='rectyinput']").clear().type('200{enter}')
      cy.get('rect.placed').should("have.attr", "x", 200).should("have.attr", "y", 200)
    });
    // test that the outline thickness works
    it("Should change the thickness of the outline.", () => {
      cy.get("input[name='rectthicknessinput']").clear().type('24{enter}')
      cy.get('rect.placed').should("have.attr", "stroke-width", 24)
    });
    // test that custome width height works for the images
    it("Should be able to add custom width and height.", () => {
      cy.get("input[name='rectwidthinput']").clear().type('202{enter}')
      cy.get("input[name='rectheightinput']").clear().type('500{enter}')
      cy.get('rect.placed').should("have.attr", "width", 202)
      cy.get('rect.placed').should("have.attr", "height", 500)
    });
    // test that the user can drag and drop the outline
    it("Should be able to drag the outline around around.", () => {
      var oldx = cy.get('rect.placed[fill="none"]').invoke("attr", "x")
      var oldy = cy.get('rect.placed[fill="none"]').invoke("attr", "y")
      cy.get("svg#figurecontainer")
      .trigger("mousedown", {target: cy.get('rect.placed'), force: true})
      .trigger("mousemove",{clientX: 400, clientY: 500, force: true})
      .trigger("mouseup", {force:true}).then( ()=> {
        cy.get('rect.placed').invoke("attr", "x").should("not.eq", oldx)
        cy.get('rect.placed').invoke("attr", "y").should("not.eq", oldy)
      });
    });
  });

  /** Line Tests */
  describe("Line Tests -> ", () => {
    beforeEach(() => {
      cy.get(".windowminimizebtn").eq(1).click()
      cy.get("#penciloptbtn").click()
      cy.get("#figurecontainer")
        .trigger("mousedown", {which:1, clientX: 500, clientY: 150})
        .trigger("mousemove", {clienX: 700, clientY: 300})
        .trigger("mouseup")
    });
    // Line should be on screen
    it("Should draw a line when the button is clicked and then drag and drop occurs.", () => {
      cy.get("line.placed").should("exist")
    })
    // line can change colors with no head or tail
    it("Should change colors of the line when there is no heads.", () => {
        cy.get("input[name='linecolorinput']").invoke("val", "#ff0000").trigger("change")
        cy.get("line.placed").should("have.attr", "stroke", "#ff0000")
    })
    // can add a head and tail
    it("Should add an arrow head and a circle to the head and tail respectivley", () => {
      cy.get('select[name="lineheadinput"]').select("Arrow Head")
      cy.get('select[name="linetailinput"]').select("Circle Head")
      cy.get("marker[data-cy='markerhead']").should("exist")
      cy.get("marker[data-cy='markertail']").should("exist")
    });
    // can change color of the markers after they have been added
    it("Should change colors of the line after add head and the colors should match.", () => {
      cy.get('select[name="lineheadinput"]').select("Arrow Head")
      cy.get('select[name="linetailinput"]').select("Square Head")
      cy.get("input[name='linecolorinput']").invoke("val", "#ff0000").trigger("change")
      cy.get("line.placed").should("have.attr", "stroke", "#ff0000")
      cy.get("marker").last().children().first().should("have.attr", "fill", "#ff0000")
      cy.get("marker").last().prev().children().first().should("have.attr", "fill", "#ff0000")
    });
    // can change add markers with any color
    it("Should change colors of the line and add head of same color.", () => {
      cy.get("input[name='linecolorinput']").invoke("val", "#ff0000").trigger("change")
      cy.get("line.placed").should("have.attr", "stroke", "#ff0000")
      cy.get('select[name="lineheadinput"]').select("Arrow Head")
      cy.get('select[name="linetailinput"]').select("Circle Head")
      cy.get("marker").last().children().first().should("have.attr", "fill", "#ff0000")
      cy.get("marker").last().prev().children().first().should("have.attr", "fill", "#ff0000")
    });
    // can change marker thickness and still have markers
    it("Should be able to add markers after changing thickness.", () => {
      cy.get('input[name="linethicknessinput"]').clear().type("20{enter}")
      cy.get('select[name="lineheadinput"]').select("Arrow Head")
      cy.get('select[name="linetailinput"]').select("Circle Head")
      cy.get("marker[data-cy='markerhead']").should("exist")
      cy.get("marker[data-cy='markertail']").should("exist")
    });
    // can have lines with markers that are different colors
    it("Should be able to add multiple lines with different colored markers.", () => {
      // first line
      cy.get('select[name="lineheadinput"]').first().select("Arrow Head")
      cy.get('select[name="linetailinput"]').first().select("Square Head")
      cy.get("input[name='linecolorinput']").first().invoke("val", "#ff0000").trigger("change")
      cy.get("line.placed").last().should("have.attr", "stroke", "#ff0000")
      cy.get("marker").last().children().first().should("have.attr", "fill", "#ff0000")
      cy.get("marker").last().prev().children().first().should("have.attr", "fill", "#ff0000")

      cy.get("#penciloptbtn").click()
      cy.get("#figurecontainer")
        .trigger("mousedown", {which:1, clientX: 700, clientY: 200})
        .trigger("mousemove", {clienX: 900, clientY: 1000})
        .trigger("mouseup")
      // second line
      cy.get('select[name="lineheadinput"]').first().select("Arrow Head")
      cy.get('select[name="linetailinput"]').first().select("Square Head")
      cy.get("input[name='linecolorinput']").first().invoke("val", "#00ff00").trigger("change")
      cy.get("line.placed").last().should("have.attr", "stroke", "#00ff00")
      cy.get("marker").eq(5).children().first().should("have.attr", "fill", "#00ff00")
      cy.get("marker").last().children().first().should("have.attr", "fill", "#00ff00")
    });
    // drag lines with the mouse
    it("Should be able to drag the line around.", () => {
      var oldx = cy.get('line.placed').last().invoke("attr", "x")
      var oldy = cy.get('line.placed').last().invoke("attr", "y")
      cy.get("svg#figurecontainer")
        .trigger("mousedown", {target: cy.get('line.placed').last()})
        .trigger("mousemove",{clientX: 1000, clientY: 400})
        .trigger("mouseup").then( ()=> {
          cy.get('line.placed').last().invoke("attr", "x").should("not.eq", oldx)
          cy.get('line.placed').last().invoke("attr", "y").should("not.eq", oldy)
          cy.get('.windowremovebtn').eq(1).click()
        });
    });
  });

  /** Main Tests */
  describe("Main Editor Tests -> ", () => {
    // test that the background color can change
    it("Background should change when the main background color input changes.", () => {
      cy.get("button.windowminimizebtn").first().click()
      cy.get("input[type='color']").first().invoke("val", '#ffeebb').trigger("change")
      cy.get('#bgelement').should("have.attr", "fill", "#ffeebb")
    });
    // test that the dimensions work
    it("Figure dimensions should change when the selected figure size changes.", () => {
      cy.get("button.windowminimizebtn").first().click()
      cy.get("select#figsizeselect").select("2500x2000")
      cy.get("svg#figurecontainer").should("have.attr", "viewBox", "0 0 2500 2000")
    });
    // test that the toolbox can be hidden.
    it("Should be able to minimize or close thetoolbox", () => {
      cy.get("button.toolboxminimizebtn").click()
      cy.get(".toolboxcontainer.closed").should("exist")
    });
    // test that the toolbox can be dragged and change the svg layers.
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

  /** Caption Tests */
  describe("Caption Tests -> ", () =>{ 
    // test that it starts on the home page
    it( "Should start on home page." ,() => {
      cy.url().should('eq', 'http://localhost:8080/')
    });
    // test that the caption object is on screen
    it( "Should add caption when add caption button is clicked." ,() => {
      cy.get("svg>text").should("exist")
    });
    // test that the input box will update the text in the caption
    it("Change the text should also change the text inside the caption", () => {
      cy.fixture("data").then(json => {
        cy.get("textarea[name='captiontextinput']")
        .type(json["LoremIpsum"])
        cy.get("text[data-cy='caption']>tspan>tspan").should("not.have.html", json["LoremIpsum"])
      });
      cy.get("textarea[name='captiontextinput']").clear().type("This is a short test")
      cy.get("text[data-cy='caption']>tspan>tspan").should("have.html", "This is a short test")
    });
    // be able to change the width nd height input
    it( "Should change caption width when caption input changes." ,() => {
      cy.get('input[name="widthinput"]').last().clear().type("540{enter}")
      cy.get('text[data-cy="caption"]').parent().should("have.attr", "width", "540")
      cy.get('input[name="heightinput"]').last().clear().type("250{enter}")
      cy.get('text[data-cy="caption"]').parent().should("have.attr", "height", "250")
    });
    // test that the x and y positions can chnage
    it( "Should change position coordinates x and y when caption input changes." ,() => {
      cy.get('button.windowminimizebtn').eq(2).click();
      cy.get('input[name="xcoordinput"]').last().clear().type("540{enter}");
      cy.get('text[data-cy="caption"]').parent().should("have.attr", "x", "540");
      cy.get('input[name="ycoordinput"]').last().clear().type("250{enter}");
      cy.get('text[data-cy="caption"]').parent().should("have.attr", "y", "250");
    });
    // test that removing the caption works
    it('Should remove the caption when the button is clicked.', () => {
      cy.get('button.windowremovebtn').eq(1).click()
      cy.get("svg>text").should("not.exist")
    });
    // input can handle error tests
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
    // test the caption color functionality
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

  /** Icon Tests */
  describe("Icon Tests ->", () => {
    // run before each icon test set
    beforeEach(() => {
      // upload the test cub image
      cy.get("input[type='file']").attachFile('M102200199CE.vis.even.band0004.geo.cub').then(() =>
      {
        // validate when upload finishes
        cy.get('image.holder').invoke("attr", "href").should("match", /^(data\:image\/jpeg;base64,).*/i)
      });

      // drag north icon into the image
      cy.get(".windowminimizebtn").eq(1).click()
      cy.get("#northarrowopt").trigger("mousedown", {which: 1}).then((btn) => {
        cy.document().trigger("mousmove", {pageX: 2000, pageY: 1000})
        cy.document().trigger("mouseup", {target: cy.get("image[GEO='true']")})
      });
    });

    it("Should scale the icon when input updates.", () => {
      // capture the old scale value
      var oldscale = cy.get('rect.marker').last().invoke("attr","scale")

      // enter the new value and test that the scale is different
      cy.get("input[name='iconscaleinput']").clear().type("10{enter}")
      cy.get('rect.marker').last().invoke("attr", "scale").should("not.eq", oldscale)

      // check that the scale equals the input
      cy.get('rect.marker').last().parent().invoke("attr", "scale").should("eq", '10')
    });

    it("Should change the main color of the icon when input updates.", () => {
      // capture the old icon group
      var oldGroup = cy.get("g.holder").children().first()

      // update the main color input
      cy.get("input[name='iconmaincolorinput']").invoke("val", "#ff0000").trigger("change")

      // check that the group changes
      cy.get("g.holder").children().first().should("not.eq", oldGroup)
    });

    // same as main color
    it("Should change the secondary color of the icon when input updates.", () => {
      var oldGroup = cy.get("g.holder").children().first()
      cy.get("input[name='iconsecondarycolorinput']").invoke("val", "#00fff0").trigger("change")
      cy.get("g.holder").children().first().should("not.eq", oldGroup)
    });

    it("Should have all the icons on the uploaded image.", () => {

      // add all the icons and test that all can be added
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

      // test all icons exist
      cy.get("image.holder").should("exist")
      cy.get("image.holder").next().invoke("attr", "id").should("match", /^northIcon-.*/i)
      cy.get("image.holder").next().next().invoke("attr", "id").should("match", /^sunIcon-.*/i)
      cy.get("image.holder").next().next().next().invoke("attr", "id").should("match", /^observerIcon-.*/i)
      cy.get("image.holder").next().next().next().next().invoke("attr", "id").should("match", /^scalebarIcon-.*/i)
    });

    it("Should be able to change the x and y input for the icons.", () => {
      // get old coordinates
      var oldx = cy.get('rect.marker').last().invoke("attr","x")
      var oldy = cy.get('rect.marker').last().invoke("attr","y")

      // change the input values
      cy.get("input[name='iconxcoordinput']").clear().type("200{enter}")
      cy.get("input[name='iconycoordinput']").clear().type("400{enter}")

      // x and y should be equal to the input and not equal to the old values
      cy.get('rect.marker').last().invoke("attr", "x").should("not.eq", oldx)
      cy.get('rect.marker').last().invoke("attr", "y").should("not.eq", oldy)
      cy.get('rect.marker').last().parent().invoke("attr", "x").should("eq", '200')
      cy.get('rect.marker').last().parent().invoke("attr", "y").should("eq", '400')
    });

    it("Should be able to drag each of the icons.", () => { 

      // same as above but testing the location changes using drag event
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

      // same as above but with sun icon
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

      // observer icon dragging
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

      // scalebar icon dragging
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

  /** Image Tests */
  describe("Image Tests ->", () => { 
    // check that the default information is at the start of the tests
    it( "Should add caption w/ default config when add caption button is clicked." ,() => {
      cy.get("image.holder").should("exist")
      cy.get("image.holder").should("have.attr", "href", "#")
      cy.get("input[type='file']").attachFile('testimg.jpg')
      cy.get("image.holder").should("not.have.attr", "href", "#")
    });

    // change image width and height
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

    // test that cub image is working
    it('Should display a cub image on upload', () => {
      cy.get("input[type='file']").attachFile('M102200199CE.vis.even.band0004.geo.cub').then(() =>
      {
        cy.get('image.holder').invoke("attr", "href").should("match", /^(data\:image\/jpeg;base64,)/i)
      });
    });

    // test that cub image fail safe is working
    it("Should fail and delete the image on failure.", () => {
      // test failure file
      cy.get("input[type='file']").attachFile('failuretest.cub').then(() =>
      {
        cy.get('image.holder').invoke("attr", "href").should("not.match", /^(data\:image\/jpeg;base64,)/i)
          .then(() => {
            cy.get('image.holder').should("not.exist")
          })
      });
    });

    // test that upload is working for png
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
});