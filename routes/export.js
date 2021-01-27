"use strict";
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
            cb( null, 'public/exports' );
        },
        // tell multer how to name the file
        filename: ( req, file, cb ) =>
        {
            cb( null, file.originalname);
        } 
    }
);
// set the upload object for multer
var upload = multer( { storage: storage } );
/**
 * POST /export
 * 
 * upload the svg data and convert the image data into the desired output formats and return the names of the files.
 */
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
    try
    {
        // convert the image to the desired format(s)
        for (let i = 0; i < formatArr.length; i++)
        {
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
                            console.log("ERROR HAPPNEED IN SHARP");
                            if(err) throw err;
                        })
                        .then(info => {
                            console.log(info);
                            returnObject["png"] = newname+".png";
                        });
                        break;
                    
                    case "jpeg":
                        await sharp( path.join(EXPORT_FILE_PATH, req.file.originalname) )
                        .jpeg()
                        .toFile( path.join(EXPORT_FILE_PATH, newname+".jpg") )
                        .catch( err => {
                            console.log("ERROR HAPPNEED IN SHARP");
                            if(err) throw err;
                        })
                        .then(info => {
                            console.log(info);
                            returnObject["jpg"] = newname+".jpg";
                        });
                        break;

                    case "svg":
                        // create a new svg file that is cleanly formated and properly layed out for other programs to use
                        beautifySVG( newname+"_tmp.svg", newname+".svg");
                        returnObject["svg"] = newname+".svg";
                        break;

                    case "tiff":
                        // TODO: run the gdal operations to preserve the origional geospacialdata on this image with the icons added to it
                        console.log("TIFF");
                        break;

                    default:
                        console.log("FORMAT UNKNOWN")
                        break;
                }
            }
        }
        // send the resulting object back
        res.send(returnObject);
    }
    catch( err )
    {
        // send an internal error code
        res.sendStatus(500)
    }
});
/**
 * @function beautifySVG
 * @param {string} from file input path
 * @param {string} ton file output path
 * @description clean the single line svg and create a more readable svg format
 * 
 * TODO: format the svg so more people can read and use it in other program viewers
 * 
 */
function beautifySVG( from, to )
{   
    // read the raw svg data from the web page
    var filecontent = fs.readFileSync( path.join( EXPORT_FILE_PATH, from) ).toString("utf-8");
    // open a new filestream for appending
    var fileStream = fs.createWriteStream( path.join(EXPORT_FILE_PATH, to), {flags: 'a'} );

    // tag object to help format the svg file better
    // this object will hold the beginning portion of each tag we want to keep and the ending tag
    var parentElementArray = ["<?xml ", "<svg ", "<defs>", "<marker ", '<g'];
    var parentEndArray = ["</svg>", "</defs>", "</marker>", '</g>'];
    var count = 0, 
        passOver = false;

    // replace all > with >\n so I can break each section on the \n
    filecontent.replace(/>/g, ">\n").split("\n").forEach( line => {

        console.log(line);

        // dont add the following linesß
        if( line.indexOf("<style>") > -1 )
        {
            passOver = true;
        }

        // set this line in the new file if the passOver is false
        if( !passOver )
        {
            // check if the current line needs to to moved back b/c it is the end of a parent section
            parentEndArray.forEach( tag => {
                // subtract one if it is found in the array
                if( line.indexOf( tag ) > -1 )
                {
                    count--;
                }
            })

            // write the current line to file
            fileStream.write(`${repeat('\t', count)}${line}\n`);

            // add another tab if this line is found in the parent array
            parentElementArray.forEach( tag => {
                if( line.indexOf( tag ) > -1 )
                {
                    count++;
                }
            })
        }

        // start adding lines again
        if( line.indexOf("</style>") > -1 )
        {
            passOver = false;
        }
    });
    // close the Write Stream
    fileStream.end();
}
/**
 * @function repeat
 * @param {string} string the string to repeat
 * @param {number} count the number of times to repeat the string
 * @description this function repeats the string count times and returns a string
 */
function repeat( string, count )
{
    // return val
    let build = String('');
    // loop for each repeat
    for (let i = 0; i < count; i++)
    {
        build += string;
    }
    // return the built string
    return build;
}
module.exports = router;
