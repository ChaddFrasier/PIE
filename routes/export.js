"use strict"

const express = require('express');
const multer = require('multer');
const path  = require('path');
const fs = require('fs');
const sharp  = require('sharp');

const router = express.Router();

const EXPORT_FILE_PATH = path.join( __dirname, "..", "public", "exports" );

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

    // Gather all the information needed for the image manipulation
        
    // 1. What format(s) the user wanted for the output format(s)
    let formatArr = [req.body.png, req.body.jpeg, req.body.tiff, req.body.svg];
    let nameArr = ["png", "jpeg", "tiff", "svg"];

    var returnObject = {};

    // 2. What was the new filename given by user
    let newname = req.body.exportfilename;
    
    // 3. What was the desired dimensions of the output set by figuresize input
    let figoutputsize = req.body.dims;

    // convert the image to the desired format(s)

    // TESTING convert svg image to png

    for (let i = 0; i < formatArr.length; i++) {
        let use = formatArr[i];

        if( use == 'true' )
        {
            switch( nameArr[i] )
            {
                case "png":
                    await sharp( path.join(EXPORT_FILE_PATH, req.file.originalname) )
                    .png()
                    .toFile( path.join(EXPORT_FILE_PATH, newname+".png") )
                    .catch( err => {
                        console.log("ERROR HAPPNEED IN SHARP")
                        if(err) throw err
                    })
                    .then(info => {
                        console.log(info)
                        returnObject["png"] = newname+".png"
                    });
                    break;
                
                case "jpeg":
                    await sharp( path.join(EXPORT_FILE_PATH, req.file.originalname) )
                    .jpeg()
                    .toFile( path.join(EXPORT_FILE_PATH, newname+".jpg") )
                    .catch( err => {
                        console.log("ERROR HAPPNEED IN SHARP")
                        if(err) throw err
                    })
                    .then(info => {
                        console.log(info)
                        returnObject["jpg"] = newname+".jpg"
                    });
                    break;

                case "svg":
                    
                    // create a new svg file that is cleanly formated and properly layed out for other programs to use
                    beautifySVG( newname+"_tmp.svg", newname+".svg")
                    returnObject["svg"] = newname+".svg"
                    break;

                
                case "tiff":
                    // TODO: run the gdal operations to preserve the origional geospacialdata on this image with the icons added to it
                    console.log("TIFF")

                    break;

                default:
                    console.log("FORMAT UNKNOWN")
                    break;
            }
        }
    }

    res.send(returnObject)
    
    
    // send the new file(s) back to the client with the new name that the user input

    // Send fail codes for 505(internal) or ()

})

// TODO: format the svg so more people can read and use it in other program viewers
/**
 * 
 * @param {*} from 
 * @param {*} to 
 */
function beautifySVG( from, to )
{   
    const keep = ['svg', 'defs', 'marker', 'rect', 'g', 'image']
    // read the raw svg data from the web page
    var filecontent = fs.readFileSync( path.join( EXPORT_FILE_PATH, from) ).toString("utf-8");

    // open a new filestream for appending
    var fileStream = fs.createWriteStream( path.join(EXPORT_FILE_PATH, to), {flags: 'a'} )

    filecontent.replace(/>/g, ">\n").split("\n").forEach( line => {
        console.log(line)

        /* TODO: 
            1. verify what type of svg element is in the line 
            2. set the flag to either a containing element or an inner element
            3. read inner elements into the parent recursivly lowering the number of tabs being used
            4. outer elements should set the inner flag and then read all the child elements until the matching close tag is found.
        */
        // begin cleaning and copying the svg_tmp to the new svg file
        fileStream.write(`${line}\n`);
    });

    fileStream.end();
}

module.exports = router;
