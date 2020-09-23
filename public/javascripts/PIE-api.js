"use strict";

var { spawn } = require('child_process');

module.exports = {
    PIEAPI: function()
    {

        function getOutputFormat( filename )
        {
            let chunks = filename.split(".");
            let ext = chunks[chunks.length-1];

            let pngs = [ "png", "PNG" ];
            let jpegs = [ "jpg", "jpeg", "JPEG", "JPG" ];
            let vrts = ["vrt", "VRT" ];

            if(jpegs.indexOf(ext) > -1)
            {
                return "JPEG";
            }
            else if(pngs.indexOf(ext) > -1)
            {
                return "PNG";
            }
            else if(vrts.indexOf(ext) > -1)
            {
                return "VRT";
            }
        }
    
        return {
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

            gdal_rescale: function( inputfile=undefined, scale="30%", outputfile=undefined)
            {
                return new Promise( (resolveFunc, rejectFunc) => {
                    var outputtype = getOutputFormat( outputfile )

                    // create a gdal_translate instance with args in the array
                    var child = spawn( "gdal_translate", [
                        "-of", outputtype,
                        "-ot", "byte", 
                        "-scale","-outsize", scale, scale,
                        inputfile, outputfile] )

                    child.stdout.on("data", data => { console.log(`stdout: ${data}`) });

                    child.stderr.on("data", data => { console.log(`stderr: ${data}`) });

                    child.on('error', (error) => {
                        console.log(`error: ${error.message}`);
                        rejectFunc(error.message);
                    });

                    // when the response is ready to close
                    child.on("close", code => {
                        console.log(`child process exited with code ${code}`);
                        // if the gdal command exited with 0
                        resolveFunc(outputfile);
                    });
                });
            },

            gdal_virtual: function( inputfile=undefined, outputfile=undefined)
            {
                var outputtype = getOutputFormat( outputfile )

                // create a gdal_translate instance with args in the array
                var child = spawn( "gdal_translate", [
                        "-of", outputtype,
                        inputfile, outputfile] )
    
                child.on('error', (error) => {
                    console.log(`error: ${error.message}`);
                    return error.message;
                });
    
                // when the response is ready to close
                child.on("close", code => {
                    console.log(`child process exited with code ${code}`);
                    // if the gdal command exited with 0
                    return code;
                });
            },

            isis_campt: function( inputfile=undefined, outputfile=undefined)
            {
                // create a gdal_translate instance with args in the array
                var child = spawn( "campt", [
                        "FORMAT=","PVL",
                        "FROM=", inputfile, 
                        "TO=", outputfile] )
    
                child.on('error', (error) => {
                    console.log(`error: ${error.message}`);
                    return error.message;
                });
    
                // when the response is ready to close
                child.on("close", code => {
                    console.log(`child process exited with code ${code}`);
                    // if the gdal command exited with 0
                    return code;
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