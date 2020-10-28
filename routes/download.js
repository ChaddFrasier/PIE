var express = require('express');
var router = express.Router();

/**
 *  paths: /download/<filename>
 */
router.post('/*', ( req, res ) =>
{
    console.log( req.url )

    res.sendFile( __dirname+"/.."+req.url )
});

module.exports = router;