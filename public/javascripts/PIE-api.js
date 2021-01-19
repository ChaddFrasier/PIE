/**
 * @file PIE-api.js
 * @fileoverview this is a file that creates exportable functions to interact with the ISIS and GDAL command line interfaces. 
 * 
*/

"use strict";

// spawn to interact with the command line
var { spawn } = require('child_process');
const fs = require('fs');

/**
 * module.exports allows me to write any number of fucntions that can be used at anypoint after it is included with some code file or in a <script> tag
 */
module.exports = {
    /**
     * @function PIEAPI
     * @description init function to create an instace of these functions that can be accessed like this 
     * 
     * @example 
     * let api = PIEAPI()
     * api.gdal_translate( argv )
     */
    PIEAPI: function()
    {
        /**
         * @function getOutputFormat
         * @param {string} filename the name of the file that we are testing
         * @description parse the filename and determine if the 
         */
        function getOutputFormat( filename )
        {
            let chunks = filename.split(".");
            var ext = chunks[chunks.length-1];

            let pngs = [ "PNG", "png" ];
            let jpegs = [ "JPEG", "jpeg", "JPG", "jpg" ];
            let vrts = ["VRT", "vrt" ];
            let svg = ["SVG", "svg" ];        
            
            Array(jpegs, pngs, vrts, svg).forEach(array => {
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
                if( object[keys[i]] === undefined && keys[i] !== undefined && keys[i] !== null )
                {
                    // start at the index of the unknown key and remove 1 element from the array
                    keys.splice(i, 1)
                }
                else
                {
                    console.log(object[keys[i]])
                }
            }
            return {data: object, keys: keys}
        }
    
        return {

            /** These Function are returned with the PIEAPI object from the init call */

            /**
             * @function pie_readPVL
             * @param {string} pvlfilename filename for the pvl file
             * @param {Array} keys the keys to look for in the file
             * @description parse out the keys into a JSON object. return an empty object if no keys are found and reject if fails to find file.
             */
            pie_readPVL: function ( pvlfilename, keys ){
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
            },

            /**
             * @functoq URLerize
             * @param {string} filepath the path to the file the user needs to dwnload 
             * @param {string} baseUrl the baseurl to turn the file into a download url
             */
            URLerize: function( filepath , baseUrl )
            {
                var newurl = "",
                    regexp = (/^.*(public\/uploads)/i);
                newurl = filepath.replace(regexp, baseUrl)
                return newurl
            },

            /**
             * @function gdal_translate
             * @param {Array} argv array of arguments for the gdal_translate function on command line see: https://gdal.org/programs/gdal_translate.html
             * @description run gdal_translate using spawn in node
             */
            gdal_translate: function( argv )
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
            },

            /**
             * @function gdal_rescale
             * @param {*} inputfile string to the input raster
             * @param {*} scale the new scale in percent or decimal
             * @param {*} outputfile the name of the desired output file. 
             * @description use gdal translate to resize a Raster file, can also convert between file types using https://gdal.org/programs/gdal_translate.html
             */
            gdal_rescale: function( inputfile=undefined, scale="50%", outputfile=undefined)
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

                    child.stdout.on("data", data => { console.log(`stdout: ${data}`) });

                    // append the buffer data into the error data stream
                    child.stderr.on("data", data => { errorBuf += data });

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
            },

            /**
             * @function gdal_virtual 
             * @param {string} inputfile the name of the input file
             * @param {string} outputfile the name of the output vrt file
             * @description create a virtual raster file for the given input file
             */
            gdal_virtual: function( inputfile=undefined, outputfile=undefined)
            {
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
            },

            /**
             * @function isis_isis2std
             * @param {*} inputfile input ISIS cube file
             * @param {*} outputfile output some std formt supported by the function
             * @description uses isis2std to convert an isis file using this https://isis.astrogeology.usgs.gov/Application/presentation/Tabbed/isis2std/isis2std.html
             */
            isis_isis2std: function( inputfile=undefined, outputfile=undefined)
            {
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
                        rejectFunc(error.message);
                    });

                    // when the response is ready to close
                    child.on("close", code => {
                        if( code == 0 )
                        {
                            // if the gdal command exited with 0
                            resolveFunc(code);
                        }
                    });
                });
            },

            /**
             * @function isis_campt
             * @param {string} inputfile input cub file
             * @param {string} outputfile output pvl file to append the output
             * @description run campt from ISIS and append output to pvl file
             */
            isis_campt: function( inputfile=undefined, outputfile=undefined)
            {
                return new Promise( (resolveFunc, rejectFunc) => {
                    var errorBuf = "";

                    // create a gdal_translate instance with args in the array
                    var child = spawn( "campt", [
                            "FORMAT=","PVL",
                            "FROM=", inputfile, 
                            "TO=", outputfile] )
        
                    child.stdout.on("data", data => { console.log(`Campt Output -> ${data}`) });
            
                    // append the buffer data into the error data stream
                    child.stderr.on("data", data => { errorBuf += data });

                    child.on('error', (error) => {
                        console.log(`Campt Error: ${error.message}`);
                        rejectFunc(error.message);
                    });

                    // when the response is ready to close
                    child.on("close", code => {
                        // if the gdal command exited with 0
                        resolveFunc(code);
                    });
                });
            },

            /**
             * @function isis_catlab
             * @param {string} inputfile input cub file
             * @param {string} outputfile pvl file to append the result
             * @description run catlab and append results to pvl
             */
            isis_catlab: function( inputfile=undefined, outputfile=undefined)
            {
                return new Promise( (resolveFunc, rejectFunc) => {
                    var errorBuf = "";

                    // create a gdal_translate instance with args in the array
                    var child = spawn( "catlab", [
                            "APPEND=", "true",
                            "FROM=", inputfile, 
                            "TO=", outputfile] )
        
                    child.stdout.on("data", data => { console.log(`Catlab Output -> ${data}`) });
            
                    // append the buffer data into the error data stream
                    child.stderr.on("data", data => { errorBuf += data });

                    child.on('error', (error) => {
                        console.log(`Catlab Error: ${error.message}`);
                        rejectFunc(error.message);
                    });

                    // when the response is ready to close
                    child.on("close", code => {
                        // if the gdal command exited with 0
                        resolveFunc(code);
                    });
                });
            },
            
            /**
             * @function isis_catoriglab
             * @param {string} inputfile cub file for reading
             * @param {string} outputfile pvl file for appending
             * @description run catoriglab and append results to the output file
             */
            isis_catoriglab: function( inputfile=undefined, outputfile=undefined)
            {
                return new Promise( (resolveFunc, rejectFunc) => {
                    var errorBuf = "";

                    // create a gdal_translate instance with args in the array
                    var child = spawn( "catoriglab", [
                            "APPEND=", "true",
                            "FROM=", inputfile, 
                            "TO=", outputfile] )

                    child.stdout.on("data", data => { console.log(`Catoriglab Output -> ${data}`) });
            
                    // append the buffer data into the error data stream
                    child.stderr.on("data", data => { errorBuf += data });

                    child.on('error', (error) => {
                        console.log(`error: ${error.message}`);
                        rejectFunc(error.message);
                    });

                    // when the response is ready to close
                    child.on("close", code => {
                        // if the gdal command exited with 0
                        resolveFunc(code);
                    });
                });
            }
        };
    },
    
    /**
     * @function getNewImageName
     * @param {string} filename the basefilename with the origional ext
     * @param {string} ext - extension that the new file has
     * @description create a new filename using the new ext and that has the same base name as filename
     */
    getNewImageName: function( filename, ext )
    {
        let tmp = filename.split(".")
        tmp[tmp.length-1] = ext;
        return tmp.join(".");
    }
};