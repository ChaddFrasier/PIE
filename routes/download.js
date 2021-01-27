"use strict";
const express = require('express');
const path = require('path');
var router = express.Router();
/**
 *  @path /download/<filename>
 * @returns sends a file back to the user
 */
router.get('/*', ( req, res ) =>
{
    console.log( req.url );

    var filepath = path.resolve(__dirname+"/../public/exports"+req.url);
    if( filepath )
    {
        try 
        {
            // download files that are requested from the user
            res.sendFile( filepath );
        }
        catch( err )
        {
            res.sendStatus(500)
        }
    }
});
module.exports = router;