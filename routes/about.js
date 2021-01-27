"use strict";
var express = require('express');
var router = express.Router();
/**
 * @path /about
 * @returns simply returns about.html
 */
router.get('/', ( req, res, next ) =>
{
    res.render( 'about' , {title: "Getting Started"});
});
module.exports = router;