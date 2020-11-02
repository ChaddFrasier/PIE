"use strict";

var express = require('express');
var router = express.Router();

/**
 * @returns about.html
 */
router.post('/', ( req, res, next ) =>
{
    switch (req.baseUrl) {
        case "/api/isis":
            console.log("ISIS COMMAND NEEDS TO RUN");
            break;
            
        case "/api/gdal":
            console.log("GDAL COMMAND NEEDS TO RUN");
            break;
    
        default:
            console.debug("Uh Oh: There was no case that triggered in this switch statement.");
            break;
    }

    console.log("SUCCESS");
});

module.exports = router;