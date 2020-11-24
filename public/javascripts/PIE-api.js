/**
 * @file PIE-api.js
 * @fileoverview this is a file that creates exportable functions to interact with the ISIS and GDAL command line interfaces. 
 */

"use strict";

// spawn to interact with the command line
var { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

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

        // TODO: comment this file
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
    
        return {

            /**
             * 
             * @param {*} pvlfilename 
             * @param {*} keys 
             */
            pie_readPVL: function ( pvlfilename, keys ){
                try
                {
                    if( fs.existsSync(pvlfilename) )
                    {
                        // first check to see if the file exists
                        fs.readFile(pvlfilename, function(err, buffer){
                            if( err ){console.error(err)}
                            else
                            {
                                //console.log(buffer.toString())
                            }
                        });
                    }
                    else
                    {
                        // fail and let user know why it failed
                    }
                    
                    // read the data of the file line by line
                    return { data: {key1:1, key2:2}, keys: ["key1", "key2"] }
                }
                catch(err) {
                    console.log(err)
                }
            },

            /**
             * 
             * @param {*} filepath 
             * @param {*} baseUrl 
             */
            URLerize: function( filepath , baseUrl )
            {
                var newurl = "",
                    regexp = (/^.*(public\/uploads)/i);
                newurl = filepath.replace(regexp, baseUrl)
                return newurl
            },

            /**
             * 
             * @param {*} argv 
             */
            gdal_translate: function( argv )
            {
                // create a gdal_translate instance with args in the array
                var child = spawn( "gdal_translate", argv )
    
                child.stdout.on("data", data => { console.log(`stdout: ${data}`) });
    
                child.stderr.on("data", data => { console.log(`stderr: ${data}`) });
    
                child.on('error', (error) => {
                    console.log(`error: ${error.message}`);
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
             * 
             * @param {*} inputfile 
             * @param {*} scale 
             * @param {*} outputfile 
             */
            gdal_rescale: function( inputfile=undefined, scale="50%", outputfile=undefined)
            {
                return new Promise( (resolveFunc, rejectFunc) => {

                    var outputtype = getOutputFormat( outputfile ),
                        errorBuf = undefined;

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
             * 
             * @param {*} inputfile 
             * @param {*} outputfile 
             */
            gdal_virtual: function( inputfile=undefined, outputfile=undefined)
            {
                return new Promise( (resolveFunc, rejectFunc) => {
                    var outputtype = getOutputFormat( outputfile )

                    // create a gdal_translate instance with args in the array
                    var child = spawn( "gdal_translate", [
                            "-of", outputtype,
                            inputfile, outputfile] )
        
                    child.on('error', (error) => {
                        console.log(`error: ${error.message}`);
                        rejectFunc(error.message)
                    });
    
                    // when the response is ready to close
                    child.on("close", code => {
                        console.log(`child process exited with code ${code}`);
                        // if the gdal command exited with 0
                        resolveFunc(outputfile);
                    });
                });
            },

            /**
             * 
             * @param {*} inputfile 
             * @param {*} outputfile 
             */
            isis_isis2std: function( inputfile=undefined, outputfile=undefined)
            {
                return new Promise( (resolveFunc, rejectFunc) => {
                    // create a gdal_translate instance with args in the array
                    var child = spawn( "isis2std", [
                            "FORMAT=","JPEG",
                            "FROM=", inputfile, 
                            "TO=", outputfile] )
        
                    child.on('error', (error) => {
                        console.log(`error: ${error.message}`);
                        rejectFunc(error.message);
                    });
        
                    // when the response is ready to close
                    child.on("close", code => {
                        console.log(`child process exited with code ${code}`);
                        // if the gdal command exited with 0
                        resolveFunc(code);
                    });
                });
            },

            /**
             * 
             * @param {*} inputfile 
             * @param {*} outputfile 
             */
            isis_campt: function( inputfile=undefined, outputfile=undefined)
            {
                return new Promise( (resolveFunc, rejectFunc) => {
                    // create a gdal_translate instance with args in the array
                    var child = spawn( "campt", [
                            "FORMAT=","PVL",
                            "FROM=", inputfile, 
                            "TO=", outputfile] )
        
                    child.on('error', (error) => {
                        console.log(`error: ${error.message}`);
                        rejectFunc(error.message);
                    });
        
                    // when the response is ready to close
                    child.on("close", code => {
                        console.log(`child process exited with code ${code}`);
                        // if the gdal command exited with 0
                        resolveFunc(code);
                    });
                });
            },

            /**
             * 
             * @param {*} inputfile 
             * @param {*} outputfile 
             */
            isis_catlab: function( inputfile=undefined, outputfile=undefined)
            {
                return new Promise( (resolveFunc, rejectFunc) => {
                    // create a gdal_translate instance with args in the array
                    var child = spawn( "catlab", [
                            "APPEND=", "true",
                            "FROM=", inputfile, 
                            "TO=", outputfile] )
        
                    child.on('error', (error) => {
                        console.log(`error: ${error.message}`);
                        rejectFunc(error.message);
                    });
        
                    // when the response is ready to close
                    child.on("close", code => {
                        console.log(`child process exited with code ${code}`);
                        // if the gdal command exited with 0
                        resolveFunc(code);
                    });
                });
            },
            
            /**
             * 
             * @param {*} inputfile 
             * @param {*} outputfile 
             */
            isis_catoriglab: function( inputfile=undefined, outputfile=undefined)
            {
                return new Promise( (resolveFunc, rejectFunc) => {
                    // create a gdal_translate instance with args in the array
                    var child = spawn( "catoriglab", [
                            "APPEND=", "true",
                            "FROM=", inputfile, 
                            "TO=", outputfile] )
        
                    child.on('error', (error) => {
                        console.log(`error: ${error.message}`);
                        rejectFunc(error.message);
                    });
        
                    // when the response is ready to close
                    child.on("close", code => {
                        console.log(`child process exited with code ${code}`);
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