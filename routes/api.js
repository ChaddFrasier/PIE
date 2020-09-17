var express = require('express');
var router = express.Router();

/**
 * @returns about.html
 */
router.post('/', ( req, res, next ) =>
{
    console.log(req.baseUrl)
    console.log("SUCCESS")
});

module.exports = router;