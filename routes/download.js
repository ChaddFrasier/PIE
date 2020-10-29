const express = require('express');
const path = require('path');

var router = express.Router();
/**
 *  paths: /download/<filename>
 */
router.get('/*', ( req, res ) =>
{
    console.log( req.url )

    res.sendFile( path.resolve(__dirname+"/../public/exports"+req.url) )
});

module.exports = router;