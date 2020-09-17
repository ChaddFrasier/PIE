var express = require('express');
var router = express.Router();

/**
 * @returns contact.html
 */
router.get('/', ( req, res ) =>
{
    console.log(req.url)
    res.render( 'contact', {title: "Contact Us"} )
});

module.exports = router;