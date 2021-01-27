"use strict";

var express = require('express');
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
    
});

module.exports = router;
