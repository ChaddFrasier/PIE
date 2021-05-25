/**
 * @file ButtonManager.js
 * @fileoverview a class object to control the button detections
 */
"use strict";
var btnManager = null;

/**
 * @class ButtonManger
 * @classdesc Class to control the buttons on the PIE UI. It will turn buttons on and off when needed.
 */
class ButtonManager {
    static geoBtnArray = ['northarrowopt', 'scalebarbtnopt', 'sunarrowopt', 'keyopt', 'observerarrowopt'];
    
    /**
     * @constructor
     * @param void
     */
    constructor( ){
        this.MemoryObject = [];
        btnManager = this;
    }

    /**
     * @function refresh
     * @param void
     * @description refresh the button manager to update the button detections.
     */
    refresh()
    {
        // deactivate all the buttons
        ButtonManager.setMains("disable")
        
        // activate only the ones that are needed
        Object.keys(this.MemoryObject).forEach( imageId => {

            if( this.MemoryObject[imageId].indexOf("north") > -1 )
            {
                // activate the north button
                document.getElementById("northarrowopt").classList.remove("disabled")
                document.getElementById("keyopt").classList.remove("disabled")
            }
            if( this.MemoryObject[imageId].indexOf("sun") > -1 )
            {
                // activate the north button
                document.getElementById("sunarrowopt").classList.remove("disabled")
                document.getElementById("keyopt").classList.remove("disabled")
            }
            if( this.MemoryObject[imageId].indexOf("observer") > -1 )
            {
                // activate the north button
                document.getElementById("observerarrowopt").classList.remove("disabled")
                document.getElementById("keyopt").classList.remove("disabled")
            }
            if( this.MemoryObject[imageId].indexOf("scale") > -1 )
            {
                // activate the north button
                document.getElementById("scalebarbtnopt").classList.remove("disabled")
                document.getElementById("keyopt").classList.remove("disabled")
            }
        });
    }

    /**
     * @function addImage
     * @param {string} imagename the name of the image we are editing.
     * @param {string} btnArray array of buttons that need to be updated.
     * @description this function adds objects into an array to track which buttons are active an deactivated.
     */
    addImage( imagename, btnArray )
    {
        btnManager.MemoryObject[imagename] = btnArray
        btnManager.refresh()
    }

    /**
     * @function removeImage
     * @param {string} imagename the name of the image being removed from the MemoryObject
     * @description this functions removes objects from the MemoryObject and then refreshes the UI
     */
    removeImage( imagename )
    {
        if( btnManager.MemoryObject[imagename] ) 
        {
            delete btnManager.MemoryObject[imagename]
            btnManager.refresh()
        }
    }

    /**
     * @function setMains
     * @param {"enable"|"disabled"} activation activation string to tell the function to add or remove
     * @description disable and re-enable the buttons
     */
    static setMains( activation )
    {
        switch( activation )
        {
            case "enable":
                ButtonManager.geoBtnArray.forEach( (geoId) => {
                    document.getElementById(geoId.replace("#", '')).classList.remove( "disabled" )
                });
                break;
            case "disable":
                ButtonManager.geoBtnArray.forEach( (geoId) => {
                    document.getElementById(geoId.replace("#", '')).classList.add( "disabled" )
                });
                break;
            default:
                console.error("Unknown Activation Code")
                break;
        }
    }
}