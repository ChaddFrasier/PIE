// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

// middleware for testing file uploads
import 'cypress-file-upload'

/**
 * Function: addTestImage
 * Args: imagepath
 * Desc: This function adds 1 image to the svg using the addimagebtn for cypress and renders the image at the link
 */
Cypress.Commands.add("addTestImage", (imagepath) => {
    cy.get("#addimagebtn").click()

    cy.fixture(imagepath).then(fileContent => {
        // convert the image data into a blob
        return Cypress.Blob.base64StringToBlob(fileContent, "image/jpeg")
    })
    .then(dataUrl => {
        // then atach the blob data to the input field
        cy.get('input[type="file"]').attachFile({
            fileContent: dataUrl,
            fileName: imagepath,
            mimeType: 'image/jpeg'
        });
    });
});