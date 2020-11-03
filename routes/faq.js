"use strict";

var express = require('express');
var router = express.Router();

/**
 * @returns faq.html
 */
router.get('/', ( req, res ) =>
{
    console.log(req.url);
    res.render( 'faq', {title: "FAQ"});
});

module.exports = router;