/**
 * @file
 * TODO:
 */
"use strict"
/**
 * @class DraggableSVG
 */
var _this = null;

class DraggableSVG {
    
    /**
     * 
     * @param {string} containerId 
     */
    constructor( containerId=undefined ) {
        // validate the input to the class constructor
        if( validNode(containerId) ) {
            // init class variables
            this.containerId = containerId;
            this.draggingIcon = null;
            this.oldX = null;
            this.oldY = null;
            this.currentX = null;
            this.currentY = null;
            this.paused = false;

            _this = this;
            document.getElementById( containerId ).addEventListener( "mousedown", this.dragHandler )
        }
    }

    /**
     * 
     */
    getContainerObject() {
        return document.getElementById( this.containerId )
    }
    /**
     * @function svgAPI
     * @description create  point that when given an x,y in client space returns and x,y in svg space
     */
    svgAPI(x, y) {
        return DraggableSVG.prototype.createSVGP( x, y );
    }

    /**
     * @function pauseDraggables
     * @description prevent dragging using flag
     */
    pauseDraggables() {
        this.getContainerObject().removeEventListener("mousedown", this.dragHandler );
        this.paused = true;
    }

    /**
     * @function unpauseDraggables
     * @description set the dragging flags to start capture again
     */
    unpauseDraggables() {
        // add the main listener to the object targeted by DraggableArea() init function
        this.getContainerObject().addEventListener("mousedown", this.dragHandler );
        this.paused = false;
    }

    /**
     * @function dragHandler
     * @param {_Event} event the mouse move event
     * @description This function drags the elemnt inside the DraggableArea that was clicked on 
    */
    dragHandler ( event )
    {
        event.preventDefault();
        // IF THE NODE IS AN IMAGE IGNORE
        // get the parent container of the target if it is valid
        _this.draggingIcon = getIconParentContainer( event.target );
        if(_this.draggingIcon.classList.contains("marker"))
        {
            _this.draggingIcon = _this.draggingIcon.parentElement;
        }
        // if the drag icon is found to be valid then initiate the dragging functions
        if( _this.draggingIcon != null && !_this.paused && _this.draggingIcon.getAttribute("id") != "bgelement")
        {   
            console.log(_this.containerId)
            // requires svgHelper.js
            let svgP = DraggableSVG.prototype.createSVGP( event.clientX, event.clientY );
            // set the oldX for later
            _this.oldX = svgP.x;
            _this.oldY = svgP.y;
            // start dragging events
            document.getElementById( _this.containerId ).addEventListener("mousemove", _this.dragObject );
            document.getElementById( _this.containerId ).addEventListener("mouseleave", _this.endDrag );
            document.getElementById( _this.containerId ).addEventListener("mouseup", _this.endDrag );
            // add class for 'dragging' cursor
            _this.draggingIcon.classList.add('dragging');
            document.getElementById( _this.containerId ).classList.add('dragging');
        }
    }


    /**
     * @function createSVGP
     * @param {number} x - x translate
     * @param {number} y - y translate
     * @description this function creates a svg point from the svgContainer matrix and transforms it into the client space.
     *  This is used to get the pixel in the svg that was clicked when dropping icons on screen
     */
    createSVGP( x, y )
    {
        if( _this.containerId !== undefined ){
            // create a blank svg point on screen
            let pt = document.getElementById( _this.containerId ).createSVGPoint();
            // Then Scale the x and y into the point object 
            pt.x = parseFloat( x );
            pt.y = parseFloat( y );
            if( !isNaN( pt.x ) && !isNaN( pt.y ) )
            {
                /**
                 * Apply a matrix tranform on the new point using the transform matrix of the target svg
                 *  Note: must inverse the matrix before tranforming the points
                 * */ 
                return pt.matrixTransform( document.getElementById( _this.containerId ).getScreenCTM().inverse() );
            }
            else
            {
                console.error( "Error: SVG Point Mapping Failed" )
            }
        }
        else {
            console.log("Error: ContainerId = NULL")
        }
    }

