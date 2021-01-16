/// <reference types="cypress" />

context("Image Object Tests -> ", () => {
  // add an image and caption element before each testing set
  beforeEach(() => {
    cy.visit('http://localhost:8080/')
    cy.get("#addcaptionbtn").click()
    cy.get("#addimagebtn").click()
  })
  
  /** Image Tests */
  describe("JPEG File Tests ->", () => {     
    // check that the default information is at the start of the tests
    it( "Should add caption w/ default config when add caption button is clicked." ,() => {
      cy.get("image.holder").should("exist")
      cy.get("image.holder").should("have.attr", "href", "#")
      cy.get("input[type='file']").attachFile('testimg.jpg')
      cy.get("image.holder").should("not.have.attr", "href", "#")
    });

    // change image width and height
    it( "Should change image dimensions and position when input changes." ,() => {
      // TODO: finish writting this test
      cy.get("input[type='file']").attachFile('testimg.jpg')
    });
  });

  describe("Cub File Tests ->", () => {
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
  });

  describe("PNG Files -> ", () => {
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
  });

  // TODO: upload a geotiff
  describe("Tiff File Tests ->", ()=> {
    it("Should be able to upload a GeoTiff File.", () => {
      // TODO: finish adding all these tests
    });
  });
});