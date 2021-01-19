const createError = require('http-errors');
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const compression = require('compression');

const UPLOAD_PATH = path.join(__dirname, "public", "uploads")
const EXPORT_PATH = path.join(__dirname, "public", "exports")

var indexRouter = require('./routes/index');
var aboutRouter = require('./routes/about');
var contactRouter = require('./routes/contact');
var faqRouter = require('./routes/faq');
var uploadRouter = require('./routes/upload')
var exportRouter = require('./routes/export')
var imageRouter = require('./routes/images');
var downloadRouter = require('./routes/download');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(compression())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/about', aboutRouter);
app.use('/contact', contactRouter);
app.use('/faq', faqRouter);
app.use('/upload', uploadRouter);
app.use('/images',imageRouter);
app.use('/export',exportRouter);
app.use('/download', downloadRouter);


/**
 * @function cleanCreateFolder
 * @param {string} folderPath 
 */
function cleanCreateFolder( folderPath )
{
    if( !fs.existsSync( folderPath ) )
    {
        fs.mkdirSync( folderPath );
        console.log(`Created Directory ${folderPath}`)
    }
    else
    {
        fs.readdir( folderPath, ( err, files ) =>
        {
            if( err ){ return }
            files.forEach( filename =>
            {
                fs.unlink( path.resolve(`${folderPath}/${filename}`), () =>
                {
                    console.log("Removed " + filename)
                })
            })
        })
    }
}

// create export and upload path
cleanCreateFolder( EXPORT_PATH )
cleanCreateFolder( UPLOAD_PATH )


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
