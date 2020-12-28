"use strict";

const express = require('express');
const multer = require('multer');
const path  = require('path');
const fs  = require('fs');
const router = express.Router();
var PIEAPI = require('../public/javascripts/PIE-api.js');

// init storage object to tell multer what to do
var storage = multer.diskStorage(
    {
        // tell multer where the destination is
        destination: ( req, file, cb ) =>
        {
            cb( null, 'public/uploads' );
        },
        // tell multer how to name the file
        filename: ( req, file, cb ) =>
        {
            cb( null, new Date().getTime() +"_"+ path.basename(file.originalname) );
        }
    }
);
    
// set the upload object for multer
var upload = multer( { storage: storage } );

/**
 * This route will hadle the file upload by the user and make the ISIS connections
 */
router.post('/', upload.single('imageinput') , (req, res, next) => {
    var isisregexp = new RegExp("^.*\.(CUB|cub|tif|TIF)$");

    // if the file uploaded was an isis3 file
    if( isisregexp.test(req.file.filename) )
    {
        // start the api object
        var pieapi = PIEAPI.PIEAPI();

        // call the gdal scaling function that Trent gave me. and convert the output to jpg at 50% origionl size
        var promise = pieapi.gdal_rescale(
            path.join("public", "uploads", req.file.filename),
            "50%",
            path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "jpg"))
            );
       
        // wait for conversion to finish
        promise.then( ( filepath ) => {
            console.log("Image Converted >")
            console.log(filepath)

            // if the file is found
            if( fs.existsSync( path.resolve(filepath)) )
            {
                // call isis camera point info function
                var promise1 = pieapi.isis_campt(
                    path.join("public", "uploads", req.file.filename),
                    path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "pvl"))
                    );

                // handle failure and success in that order
                promise1.catch(err => {
                    console.log(`ISIS Error: ${err}`)
                }).then((code) => {
                    // create a promises array for the next two functions
                    var promises = [
                        pieapi.isis_catlab(
                            path.join("public", "uploads", req.file.filename),
                            path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "pvl"))
                        ),
                        pieapi.isis_catoriglab(
                            path.join("public", "uploads", req.file.filename),
                            path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "pvl"))
                        )
                    ];

                    // when both promises finish read the data out of the pvl file
                    Promise.all(promises).then( codes => {
                        // read the resulting pvl file
                        (pieapi.pie_readPVL(path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "pvl")),
                        ['Lines', 'Samples', 'Phase', 'Emission', 'Incidence', 'SubSpacecraftGroundAzimuth', 'SubSolarAzimuth', 'NorthAzimuth', 'PixelResolution', 'ObliquePixelResolution'])
                        ).then( object => {
                        res.status(200).send({ imagefile: pieapi.URLerize(filepath, "upload"), pvlData: object })
                        })
                    }).catch( err => {
                        console.log(err)
                    });
                }).catch( err => {
                    console.log(err)
                });
            }
            else
            {
                console.error("WTF")
            }
        }).catch( (err) => {
            // reset code 205
            res.status(205).send(err)
        });
    }
});

router.get('/*', function(req, res)
{
    if(  fs.existsSync(path.resolve( path.join( "public", "uploads", req.url))) )
    {
        res.sendFile(path.resolve( path.join( "public", "uploads", req.url)))
    }
    else
    {
        console.error("FAIL")
    }
});

module.exports = router;