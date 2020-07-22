/* Libraries */
const express = require('express');
const path = require('path');
const compression = require('compression');
const bodyParser = require('body-parser');
const multer = require('multer');

/* init the application */
const app = express();

// init storage object to tell multer what to do
var storage = multer.diskStorage({
    // tell multer where the destination is
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    // tell multer how to name the file
    filename: function (req, file, cb) {
        cb(null, new Date().getTime() +"_"+ path.basename(file.originalname))
    }
})

// set the upload object for multer
var upload = multer({ storage: storage });

/* config server */
// using pug engine
app.set('view engine', 'pug');
app.set('views', './views');
app.set('utils', './scripts');
// set path for static folder
app.use(express.static(path.join(__dirname,'public')));
// using compression for speed
app.use(compression());
// for parsing json
app.use(bodyParser.json());
// for parsing application/xwww-
app.use(bodyParser.urlencoded({extended: true}));

/**
 * Used for users login page
 */
app.get('/', (req, res) => {
    console.log(req.url);
    console.log(req.body);

    res.render('index', {usgsEmail:"test@usgs.gov", usgsPassword:"password"});

    // render basic pug file
    // res.redirect('/login');
});

// getting the basic login page
app.get('/login', (req, res) => {
    console.log(req.url);
    let date = new Date(); 
    res.render('login', {title: 'Login', date: date.toDateString(), emailMessage: 'Please log in with your USGS credentials'});
});

// posting to / with some user info
app.post('/', (req, res) => {
    console.log(req.url);
    console.log(req.body);

    if (req.body.usgsEmail && req.body.usgsPassword) {
        res.render('index', {usgsEmail: req.body.usgsEmail, usgsPassword: req.body.usgsPassword});
    }
    else {
        let date = new Date(); 
        res.render('login', {title: 'Login', date: date.toDateString(), emailMessage: 'Please log in with your USGS credentials'});
    }
});

// api post path for processing tifs and cubes
app.post("/api/isis", upload.single('uploadfile'), function(req, res) {
    
    console.log("file recieved")
    res.sendStatus(200)

});

// run the server on port
const port = 8080;
app.listen(port, () => console.log(`Listening for connection at http://localhost:${port}`));