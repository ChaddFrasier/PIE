"use strict";

var express = require('express');
var { PIEAPI } = require("../public/javascripts/PIE-api")
var router = express.Router();

/**
 * @returns TODO:
 */
router.get('/', ( req, res, next ) =>
{
    var isisRegExp = new RegExp("^/api/isis/.*");
    var gdalRegExp = new RegExp("^/api/gdal");

    if( isisRegExp.test(req.baseUrl) )
    {
        console.log("ISIS DATA GRAB");
        var CubeObjectData = PIEAPI().pie_readPVL(req.baseUrl.split("/")[req.baseUrl.split('/').length-1], ["PixelResolution", "SubSolarAzimuth"])

        console.log(CubeObjectData.data)
        console.log(CubeObjectData.keys)

        res.send(CubeObjectData)
    }
    else if ( gdalRegExp.test(req.baseUrl) )
    {
        console.log("GDAL SPECIAL COMMAND");
    }
});

module.exports = router;