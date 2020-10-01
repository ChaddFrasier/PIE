var createError = require('http-errors');
var express = require('express');
var path = require('path');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var compression = require('compression');
var helmet = require('helmet');

var indexRouter = require('./routes/index');
var aboutRouter = require('./routes/about');
var contactRouter = require('./routes/contact');
var apiRouter = require('./routes/api');
var faqRouter = require('./routes/faq');
var uploadRouter = require('./routes/upload')
var imageRouter = require('./routes/images');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(compression())

app.use(
  helmet.contentSecurityPolicy({
    defaultSrc: ["'self'", "blob:", "data:"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'", "ajax.googleapis.com", "'unsafe-inline'"]
  })
)

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/about', aboutRouter);
app.use('/contact', contactRouter);
app.use('/faq', faqRouter);
app.use(['/api/isis','/api/gdal'], apiRouter);
app.use('/upload', uploadRouter);
app.use('/images',imageRouter);

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
