"use strict";
var express = require('express');
var router = express.Router();
/**
 * @path /images/<filename>
 * @description this onlt will run after a successful ISIS file converstion
 * @returns send the image file back.
 */
router.get('/*', ( req, res ) =>
{
    try
    {
        res.sendFile( __dirname+"/.."+req.url );
    }
    catch( err )
    {
        res.sendStatus(500)
    }
});
module.exports = router;