/**
 * @file PIEAPI.js
 * @fileoverview This file houses the PIEAPI class which controls the PIE 
 * connection to the command line functions for Geo-Data processing.
 */
"use strict";
const { spawn } = require('child_process');
const fs = require('fs');
/**
 * @class PIEAPI
 * @classdesc This class will hold functions to execute command line jobs on Geospacial files using Nodejs.
 */
module.exports = class PIEAPI {
    constructor()
    {
        this.logFilename = "./bin/log/pieLog.txt";

        if( fs.existsSync(this.logFilename) )
        {
            fs.unlinkSync(this.logFilename)
        }
    }

    /**
     * @function pie_readPVL
     * @param {string} pvlfilename filename for the pvl file
     * @param {Array} keys the keys to look for in the file
     * @description parse out the keys into a JSON object. return an empty object if no keys are found and reject if fails to find file.
     */
    pie_readPVL( pvlfilename, keys ){
        return new Promise( (resolve, reject) =>
        {
            var returnObject = {}
            if( fs.existsSync(pvlfilename) )
            {
                // first check to see if the file exists
                var buffer = fs.readFileSync(pvlfilename, {encoding: 'utf-8'})
                
                if( buffer )
                {
                    // read the whole file lineby line
                    var sep = '\n'
                    var lineArr = buffer.toString().split(sep)
                    
                    for(var i = 0; i < lineArr.length; i++)
                    {
                        for( var j = 0; j < keys.length; j++ )
                        {
                            if( lineArr[i].includes(keys[j]) )
                            {
                                returnObject[keys[j]] = parseFloat(lineArr[i].split("=")[1])
                            }
                        }
                    }
                    let resolveData = cleanPvlObject( returnObject, keys)
                    resolve( resolveData )
                }
            }
            else
            {
                // fail and let user know why it failed
                reject(`Cannot find PVL file by the name of '${pvlfilename}'`)
            }
        });
    }

    /**
     * @function URLerize
     * @param {string} filepath the path to the file the user needs to dwnload 
     * @param {string} baseUrl the baseurl to turn the file into a download url
     */
    URLerize( filepath , baseUrl )
    {
        var newurl = "",
            regexp = (/^.*(public\/uploads)/i);

        newurl = filepath.replace(regexp, baseUrl)
        return newurl
    }

    /**
     * @function gdal_translate
     * @param {Array} argv array of arguments for the gdal_translate function on command line see: https://gdal.org/programs/gdal_translate.html
     * @description run gdal_translate using spawn in node
     */
    gdal_translate( argv )
    {
        // create a gdal_translate instance with args in the array
        var child = spawn( "gdal_translate", argv )

        child.stdout.on("data", data => { console.log(`stdout: ${data}`) });
        child.stderr.on("data", data => { console.log(`stderr: ${data}`) });
        child.on('error', (error) => {
            console.log(`Gdal Translate Error: ${error.message}`);
            return error.message;
        });

        // when the response is ready to close
        child.on("close", code => {
            console.log(`child process exited with code ${code}`);
            // if the gdal command exited with 0
            if( code == 0 )
            {
                // send the image back to client in a browser acceptable image format
                return argv[argv.length-1]
            }
        });
    }

    /**
     * @function gdal_rescale
     * @param {*} inputfile string to the input raster
     * @param {*} scale the new scale in percent or decimal
     * @param {*} outputfile the name of the desired output file. 
     * @description use gdal translate to resize a Raster file, can also convert between file types using https://gdal.org/programs/gdal_translate.html
     */
    gdal_rescale( inputfile=undefined, scale="50%", outputfile=undefined)
    {
        return new Promise( (resolveFunc, rejectFunc) => {
            var outputtype = getOutputFormat( outputfile ),
                errorBuf = "";

            // create a gdal_translate instance with args in the array
            var child = spawn( "gdal_translate", [
                "-of", outputtype,
                "-ot", "byte",
                "-scale","-outsize", scale, scale,
                inputfile, outputfile] )

            // append the buffer data into the error data stream
            child.stderr.on("data", data => { 
                if( data !== " " )
                {
                    logToFile(this.logFilename, errorBuf);
                }
            });

            child.on('error', (error) => {
                console.log(`Resize Error: ${error.message}`);
                rejectFunc(error.message);
            });

            // when the response is ready to close
            child.on("close", code => {
                if( code !== 0 )
                {
                    // if the gdal command is not successful return the errorBuffer
                    rejectFunc(errorBuf);
                }
                else
                {
                    // if the gdal command exited with 0
                    resolveFunc(outputfile);
                }
            });
        });
    }

    /**
     * @function gdal_virtual 
     * @param {string} inputfile the name of the input file
     * @param {string} outputfile the name of the output vrt file
     * @description create a virtual raster file for the given input file
     */
    gdal_virtual( inputfile=undefined, outputfile=undefined) {
        return new Promise( (resolveFunc, rejectFunc) => {
            var outputtype = getOutputFormat( outputfile ),
                errorBuf = "";

            // create a gdal_translate instance with args in the array
            var child = spawn( "gdal_translate", [
                    "-of", outputtype,
                    inputfile, outputfile] )

            child.stdout.on("data", data => { console.log(`stdout: ${data}`) });
            // append the buffer data into the error data stream
            child.stderr.on("data", data => { errorBuf += data });
            child.on('error', (error) => {
                console.log(`error: ${error.message}`);
                rejectFunc(error.message);
            });

            // when the response is ready to close
            child.on("close", code => {
                if( code !== 0 )
                {
                    // if the gdal command is not successful return the errorBuffer
                    rejectFunc(errorBuf);
                }
                else
                {
                    // if the gdal command exited with 0
                    resolveFunc(outputfile);
                }
            });
        });
    }

    /**
     * @function isis_isis2std
     * @param {*} inputfile input ISIS cube file
     * @param {*} outputfile output some std formt supported by the function
     * @description uses isis2std to convert an isis file using this https://isis.astrogeology.usgs.gov/Application/presentation/Tabbed/isis2std/isis2std.html
     */
    isis_isis2std( inputfile=undefined, outputfile=undefined ) {
        return new Promise( (resolveFunc, rejectFunc) => {
            
            var errorBuf = "";

            // create a gdal_translate instance with args in the array
            var child = spawn( "isis2std", [
                    "FORMAT=","JPEG",
                    "FROM=", inputfile, 
                    "TO=", outputfile] )

            child.stdout.on("data", data => { console.log(`stdout: ${data}`) });
            // append the buffer data into the error data stream
            child.stderr.on("data", data => { errorBuf += data });
            child.on('isis2std Error', (error) => {
                console.log(`error: ${error.message}`);
                logToFile(this.logFilename, error.message);
            });
            // when the response is ready to close
            child.on("close", code => {
                // if the gdal command exited with 0
                resolveFunc(code);
            });
        });
    }

    /**
     * @function isis_campt
     * @param {string} inputfile input cub file
     * @param {string} outputfile output pvl file to append the output
     * @description run campt from ISIS and append output to pvl file
     */
    isis_campt( inputfile=undefined, outputfile=undefined) {
        return new Promise( (resolveFunc, rejectFunc) => {
            var errorBuf = "";

            // create a gdal_translate instance with args in the array
            var child = spawn( "campt", [
                    "FORMAT=","PVL",
                    "FROM=", inputfile, 
                    "TO=", outputfile] )

            // append the buffer data into the error data stream
            child.stderr.on("data", data => {
                if( data !== " ")
                {
                    errorBuf += "Campt Error:\n\t" + data 
                }
            });
            child.on('error', (error) => {
                logToFile(this.logFilename, `ISIS Error:\n\t${error.name}: ${error.message}`);
            });
            // when the response is ready to close
            child.on("close", code => {
                if( code !== 0 )
                {
                    logToFile(this.logFilename, errorBuf);
                }
                // resolve with the return code
                resolveFunc(code);
            });
        });
    }

    /**
     * @function isis_catlab
     * @param {string} inputfile input cub file
     * @param {string} outputfile pvl file to append the result
     * @description run catlab and append results to pvl
     */
    isis_catlab( inputfile=undefined, outputfile=undefined) {
        return new Promise( (resolveFunc, rejectFunc) => {
            var errorBuf = "";

            // create a gdal_translate instance with args in the array
            var child = spawn( "catlab", [
                    "APPEND=", "true",
                    "FROM=", inputfile, 
                    "TO=", outputfile] )

            // these are never called when useing append true
            child.stdout.on("data", data => {
                console.log(`Catlab Output -> ${data}`) 
            });
            // append the buffer data into the error data stream
            child.stderr.on("data", data => 
            {
                if( data !== " ")
                {
                    errorBuf += "Catlab Error:\n\t" + data 
                }
            });
            child.on('error', (error) => {
                logToFile(this.logFilename, `ISIS Error:\n\t${error.name}: ${error.message}`);
            });
            // when the response is ready to close
            child.on("close", code => {
                if( code !== 0 )
                {
                    logToFile( this.logFilename, errorBuf)
                }
                
                resolveFunc(code);
            });
        });
    }
    
    /**
     * @function isis_catoriglab
     * @param {string} inputfile cub file for reading
     * @param {string} outputfile pvl file for appending
     * @description run catoriglab and append results to the output file
     */
    isis_catoriglab( inputfile=undefined, outputfile=undefined) {
        return new Promise( (resolveFunc, rejectFunc) => {
            var errorBuf = "";

            // create a gdal_translate instance with args in the array
            var child = spawn( "catoriglab", [
                    "APPEND=", "true",
                    "FROM=", inputfile, 
                    "TO=", outputfile] )

            child.stdout.on("data", data => { 
                console.log(`Catoriglab Output -> ${data}`) 
            });
            // append the buffer data into the error data stream
            child.stderr.on("data", data => 
            { 
                if( data !== " ")
                {
                    errorBuf += "Catoriglab Error:\n\t" + data 
                }
            });
            child.on('error', (error) => {
                logToFile(this.logFilename, `ISIS Error:\n\t${error.name}: ${error.message}`);
            });
            // when the response is ready to close
            child.on("close", code => {
                if( code !== 0 )
                {
                    logToFile( this.logFilename, errorBuf)
                }
                resolveFunc(code);
            });
        });
    }


    /**
     * 
     * @param {*} vrtFile 
     * @param {*} figX 
     * @param {*} figY 
     * @param {*} dataX 
     * @param {*} dataY 
     * @param {*} scale
     */
    edit_vrt ( vrtFile, figX, figY, dataX, dataY, scale ) {

        return  new Promise( (resolveFunc, rejectFunc) => {

            try{
                var filecontent = fs.readFileSync(vrtFile).toString().split('\n'),
                    pastMask = false;

                for (let index = 0; index < filecontent.length; index++) {
                    const line = filecontent[index];
                    
                    if( line.indexOf('rasterXSize') > -1 && index === 0)
                    {
                        filecontent[index] = `<VRTDataset rasterXSize="${figX}" rasterYSize="${figY}">`;
                    }
                    else if( line.indexOf('DstRect') > -1 )
                    {
                        if( pastMask )
                        {
                            filecontent[index] = `\t\t\t<DstRect xOff="${parseInt(dataX)}" yOff="${parseInt(dataY)}" xSize="${parseInt(scale * getOldDims(line, 0))}" ySize="${parseInt(scale * getOldDims(line, 1))}" />`;
                        }
                        else
                        {
                            pastMask = !pastMask
                        }
                    }
                }
    
                fs.writeFileSync( PIEAPI.getNewImageName(vrtFile, 'export.vrt'), String(filecontent.join('\n')))
    
                resolveFunc( PIEAPI.getNewImageName(vrtFile, 'export.vrt') )
            }
            catch( err )
            {
                console.log(err)
                rejectFunc()
            }
        })
    }

    
    edit_src ( vrtFile, newPng ) {

        return  new Promise( (resolveFunc, rejectFunc) => {

            try{
                var filecontent = fs.readFileSync(vrtFile).toString().split('\n'),
                    pastMask = false;

                for (let index = 0; index < filecontent.length; index++) {
                    const line = filecontent[index];
                    
                    if( line.indexOf('SourceFilename') > -1 )
                    {
                        if( pastMask )
                        {
                            filecontent[index] = `\t\t\t<SourceFilename relativeToVRT="1">${newPng}</SourceFilename>`;
                        }
                        else
                        {
                            pastMask = !pastMask
                        }
                    }
                }
    
                fs.writeFileSync( vrtFile, String(filecontent.join('\n')))
    
                resolveFunc( vrtFile )
            }
            catch( err )
            {
                console.log(err)
                rejectFunc()
            }
        })
    }

    /**
     * @function getNewImageName
     * @param {string} filename the basefilename with the origional ext
     * @param {string} ext - extension that the new file has
     * @description create a new filename using the new ext and that has the same base name as filename
     */
    static getNewImageName( filename, ext )
    {
        let tmp = filename.split(".")
        tmp[tmp.length-1] = ext;
        return tmp.join(".");
    }

    eraseExportFiles( filepath ) {
        return new Promise( (resolve, reject) =>
        {
            var id = this.getFileId(filepath),
            path = filepath.split(id)[0];

            
            resolve()
        });
    }
    
    getFileId( filename ) {
        return filename.split("_")[0]
    }
};

