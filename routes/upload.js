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
    var isisregexp = new RegExp("^.*\.(CUB|cub|tif|TIF)");

    if( isisregexp.test(req.file.filename) )
    {
        // if a tiff or cube file is detected
        console.debug("GEO FILE DETECTED");

        var pieapi = PIEAPI.PIEAPI();

        // call the gdal scaling function that Trent gave me. and convert the output to jpg
        var promise = [pieapi.gdal_rescale(
            path.join("public", "uploads", req.file.filename),
            "50%",
            path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "jpg"))
            ),
            pieapi.isis_campt(
            path.join("public", "uploads", req.file.filename),
            path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "pvl"))
            )];
       
        // runn a single promise
        Promise.all(promise).then(( data ) => {
            console.log("Promises finished with >")
            console.log(data)

            if( data[1] == 0 )
            {
                var promise2 = [
                    pieapi.isis_catlab(
                        path.join("public", "uploads", req.file.filename),
                        path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "pvl"))
                    ), 
                    pieapi.isis_catoriglab(
                        path.join("public", "uploads", req.file.filename),
                        path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "pvl"))
                    )
                ];

                Promise.all(promise2).then((code) => {
                    console.log("Inner ISIS Commands finished with codes > " + String(code).replace(",", " and "))

                    var pvldataObject = pieapi.pie_readPVL(path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "pvl")), ["NorthAzimuth"])

                    res.send({ imagefile: data[0], pvlData: pvldataObject })
                });
            }
        }).catch( (err) => {
            console.log(err)
        });
    }
    else
    {
        res.redirect('/');
    }
});

module.exports = router;