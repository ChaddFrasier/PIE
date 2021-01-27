"use strict";
var express = require('express');
var router = express.Router();
/**
 * @returns index.html
 */
router.get('/', ( req, res, next) => 
{
  res.render( 'index' , {title: "PIE"} );
});
module.exports = router;