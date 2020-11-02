"use strict";

var express = require('express');
var router = express.Router();

/**
 * @returns index.html
 */
router.get('/', ( req, res, next) => 
{
    console.log(req.url);

    // get the pow job id
    let jobid = req.query.pow;

    if( jobid )
    {
      //TODO: pow connection detected on the homepage
      console.log("pow connection");

      res.render( 'index', {title: "PIE", pow: req.query.pow} );
    }
    else
    {
      res.render( 'index' , {title: "PIE"} );
    }
});

module.exports = router;
