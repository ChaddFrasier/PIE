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

router.post('/', upload.single('imageinput') , (req, res, next) => {
    var isisregexp = new RegExp("^.*\.(CUB|cub|tif|TIF)$");

    if( isisregexp.test(req.file.filename) )
    {
        // if a tiff or cube file is detected; start the api object
        var pieapi = PIEAPI.PIEAPI();

        // call the gdal scaling function that Trent gave me. and convert the output to jpg
        var promise = pieapi.gdal_rescale(
            path.join("public", "uploads", req.file.filename),
            "60%",
            path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "jpg"))
            );
       
        // runn a single promise
        promise.then( ( filepath ) => {
            console.log("Promises finished with >")
            console.log(`${filepath} is the file path`)

            if( fs.existsSync( path.resolve(filepath)) )
            {
                var promise2 = [
                    pieapi.isis_campt(
                        path.join("public", "uploads", req.file.filename),
                        path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "pvl"))
                        ),
                    pieapi.isis_catlab(
                        path.join("public", "uploads", req.file.filename),
                        path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "pvl"))
                    ), 
                    pieapi.isis_catoriglab(
                        path.join("public", "uploads", req.file.filename),
                        path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "pvl"))
                    )
                ];

                Promise.all(promise2).then( (code) => {
                    if( code.includes(0) )
                    {
                        (pieapi.pie_readPVL(path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "pvl")),
                            ['SubSpacecraftGroundAzimuth', 'SubSolarAzimuth', 'NorthAzimuth', 'PixelResolution', 'ObliquePixelResolution'])
                        ).then( object => {
                            res.status(200).send({ imagefile: pieapi.URLerize(filepath, "upload"), pvlData: object })
                        })
                        .catch(err =>
                        {
                            console.log("what happened")
                        })
                    }
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