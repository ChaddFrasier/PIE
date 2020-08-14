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

## TODO

1. Make a ~scalebar SVG~ and ~button interface in the toolbox~

2. ~Make the event listeners for dragging a scalebar onto the screen~

3. Should be able to drag a ui box up and down without resetting

4. Ui box that is being dragged up and down should have a thicker border or some indication of focus

5. Cursor should be 'grab' when dragging a UI box. (will probably need to put a class on the whole body)

6. Create a mini image for when dragging an icon to the image, the icon should follow the mouse like a ghost

-----------------------
@USGS