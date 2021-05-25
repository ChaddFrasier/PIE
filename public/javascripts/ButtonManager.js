
/**
 * @function startButtonManager
 * @description a simple object that helps handle the button UIs
 */
"use strict"
var btnManager = null;

class ButtonManager {
    constructor( ){
        this.MemoryObject = [];
        btnManager = this;
    }

    static geoBtnArray = Array('northarrowopt', 'scalebarbtnopt', 'sunarrowopt', 'keyopt', 'observerarrowopt');

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

    addImage( imagename, btnArray )
    {
        btnManager.MemoryObject[imagename] = btnArray
        btnManager.refresh()
    }

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