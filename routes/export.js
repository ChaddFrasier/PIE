"use strict"

const express = require('express');
const multer = require('multer');
const path  = require('path');
const router = express.Router();

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
            cb( null, new Date().getTime() +"_"+ path.basename(file.originalname) )
        }
    }
);
    
// set the upload object for multer
var upload = multer( { storage: storage } );

router.post('/', upload.single('exportfile') , (req, res, next) => {
    console.log("hellow")
    console.log(req.body)
})

module.exports = router;
