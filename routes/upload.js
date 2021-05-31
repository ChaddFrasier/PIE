"use strict";
const express = require('express');
const multer = require('multer');
const path  = require('path');
const fs  = require('fs');
const router = express.Router();

const PIEAPI = require('../api/PIEAPI');
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
 * This route will handle the file upload by the user and make the ISIS connections
 */
router.post('/', upload.single('imageinput') , (req, res, next) => {
    var isisregexp = new RegExp("^.*\.(CUB|cub|tif|TIF)$");
    // check if the file uploaded was an isis3 file
    if( isisregexp.test(req.file.filename) )
    {
        // start the api object
        var pieapi = new PIEAPI();

        // call the gdal scaling function that Trent uses and convert the output to jpg at 50% size
        var promise = pieapi.gdal_rescale(
            path.join("public", "uploads", req.file.filename),
            "50%",
            path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "jpg"))
            );
        // wait for conversion to finish
        promise.then( ( filepath ) => {
            // if the file is found
            if( fs.existsSync( path.resolve(filepath)) )
            {
                // call isis camera point info function
                var promise1 = pieapi.isis_campt(
                    path.join("public", "uploads", req.file.filename),
                    path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "pvl"))
                    );
                var promise2 = pieapi.isis_catlab(
                    path.join("public", "uploads", req.file.filename),
                    path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "pvl"))
                    );

                var promise3 = pieapi.isis_catoriglab(
                    path.join("public", "uploads", req.file.filename),
                    path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "pvl"))
                    );
                
                // when both promises finish read the data out of the pvl file
                Promise.all([promise1, promise2, promise3]).then( codes => {

                    pieapi.gdal_virtual(
                        path.join("public", "uploads", req.file.filename),
                        path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, 'vrt') )
                    );
                    
                    // read the resulting pvl file
                    (pieapi.pie_readPVL(path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "pvl")),
                    ['Lines', 'Samples', 'SubSpacecraftGroundAzimuth', 'SubSolarAzimuth', 'NorthAzimuth', 'PixelResolution', 'ObliquePixelResolution', 'Phase', 'Emission', 'Incidence',])
                    ).then( object => {
                        res.status(200).send({ imagefile: pieapi.URLerize(filepath, "upload"), pvlData: object, fn: path.basename(filepath) })
                    })
                });
            }
            else
            {
                console.error("GDAL Error: Conversion finished but the file was not found.")
            }
        }).catch( (err) => {
            console.error(err)
            // reset code to non-200
            res.status(205).send(err)
        });
    }
});
/**
 * Send the uploaded file images back to the user using the same handler path
 */
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