/* Libraries */
const express = require('express');
const path = require('path');
const compression = require('compression');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const { spawn } = require('child_process');

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

fs.readdir(path.join(__dirname, "public", "uploads"), function(err, files){
    if(err){console.log(err); return;}
    files.forEach(filename => {
        fs.unlink(path.join(__dirname, "public", "uploads", filename), function() {
            console.log("Removed " + filename)

        });
    });
});

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
app.get(['/', '/index.html'], (req, res) => {
    console.log(req.url);

    // get the pow job id
    let jobid = req.query.pow;

    if( jobid )
    {
        console.log("pow connection")

        res.render('index', {pow: req.query.pow});
    }
    else
    {
        res.render('index');
    }
});

/**
 * Used for talking about the project
 */
app.get(['/about', '/about.html'], (req, res) => {
    console.log(req.url);

    res.render('about');
});

/**
 * Used for taling about the project
 */
app.get('/contact', (req, res) => {
    console.log(req.url);
    console.log(req.body);

    res.render('contact');
});


/**
 * Used for taling about the project
 */
app.get('/faq', (req, res) => {
    console.log(req.url);
    console.log(req.body);

    res.render('faq');
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

    console.log("file recieved: " + req.file.filename)

    // TODO: this is where i should attempt to create a vrt file using the method that Trent sent me

    var child = spawn("gdal_translate", ["-of", "JPEG", "-scale", "-outsize", "20%",  "20%", path.join(__dirname, "public", "uploads", req.file.filename), path.join(__dirname, "public", "uploads", getNewImageName(req.file.filename, "jpg"))])
    
    child.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
    });
    
    child.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });
    
    child.on('error', (error) => {
        console.log(`error: ${error.message}`);
        res.sendStatus("500");
    });
    
    // TODO: send the file back to the client
    child.on("close", code => {
        console.log(`child process exited with code ${code}`);
        if( code == 0)
        {
            res.sendFile(path.join(__dirname, "public","uploads", getNewImageName(req.file.filename, "jpg")))
        }
    });
});

// run the server on port
const port = 8080;
app.listen(port, () => console.log(`Listening for connection at http://localhost:${port}`));

function getNewImageName( filename, ext )
{
    let tmp = filename.split(".")
    tmp[tmp.length-1] = ext;
    return tmp.join(".");
}