    /**
    * @function dragObject
    * @param {_Event} event the mouse move event to get the location of the mouse
    * @description Function that adjusts the element's transform that is currently being clicked on inside the DraggableArea.
    */
    dragObject ( event )
    {
        event.preventDefault();
        // transform the mouse event location to the svg subspace
        let svgP = DraggableSVG.prototype.createSVGP( event.clientX, event.clientY );
        // drag all icons and image things at one time
        if( _this.draggingIcon.nodeName == "g" && _this.draggingIcon.getAttribute("id").indexOf("-hg") > -1)
        {
            // get the current mouse location with no object body attached
            _this.currentX = getScaledPoint(svgP.x, 1, 1);
            _this.currentY = getScaledPoint(svgP.y, 1, 1);

            // add the class to show the cursor 'dragging'
            _this.draggingIcon.classList.add('dragging');
            document.getElementById( _this.containerId ).classList.add('dragging');

            // drag each child
            _this.draggingIcon.childNodes.forEach(child => {
                // init the starting data
                let childScale = 1,
                    origX = parseFloat(child.getAttribute("x")),
                    origY = parseFloat( child.getAttribute("y"));
                    // calculate the new x value given the scale and the old x subtracted by the new x
                let newX = origX + (_this.currentX - _this.oldX)/childScale,
                    newY = origY + (_this.currentY - _this.oldY)/childScale;
                // if the icon in an image then manipulate the image
                if( child.nodeName === "image")
                {
                    // update the input fields using the id of the draggingObject
                    updateInputField( child.getAttribute("id"), newX, newY );
                    updateImageLocation( child.getAttribute("id"), newX, newY);
                }
                else
                {
                    // update the input fields using the id of the draggingObject
                    updateInputField( child.getAttribute("id"), newX*childScale, newY*childScale );
                    // set the new icon transform using the uniform setter function
                    child.setAttribute("x", newX);
                    child.setAttribute("y", newY);
                }  
            });
        }
        else if( _this.draggingIcon.nodeName == "svg" ) // 'svg' nodes house complex icons like the north arrow
        {
            var sc = undefined;
            // try and grab the scale from the holder group
            try{
                sc = parseFloat(document.getElementById(_this.draggingIcon.getAttribute("objectid")+ "-hg").getAttribute("transform").replace("scale(",""))
            }
            catch(err)
            {
                sc = 1
            }
            // get the current mouse location with no body to the rect
            _this.currentX = getScaledPoint(svgP.x, 1, 1);
            _this.currentY = getScaledPoint(svgP.y, 1, 1);

            // add the class to show the cursor 'dragging'
            _this.draggingIcon.firstElementChild.classList.add('dragging');
            document.getElementById( _this.containerId ).classList.add('dragging');

            // get the x and y of the new point using the diffrence of the old and current mouse locations
            let y = Number(_this.draggingIcon.getAttribute("y")) + (_this.currentY - _this.oldY);
            let x = Number(_this.draggingIcon.getAttribute("x")) + (_this.currentX - _this.oldX);
            // update the input fields using the id of the draggingObject
            updateInputField( _this.draggingIcon.getAttribute("id"), x, y );
            // set the new icon transform using the uniform setter function
            _this.draggingIcon.setAttribute("x", x);
            _this.draggingIcon.setAttribute("y", y);
        }
        else if( _this.draggingIcon.nodeName == "rect" && !_this.draggingIcon.classList.contains("marker") )
        {
            // get the current mouse location with no body to the rect
            _this.currentX = getScaledPoint(svgP.x, 1, 1);
            _this.currentY = getScaledPoint(svgP.y, 1, 1);

            // add the class to show the cursor 'dragging'
            _this.draggingIcon.classList.add('dragging');
            document.getElementById( _this.containerId ).classList.add('dragging');

            // get the x and y of the new point using the diffrence of the old and current mouse locations
            let y = Number(_this.draggingIcon.getAttribute("y")) + (_this.currentY - _this.oldY);
            let x = Number(_this.draggingIcon.getAttribute("x")) + (_this.currentX - _this.oldX);
            // set the icon x and y
            _this.draggingIcon.setAttribute("x", x);
            _this.draggingIcon.setAttribute("y", y);
            // update the input fields
            updateInputField(_this.draggingIcon.getAttribute("id"), x, y);
        }
        else if( _this.draggingIcon.nodeName == "line" )
        {
            // get transformed mouse position
            _this.currentX = getScaledPoint(svgP.x, 1, 1);
            _this.currentY = getScaledPoint(svgP.y, 1, 1);
            
            // add the class to show the cursor 'dragging'
            _this.draggingIcon.classList.add('dragging');
            document.getElementById( _this.containerId ).classList.add('dragging');

            // get the new location of all the points of the line element
            let x1 = Number(_this.draggingIcon.getAttribute("x1")) + (_this.currentX - _this.oldX),
                y1 = Number(_this.draggingIcon.getAttribute("y1")) + (_this.currentY - _this.oldY),
                x2 = Number(_this.draggingIcon.getAttribute("x2")) + (_this.currentX - _this.oldX),
                y2 = Number(_this.draggingIcon.getAttribute("y2")) + (_this.currentY - _this.oldY);
            // set the new location of the line and uodate the line input fields
            _this.draggingIcon.setAttribute("x1", x1);
            _this.draggingIcon.setAttribute("y1", y1);
            _this.draggingIcon.setAttribute("x2", x2);
            _this.draggingIcon.setAttribute("y2", y2);
            updateInputField(_this.draggingIcon.getAttribute("id"), x1, y1, x2, y2);
        }
        // update the old location to the current after every cycle
        _this.oldX = _this.currentX;
        _this.oldY = _this.currentY;
    }


