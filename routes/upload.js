"use strict"

const express = require('express');
const multer = require('multer');
const path  = require('path');
const router = express.Router();
var PIEAPI = require('../public/javascripts/PIE-api.js')

// init storage object to tell multer what to do
var storage = multer.diskStorage(
    {
        // tell multer where the destination is
        destination: ( req, file, cb ) =>
        {
            cb( null, 'public/uploads' )
        },
        // tell multer how to name the file
        filename: ( req, file, cb ) =>
        {
            cb( null, new Date().getTime() +"_"+ path.basename(file.originalname) )
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
        console.debug("GEO FILE DETECTED")

        var pieapi = PIEAPI.PIEAPI();

        // call the gdal scaling function that Trent gave me. and convert the output to jpg
        var promise = pieapi.gdal_rescale(
            path.join("public", "uploads", req.file.filename),
            "30%",
            path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "jpg"))
            );

        /** TODO: Temporary sectoion start  */
        var promise2 = pieapi.gdal_virtual(
            path.join("public", "uploads", req.file.filename),
            path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "vrt"))
            );

        // runn a single promise
        promise2.then((vrtfile) => {
            console.log("Promise 2 finished with >")
            console.log(vrtfile)
            });

        /** Temporary end */
       
        // the promise function runs and finishes
        promise
            // then() -> just send the resulting file back to the client for displaying
            .then( (newfilename) => {
                res.cookie("filepath", path.basename(newfilename))
                res.sendFile( path.resolve("./"+newfilename) );
            }).catch( (err) => {
                console.debug(err);
            });
    }
    else
    {
        res.redirect('/');
    }
});

module.exports = router;