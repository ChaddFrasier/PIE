/* Libraries */
const express = require('express');
const path = require('path');
const compression = require('compression');
const bodyParser = require('body-parser');
const multer = require('multer');
const { response } = require('express');

/* init the application */
const app = express();
const upload = multer();

/* config server */
// using pug engine
app.set('view engine', 'pug');
app.set('views', './views');
// set path for static folder
app.use(express.static(path.join(__dirname,'public')));
// using compression for speed
app.use(compression());
// for parsing json
app.use(bodyParser.json());
// for parsing application/xwww-
app.use(bodyParser.urlencoded({extended: true}));
// allow for multipart form
app.use(upload.array());

/**
 * Used for users login page
 */
app.get('/', (req, res) => {
    console.log(req.url);
    console.log(req.body);

    // render basic pug file
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    console.log(req.url);
    let date = new Date(); 
    res.render('login', {title: 'Login', date: date.toDateString(), emailMessage: 'Please log in with your USGS credentials'});
});

app.post('/', (req, res) => {
    console.log(req.url);
    console.log(req.body);

    if(req.body.usgsEmail && req.body.usgsPassword)
    {
        res.render('index', {usgsEmail: req.body.usgsEmail, usgsPassword: req.body.usgsPassword});
    }
    else
    {
        let date = new Date(); 
        res.render('login', {title: 'Login', date: date.toDateString(), emailMessage: 'Please log in with your USGS credentials'});
    }
    
});

// run the server on port
const port = 8080;
app.listen(port, () => console.log(`Listening for connection at http://localhost:${port}`));