    /**
    * @function endDrag
    * @param {void}
    * @description Trys to remove all the event listeners from the svgcontainer to change the location of the icon and then erases the memory at the variables
    */
    endDrag( )
    {
        // copy the dragcontainer object
        let svgcontainer = document.getElementById( _this.containerId );
        // attempt to remove the dragging listeners
        try{
            svgcontainer.removeEventListener("mousemove", _this.dragObject );
            svgcontainer.removeEventListener("mouseleave", _this.endDrag );
            svgcontainer.removeEventListener("mouseup", _this.endDrag );
        }catch( err )
        {
            // log an error but dont fail
            console.log(err)
        }
        // remove the class to show the cursor 'dragging'
        _this.draggingIcon.classList.remove('dragging');
        svgcontainer.classList.remove('dragging');

        // reset all data
        _this.draggingIcon = null;
        _this.oldX = null;
        _this.oldY = null;
        _this.currentX = null;
        _this.currentY = null;
    }
} // End DraggableSVG Class


// Private Class Functions
/**
* @function validNode
* @param {*} containerId 
*/
function validNode( containerId )
{
    // the function defaults to failure
    let returnArg = false;
    // check node for existence and svg nodeName
    returnArg = document.getElementById( containerId ) ? true : false
    returnArg = ['svg'].indexOf( document.getElementById( containerId ).nodeName ) > -1 ? true : false;

    return returnArg;
}

/**
 * @function getIconParentContainer
 * @param {Object} target 
 * @description this function loops until failure or until a expected / draggable parent is found (Usually Fails in 4 to 5 loops)
 */
function getIconParentContainer( target )
{
    let testarray = ["g", "line", "rect"];
        
    try {
        while( !( target == null )
        && testarray.indexOf(target.nodeName) <= -1 && target.classList.contains("holder") )
        {
            target = target.parentElement;
        }
    }
    catch(err)
    {
        console.log(err);
    }
    return target;
}