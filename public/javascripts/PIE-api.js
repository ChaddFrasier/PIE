"use strict";

var { spawn } = require('child_process');

module.exports = {
    PIEAPI: function()
    {
    
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