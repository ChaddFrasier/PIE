/**
 * @file DraggableList.js
 * 
 * @fileoverview This will a file that generates a draggable list box and an ordered array of list objects
 */

 "use strict";

 function DraggableList( inobject=undefined )
 {
    var DraggableList = [];
    var DraggableListContainer = inobject;

    var shiftObjects,
        lowerObject, 
        upperObject;
    /**
     * @function shiftUp
     * @description shift the object up one slot in the tools location
     */
    function shiftUp( pageY )
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
            oldY = pageY
        }
    }

    
    /**
     * @function removeToolsWindow
     * @param {_Event} event
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
            svgcontainer.removeChild(svgObject)

            // remove all icons using image remove btn
            if( document.getElementById("northIcon-" + svgObject.id) )
            {
                do{
                    svgcontainer.removeChild(document.getElementById("northIcon-" + svgObject.id))
                }while( document.getElementById("northIcon-" + svgObject.id) )
            }
        

            if( document.getElementById("sunIcon-" + svgObject.id) )
            {
                do{
                    svgcontainer.removeChild(document.getElementById("sunIcon-" + svgObject.id))
                }while( document.getElementById("sunIcon-" + svgObject.id) )    
            }
            
            if( document.getElementById("observerIcon-" + svgObject.id) )
            {
                do{
                    svgcontainer.removeChild(document.getElementById("observerIcon-" + svgObject.id))
                }while(document.getElementById("observerIcon-" + svgObject.id))    
            }
            
            if( document.getElementById("scalebarIcon-" + svgObject.id) )
            {
                do{
                    svgcontainer.removeChild(document.getElementById("scalebarIcon-" + svgObject.id))
                }while(document.getElementById("scalebarIcon-" + svgObject.id))    
            }
            
            // update the count
            getObjectCount(-1 , typeofObject(svgObject.id))
        }
    }


    /**
     * @function shiftDown
     * @description shift the object down one slot in the tools location
     */
    function shiftDown( pageY )
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
            oldY = pageY
            yDirection = ""
        }
    }

    
    /**
     * @function documentMouseUpListener
     * @description when the mouse is released remove the listeners
     * 
     * TODO: this couold be manipulated to let the user drag the box up and down contantly until the mouse is lifted
     */
    function documentMouseUpListener()
    {
        // try to set the mouse events for the dragging
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

        
        if( shiftObjects ){ shiftObjects.classList.remove("selectedBox") }
        
        // remove element markers
        lowerObject = null
        upperObject = null
        shiftObjects = null
        oldX = 0
        oldY = 0
        yDirection = ""
    }

    function draggableStart(event) {  
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
        }catch(err)
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

    if( inobject )
    {
        return {

            getDraggableList: () => {
                return DraggableList;
            },
    
            getContainerObject: () => {
                return DraggableListContainer;
            },

            removeObject: ( object ) => {
                DraggableListContainer.removeChild(object)
            },

            removeDraggable: (startBtn) => {
                startBtn.addEventListener( "click", function(event) {
                    removeToolsWindow(event)
                })
            },

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
 