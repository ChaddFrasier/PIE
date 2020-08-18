# PIE
-------------
PIE -> Planetary Image Editor

This server was created to simplify the figure making process for planetary researchers in the USGS but could be used by anyone with an email. It was first thought up by Laszlo Kestay and with the help from the POW development team at the USGS it became the last connection in a web-based processing pipline that connects PILOT, POW, and PIE in a smooth workfow that removes the need for researchers to learn ISIS3 command line interface programs. With PIE we are also connecting an image editor to the pipline to create publication ready images with less effort.

## Dependencies
1. ISIS3
2. GDAL
3. NodeJS

## Install
```
1. Pull down the code from the repo

2. Install dependencies
npm install
```

## TODOs
1. ~Fix icon arrow bug~
2. Dragging functions
    a. ~north arrow~
    b. ~sun arrow~
    c. ~observer arrow~
    d. scalebar icon ( to fix, )
    e. rectagnle outline
    f. lines
3. Scale the icons with the scroll wheel
    a. North
    b. Sun
    c. Observer
    d. Scalebar ( Eventually, change size of scalebar and recalculate numbers being displayed )
    e. ~outlines~
    f. ~lines~
4. Fix the scalebar icon size when it is placed on the screen
5. Marker stroke-width is too big needs to match the line
x. Get ISIS working at home
-----------------------
@USGS