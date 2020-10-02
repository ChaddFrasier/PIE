/**
 * @file DraggableList.js
 * @requires svgHelper.js
 * @fileoverview This will a file that generates a draggable list box and an ordered array of list objects
*/

"use strict";

/**
 * @function DraggableList
 * @param {object} inobject - an object to force into becomeing a draggable list
 * @description created a draggable list object with listeners and svg layer organizer. 
 * This file is designed for PIE not general use.
*/
function DraggableList( inobject=undefined )
{
    var DraggableList = [];
    var DraggableListContainer = inobject;

    var shiftObjects,
        lowerObject, 
        upperObject;


    /** Setup a function to track the mouse movement of the user */
    var xDirection = "",
        yDirection = "",
        oldX = 0,
        update = false,
        oldY = 0,
        sensitivity = 55;

    /**
    * @function getMouseDirection
    * @param {_MouseEvent} e - the event that is happening at the time of calling
    * @description get the mouse direction as a string relative to the sensitivity level set globally
    */
    function getMouseDirection( e )
    {
        //deal with the horizontal case
        if ( oldX + sensitivity < e.pageX )
        {
            // update right
            update = true
            xDirection = "right"

            // new anchor point
            oldX = e.pageX
        } 
        else if( oldX - sensitivity > e.pageX )
        {
            // set update left
            update = true
            xDirection = "left"

            // set new anchor point
            oldX = e.pageX
        }

        //deal with the vertical case
        if ( oldY + sensitivity < e.pageY )
        {
            // set update down
            yDirection = "down"
            update = true

            // set new anchor point
            oldY = e.pageY
        }
        else if ( oldY - sensitivity > e.pageY )
        {
            // update the page and set direction up
            update = true
            yDirection = "up"

            // set new anchor point
            oldY = e.pageY
        }
        else
        {
            // direction not determined
            yDirection = ""
        }
    }
        
    /**
     * @function shiftUp
     * @param {number} newY - the pageY value that will become the new "oldY" in this object
     * @description shift the object up one slot in the tools location
     */
    function shiftUp( newY )
    {
        // check for a none outer object as the upper element
        if( upperObject.getAttribute("objectid") )
        {
            // insert the element above the sifting elements
            draggableList.getContainerObject().insertBefore(shiftObjects, upperObject)

            // move up one layer
            moveSvgUp(document.getElementById(shiftObjects.attributes.objectid.value))

            // clear elements
            lowerObject = upperObject
            upperObject = shiftObjects.previousElementSibling
            yDirection = ""
            oldY = newY
        }
    }


    /**
     * @function removeToolsWindow
     * @param {_Event} event - the event to remove a window when button click happens
     * @description This function is used to delete the tools window and options bar from the tool box area
    */
    function removeToolsWindow( event )
    {
        if(event.target.parentElement.attributes.objectid.value)
        {
            // remove the current options bar, its next child and the caption matching the same id
            let parentBox = event.target.parentElement.parentElement
            let svgObject = document.getElementById(event.target.parentElement.attributes.objectid.value)

            let svgcontainer = draggableSvg.getContainerObject()

            // remove the options and other things for image
            draggableList.removeObject(parentBox)

            // remove the image holder now
            svgcontainer.removeChild(svgObject.parentElement)

            // update the count
            getObjectCount(-1 , typeofObject(svgObject.id))
        }
    }


    /**
     * @function shiftDown
     * @param {number} newY - the new oldY value that will be set after the UI is updated
     * @description shift the object down one slot in the tools location
     */
    function shiftDown( newY )
    {
        // check for an object below
        if( lowerObject )
        {
            lowerObject.insertAdjacentElement("afterend", shiftObjects)

            // move up one layer
            moveSvgDown(document.getElementById(shiftObjects.attributes.objectid.value))

            // clear elements
            upperObject = lowerObject
            lowerObject = shiftObjects.nextElementSibling
            oldY = newY
            yDirection = ""
        }
    }


    /**
     * @function documentMouseUpListener
     * @description when the mouse is released remove the listeners
     */
    function documentMouseUpListener()
    {
        // try to remove the mouse events for the dragging
        try{
            document.getElementById("toolbox").removeEventListener("mousemove", docucmentMouseOverHandler)
            toggleLayerUI("remove")
            window.removeEventListener("mouseup", documentMouseUpListener)
            document.removeEventListener("mousemove", getMouseDirection)
        }
        catch(err)
        {
            console.log("document listener remove failed")
        }

        // remove the selected class indicator for CSS and JS listeners
        if( shiftObjects ){ shiftObjects.classList.remove("selectedBox") }

        // remove element markers
        lowerObject = null
        upperObject = null
        shiftObjects = null
        oldX = 0
        oldY = 0
        yDirection = ""
    }

    /**
     * @function draggableStart
     * @param {MouseEvent} event - the mouse down event that starts the whole dragging function set
     * @description this function is resposible for initiating the dragging functionality inside the list area
     */
    function draggableStart(event)
    {  
        // capture the start y when the click happens
        oldY = event.pageY

        toggleLayerUI("add")

        event.target.addEventListener("mouseup", documentMouseUpListener, false)
        document.addEventListener("mousemove", getMouseDirection, false)

        // objects that need to shift
        try {
            shiftObjects = event.target.parentElement.parentElement

            // the element to put things below
            lowerObject = shiftObjects.nextElementSibling

            // the element to put things above
            upperObject = shiftObjects.previousElementSibling

            // put dragging stuff here
            document.getElementById("toolbox").addEventListener("mousemove", docucmentMouseOverHandler)

            // set shiftObjects css
            shiftObjects.classList.add("selectedBox")
        }
        catch(err)
        {
            console.log(err)
            upperObject, lowerObject, shiftObjects = null
        }
    }

    /**
     * @function docucmentMouseOverHandler
     * @description handler for when the user wants to drag an element up or down calls the shift functions respectivly
     */
    function docucmentMouseOverHandler ( event )
    {
        if(yDirection == "up")
        {
            // shift up of both objects are there
            if(shiftObjects && upperObject)
            {
                shiftUp( event.pageY )
            }
        }
        else if(yDirection == "down")
        {
            // shift down of both objects are there
            if(shiftObjects && lowerObject)
            {
                shiftDown( event.pageY )
            }
        }
    }

    // if the inobject is valid
    if( inobject )
    {
        // return the usable functions for the DraggableList interface
        return {

            /**
             * @function getDraggableList
             * @description getter for list of things inside the DraggableList
             */
            getDraggableList: () => {
                return DraggableList;
            },

            /**
             * @function getContainerObject
             * @description retrieve the draggable list container box
            */
            getContainerObject: () => {
                return DraggableListContainer;
            },

            /**
             * @function removeObject
             * @param {object} object - the draggable object that you want to remove from the list
             * @description removes draggable list items from the DraggableList object
             */
            removeObject: ( object ) => {
                DraggableListContainer.removeChild(object)
            },

            /**
             * @function removeDraggable
             * @param {object} startBtn - the button that will begin the undoing of the dragging.
             * @description this function removes all dragging functionality from the button you pass it. and then removes the window
             */
            removeDraggable: (startBtn) => {
                startBtn.addEventListener( "click", function(event) {
                    removeToolsWindow(event)
                })
            },

            /**
             * @function addDraggable
             * @param {object} startBtn - the button that will begin the dragging.
             * @description this needs to be called whenever a new draggable list object is 
             * added. Just pass the button that you want to be the dragging button into the addDraggable()
             */
            addDraggable: (startBtn) => {
                startBtn.addEventListener("mousedown", draggableStart)

                // add the window lister to remove active dragging
                window.addEventListener("mousedown", () => {
                    window.addEventListener("mouseup", documentMouseUpListener)
                })
            }
        }
    }    
}
