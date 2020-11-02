"use strict";

const express = require('express');
const path = require('path');

var router = express.Router();
/**
 *  paths: /download/<filename>
 */
router.get('/*', ( req, res ) =>
{
    console.log( req.url );

    // download files that are requested from the user
    res.sendFile( path.resolve(__dirname+"/../public/exports"+req.url) );
});

module.exports = router;