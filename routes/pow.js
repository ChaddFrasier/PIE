"use strict";

var express = require('express');
var fs = require('fs')
var router = express.Router();

/**
 * 
 */
router.get('/', ( req, res, next) => 
{
    console.log(req.url);

    // get the pow job id
    let jobid = req.query.pow;

    //TODO: pow connection detected from id
    console.log("pow connection");

    // syncronusly query the file system
    if( fs.existsSync(`/pds_san/PDS_Services/POW/${jobid}/`) )
    {
        // otherwise query the folder and extract all the filenames inside it. (Display only the image files, cubs or TIFFs )
            // use the filenames to return the the server so the user can investigate which ever file they want from the list.  
        res.send({err: '200: Your job ID has been validated. THIS IS NOT AN ERROR!'})

    }
    else
    {
        // Send an error back to the server; will be accesed on the browser at 'json.err'
        res.send({err: '230: The server was unable to validate your JobId please check what you have entered is correct and try again.'})
    }
});

module.exports = router;
