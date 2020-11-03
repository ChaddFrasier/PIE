"use strict";

var express = require('express');
var router = express.Router();

/**
 * 
 */
router.get('/*', ( req, res ) =>
{
    console.log(__dirname+"/.."+req.url);
    res.sendFile( __dirname+"/.."+req.url );
});

module.exports = router;