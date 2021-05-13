/**
 * @requires svgHelper.js
 */
var _this2 = null;

class DraggableMenu {
    constructor( parentId=undefined ) {

        if ( parentId !== undefined )
        {
            this.parentId = parentId;
            this.DraggableList = [];
            this.DraggableListContainer = this.getMenuParent();
            this.shiftObjects;
            this.lowerObject;
            this.upperObject;
            this.xDirection = "";
            this.yDirection = "";
            this.oldX = 0;
            this.update = false;
            this.oldY = 0;
            this.sensitivity = 55;
    
            _this2 = this;
        }
    }

    getMenuParent() {
        return document.getElementById( this.parentId )
    }

    /**
     * @function removeObject
     * @param {object} object - the draggable object that you want to remove from the list
     * @description removes draggable list items from the DraggableList object
     */
    removeObject( object ) {
        this.getMenuParent().removeChild(object)
    }

    /**
     * @function addDraggable
     * @param {object} startBtn - the button that will begin the dragging.
     * @description this needs to be called whenever a new draggable list object is 
     * added. Just pass the button that you want to be the dragging button into the addDraggable()
     */
    addDraggable(startBtn) {
        startBtn.addEventListener("mousedown", DraggableMenu.draggableStart)
        // add the window lister to remove active dragging
        window.addEventListener("mousedown", () => {
            window.addEventListener("mouseup", DraggableMenu.documentMouseUpListener, false)
        })
    }
    /**
     * @function draggableStart
     * @param {MouseEvent} event - the mouse down event that starts the whole dragging function set
     * @description this function is resposible for initiating the dragging functionality inside the list area
     */
    static draggableStart(event)
    {  
        // capture the start y when the click happens
        _this2.oldY = event.pageY;
        // add class to main page
        toggleLayerUI("add", "hand");
        // add the dragging functions
        document.addEventListener("mousemove", DraggableMenu.getMouseDirection, false);
        document.addEventListener("mouseup", DraggableMenu.documentMouseUpListener, false);
        // objects that need to shift
        try {
            _this2.shiftObjects = event.target.parentElement.parentElement;
            // the element to put things below
            _this2.lowerObject = _this2.shiftObjects.nextElementSibling;
            // the element to put things above
            _this2.upperObject = _this2.shiftObjects.previousElementSibling;
            // put dragging stuff here
            document.getElementById("toolbox").addEventListener("mousemove", DraggableMenu.documentMouseOverListener);
            // set shiftObjects css
            _this2.shiftObjects.classList.add("selectedBox");
        }
        catch(err)
        {
            // if error then init to null
            _this2.upperObject, _this2.lowerObject, _this2.shiftObjects = null;
        }
    }

    /**
     * @function documentMouseUpListener
     * @description when the mouse is released remove the listeners
     */
    static documentMouseUpListener()
    {
        // try to remove the mouse events for the dragging
        try{
            document.getElementById("toolbox").removeEventListener("mousemove", DraggableMenu.documentMouseUpListener);
            toggleLayerUI("remove", "hand");
            window.removeEventListener("mouseup", DraggableMenu.documentMouseUpListener);
            document.removeEventListener("mousemove", DraggableMenu.getMouseDirection);
        }
        catch(err)
        {
            console.log("document listener remove failed");
        }
        // remove the selected class indicator for CSS and JS listeners
        if( _this2.shiftObjects )
        { 
            _this2.shiftObjects.classList.remove("selectedBox")
        }
        // remove element markers
        _this2.lowerObject = null;
        _this2.upperObject = null;
        _this2.shiftObjects = null;
        _this2.oldX = 0;
        _this2.oldY = 0;
        _this2.yDirection = "";
    }

