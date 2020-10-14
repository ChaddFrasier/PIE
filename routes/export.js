"use strict"

const express = require('express');
const multer = require('multer');
const path  = require('path');
const sharp  = require('sharp');

const router = express.Router();

const EXPORT_FILE_PATH = path.join(__dirname,"..","public","exports");

// init storage object to tell multer what to do
var storage = multer.diskStorage(
    {
        // tell multer where the destination is
        destination: ( req, file, cb ) =>
        {
            cb( null, 'public/exports' )
        },
        // tell multer how to name the file
        filename: ( req, file, cb ) =>
        {
            cb( null, file.originalname)
        } 
    }
);

// set the upload object for multer
var upload = multer( { storage: storage } );

/** TODO: Remove the Async here soon */
router.post('/', upload.single('exportfile') , async (req, res, next) => {

    console.log(req.body)

    // get the path of the svg that was saved by multer
    let usersvg = path.join(EXPORT_FILE_PATH, req.file.originalname);

    // Gather all the information needed for the image manipulation
        
    // 1. What format(s) the user wanted for the output format(s)
    let formatArr = [req.body.png, req.body.tiff, req.body.svg];

    // 2. What was the new filename given by user
    let newname = req.body.exportfilename;
    
    // 3. What was the desired dimensions of the output set by figuresize input
    let figoutputsize = req.body.dims;

    // convert the image to the desired format(s)

    // TESTING convert svg image to png
    await sharp(usersvg)
        .png()
        .toFile( path.join(EXPORT_FILE_PATH, newname+".png") )
        .catch( err => {
            if(err) throw err
        })
        .then(info => {
            console.log(info)
        });
    
    // send the new file(s) back to the client with the new name that the user input

    // Send fail codes for 505(internal) or ()







})

module.exports = router;