/**
 * @function getOutputFormat
 * @param {string} filename the name of the file that we are testing
 * @description parse the filename and determine if the 
 */
function getOutputFormat( filename )
{
    let chunks = filename.split("."),
        pngs = [ "PNG", "png" ],
        jpegs = [ "JPEG", "jpeg", "JPG", "jpg" ],
        vrts = ["VRT", "vrt" ],
        svg = ["SVG", "svg" ],
        cub = ["ISIS3", "cub", "CUB" ],
        tif = ["GTIFF", "tif", "tiff", "TIFF", "TIF" ],
        ext = chunks[chunks.length-1];

    Array(jpegs, pngs, vrts, svg, cub, tif).forEach(array => {
        if(array.includes(ext))
        { 
            ext = array[0];
        }
    });
    return ext
}

/**
 * @function cleanPvlObject
 * @param {JSON} object the JSON object that to update
 * @param {Array} keys the keys to the JSON
 * @description parse over the keys and remove any that are not found inside of the object
 */
function cleanPvlObject( object, keys )
{
    for(var i = 0; i < keys.length; i++ )
    {
        if( object[keys[i]] === undefined || keys[i] === undefined )
        {
            // start at the index of the unknown key and remove 1 element from the array
            keys.splice(i, 1)
        }
        else
        {
            console.log("Clean: " + object[keys[i]])
        }
    }
    return {data: object, keys: keys}
}

function logToFile( file, text )
{
    console.log(`FAILURE: ${text}` )
}

/**
 * 
 * @param {string} line the line of text that contains the origional offset and size
 * @param {Number<Binary>} val 0 is X; 1 is Y
 */
function getOldDims ( line, val) {

    switch( val )
    {
        case 0:
            return parseInt(line.split('xSize="').pop().split('ySize')[0])
        case 1:
            return parseInt(line.split('ySize="').pop())
    }
}