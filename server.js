/* Libraries */
const express = require( 'express' )
const path = require( 'path' )
const compression = require( 'compression' )
const bodyParser = require( 'body-parser' )
const multer = require( 'multer' )
const fs = require( 'fs' )
const { spawn } = require( 'child_process' )

/* init the application */
const app = express()

// init storage object to tell multer what to do
var storage = multer.diskStorage(
    {
        // tell multer where the destination is
        destination: ( req, file, cb ) =>
        {
            cb( null, 'public/uploads/' )
        },
        // tell multer how to name the file
        filename: ( req, file, cb ) =>
        {
            cb( null, new Date().getTime() +"_"+ path.basename(file.originalname) )
        }
    }
)

/**
 * read the upload directory and remove all files if its there
 */
fs.readdir( path.join(__dirname, "public", "uploads"), ( err, files ) =>
{
    if( err ){ return }

    files.forEach( filename =>
    {
        fs.unlink( path.join(__dirname, "public", "uploads", filename), () =>
        {
            console.log("Removed " + filename)
        })
    })
})

// set the upload object for multer
var upload = multer( { storage: storage } )

/* config server */
// using pug engine
app.set( 'view engine', 'pug' )
app.set( 'views', './views' )
app.set( 'utils', './scripts' )

// set path for static folder
app.use( express.static(path.join(__dirname, 'public')) )

// using compression for speed
app.use( compression() )

// for parsing json
app.use( bodyParser.json() )
// for parsing application/xwww-
app.use( bodyParser.urlencoded( {extended: true} ) )

/**
 * @returns index.html
 */
app.get(['/', '/index.html'], ( req, res ) => 
{
    console.log(req.url)

    // get the pow job id
    let jobid = req.query.pow

    if( jobid )
    {
        //TODO: pow connection detected on the homepage
        console.log("pow connection")

        res.render( 'index', {pow: req.query.pow} )
    }
    else
    {
        res.render( 'index' )
    }
});

/**
 * @returns about.html
 */
app.get(['/about', '/about.html'], ( req, res ) =>
{
    console.log(req.url)

    res.render( 'about' )
});

/**
 * @returns contact.html
 */
app.get(['/contact', '/contact.html'], ( req, res ) =>
{
    console.log(req.url)

    res.render( 'contact' )
});

/**
 * @returns faq.html
 */
app.get(['/faq', '/faq.html'], ( req, res ) =>
{
    console.log(req.url)

    res.render( 'faq' )
});

/**
 * @returns the image that was uploaded
 */
app.post("/api/isis", upload.single('uploadfile'), (req, res) =>
{
    // TODO: this is where i should attempt to create a vrt file using the method that Trent sent me
    var child = spawn(
        "gdal_translate",
        [
            "-of", "JPEG",
            "-ot", "byte",
            "-scale", "-outsize", "30%", "30%",
            path.join(__dirname, "public", "uploads", req.file.filename),
            path.join(__dirname, "public", "uploads", getNewImageName(req.file.filename, "jpg"))
        ]
    )
    
    child.stdout.on("data", data =>
    {
        console.log(`stdout: ${data}`);
    });
    
    child.stderr.on("data", data =>
    {
        console.log(`stderr: ${data}`);
    });
    
    child.on('error', (error) => {
        console.log(`error: ${error.message}`);
        res.sendStatus( "500" );
    });
    
    // when the response is ready to close
    child.on("close", code => {
        console.log(`child process exited with code ${code}`);
        // if the gdal command exited with 0
        if( code == 0 )
        {
            // send the image back to client in a browser acceptable image format
            res.sendFile( path.join(__dirname, "public","uploads", getNewImageName(req.file.filename, "jpg")) )

            // create the vrt file
            var vrtChild = spawn(
                "gdal_translate", 
                [
                    "-of", "vrt",
                    path.join(__dirname, "public", "uploads", getNewImageName(req.file.filename, "jpg")),
                    path.join(__dirname, "public", "uploads", getNewImageName(req.file.filename, "vrt"))
                ]
            )

            vrtChild.on("close", exitCode => {
                if( exitCode == 0 )
                {
                    // on success
                    console.log("vrt created successfully")
                }
            })
        }
    })
});

// run the server on port
const port = 8080;
app.listen(port, () => console.log(`Listening for connection at http://localhost:${port}`));

/**
 * @function getNewImageName
 * @param {string} filename the basefilename with the origional ext
 * @param {string} ext - extension that the new file has
 * @description create a new filename using the new ext and that has the same base name as filename
 */
function getNewImageName( filename, ext )
{
    let tmp = filename.split(".")
    tmp[tmp.length-1] = ext;
    return tmp.join(".");
}