    /**
     * @function documentMouseOverListener
     * @description handler for when the user wants to drag an element up or down calls the shift functions respectivly
     */
    static documentMouseOverListener ( event )
    {
        if( _this2.yDirection == "up")
        {
            // shift up of both objects are there
            if(_this2.shiftObjects && _this2.upperObject)
            {
                DraggableMenu.shiftUp( event.pageY );
            }
        }
        else if(_this2.yDirection == "down")
        {
            // shift down of both objects are there
            if(_this2.shiftObjects && _this2.lowerObject)
            {
                DraggableMenu.shiftDown( event.pageY );
            }
        }
    }

    /**
     * @function shiftUp
     * @param {number} newY - the pageY value that will become the new "oldY" in this object
     * @description shift the object up one slot in the tools location
     */
    static shiftUp( newY )
    {
        // check for a none outer object as the upper element
        if( _this2.upperObject.getAttribute("objectid") )
        {
            // insert the element above the sifting elements
            _this2.getMenuParent().insertBefore(_this2.shiftObjects, _this2.upperObject);
            // move up one layer
            moveSvgUp(document.getElementById(_this2.shiftObjects.attributes.objectid.value));
            // clear elements
            _this2.lowerObject = _this2.upperObject;
            _this2.upperObject = _this2.shiftObjects.previousElementSibling;
            _this2.yDirection = "";
            _this2.oldY = newY;
        }
    }
    /**
     * @function shiftDown
     * @param {number} newY - the new oldY value that will be set after the UI is updated
     * @description shift the object down one slot in the tools location
     */
    static shiftDown( newY )
    {
        // check for an object below
        if( _this2.lowerObject )
        {
            _this2.lowerObject.insertAdjacentElement("afterend", _this2.shiftObjects);
            // move up one layer
            moveSvgDown(document.getElementById(_this2.shiftObjects.attributes.objectid.value));
            // clear elements
            _this2.upperObject = _this2.lowerObject;
            _this2.lowerObject = _this2.shiftObjects.nextElementSibling;
            _this2.oldY = newY;
            _this2.yDirection = "";
        }
    }

    /**
    * @function getMouseDirection
    * @param {_MouseEvent} e - the event that is happening at the time of calling
    * @description get the mouse direction as a string relative to the sensitivity level set globally
    */
    static getMouseDirection( e )
    {
        //deal with the horizontal case
        if ( _this2.oldX + _this2.sensitivity < e.pageX )
        {
            // update right
            _this2.update = true;
            _this2.xDirection = "right";
            // new anchor point
            _this2.oldX = e.pageX;
        } 
        else if( _this2.oldX - _this2.sensitivity > e.pageX )
        {
            // set update left
            _this2.update = true;
            _this2.xDirection = "left";
            // set new anchor point
            _this2.oldX = e.pageX;
        }

        //deal with the vertical case
        if ( _this2.oldY + _this2.sensitivity < e.pageY )
        {
            // set update down
            _this2.yDirection = "down";
            _this2.update = true;
            // set new anchor point
            _this2.oldY = e.pageY;
        }
        else if ( _this2.oldY - _this2.sensitivity > e.pageY )
        {
            // update the page and set direction up
            _this2.update = true;
            _this2.yDirection = "up";
            // set new anchor point
            _this2.oldY = e.pageY;
        }
        else
        {
            // direction not determined using current sensetivity
            _this2.yDirection = "";
        }
    }

} // End DraggableMenu class

/**
 * @function toggleLayerUI
 * @param {"add"|"remove"} activation tells the func to add or remove classes
 * @description add or remove class from all major parts of the UI
 */
function toggleLayerUI( activation, cls )
{
    let requiredLayers = [ document.getElementById("toolbox"), document.getElementById("editbox") ]

    requiredLayers.forEach(div => {
        switch(activation)
        {
            case "remove":
                div.classList.remove(cls)
                break
            
            case "add":
                div.classList.add(cls)
                break
        }
    });
}

/**
 * @function moveSvgUp
 * @param {Node} element - the element to shift layers
 * @description move the svg element up to the top of the layers of the svg
 */
function moveSvgUp( element )
{
    // run the last insert to place the image on the bottom of the icons
    element.nextSibling.insertAdjacentElement("afterend", element) 
}