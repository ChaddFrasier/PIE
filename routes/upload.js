var express = require('express');
var multer = require('multer');
var path  = require('path');
var router = express.Router();

// init storage object to tell multer what to do
var storage = multer.diskStorage(
    {
        // tell multer where the destination is
        destination: ( req, file, cb ) =>
        {
            cb( null, 'public/uploads/' )
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

router.post('/', upload.single('imageinput') ,(req, res, next) => {
    console.debug("HELLO WORLDS")
});

module.exports = router;