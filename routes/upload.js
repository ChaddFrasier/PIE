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
        var promise = pieapi.gdal_rescale(
            path.join("public", "uploads", req.file.filename),
            "50%",
            path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "jpg"))
            );

        /** TODO: Temporary sectoion start  for testing */
        var promise2 = pieapi.isis_campt(
            path.join("public", "uploads", req.file.filename),
            path.join("public", "uploads", PIEAPI.getNewImageName(req.file.filename, "pvl"))
            );

        /** Temporary end */
       
        // the promise function runs and finishes
        promise
            // then() -> just send the resulting file back to the client for displaying
            .then( (newfilename) => {
                if( fs.existsSync(path.resolve("./"+newfilename)) )
                {
                    res.cookie("filepath", path.basename(newfilename));
                    res.sendFile( path.resolve("./"+newfilename) );
                }
                else
                {
                    res.send("FAILED")
                }
                
            }).catch( (err) => {
                res.send(err.toString("UTF-8"))
            });

            // runn a single promise
        promise2.then((code) => {
            console.log("Promise 2 finished with >")
            console.log(code)

            if( code == 0 )
            {
                promise2 = [
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