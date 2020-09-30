/**
 * @file DraggableArea.js
 * @requires svgHelper.js
 * @fileoverview 
 *      This file is used in PIE and can be used as a basic framework for a draggable container in HTML using javascript listeners (No JQuery needed)
*/

"use strict";
/**
 * @function constructor
 *       var dragObj = DraggableArea( HTML_Object )
 * @param {DOM Object} objectbox the object that you would like the dragging actions to take place inside of.
 */
function DraggableArea( objectbox=undefined )
{
    // init all required variables for dragging
    var draggingIcon = null,
        oldX = null,
        oldY = null,
        currentX = null,
        currentY = null;

    // ---------------- Private functions --------------------------

    /**
     * @function validNode
     * @param {string} nodeName
     * @description this function only checks that the node in question is valid for becoming a draggable area
     * @returns {Boolean} True if the node can be converted into draggable area; False otherwise.
     */
    function validNode( nodeName )
    {
        var testarray = ["svg"]
        // check test nodes for the current node name
        return (testarray.indexOf(nodeName) > -1) ? true: false;
    }

    /**
     * @function validDraggableNode 
     * @param {string} nodeName 
     * @description this function is only designed to return true in the case that the dragging object is a valid node to drag
     * @returns {Boolean} True if the node can be dragged; False otherwise.
     */
    function validDraggableNode( nodeName )
    {
        var testarray = ["g", "line", "rect"]
        // check test nodes for the current node name
        return (testarray.indexOf(nodeName) > -1) ? true: false;
    }

    /**
     * @function createSVGPoint
     * @param {number} x - x translate
     * @param {number} y - y translate
     * @description this function creates a svg point from the svgContainer matrix and transforms it into the client space.
     *  This is used to get the pixel in the svg that was clicked when dropping icons on screen
     */
    function createSVGP( x, y )
    {
        // create a blank svg point on screen
        let pt = DragBoxContainer.createSVGPoint()
        
        // Then Scale the x and y into the point object 
        pt.x = parseFloat( x )
        pt.y = parseFloat( y )

        if( !isNaN( pt.x ) && !isNaN( pt.y ) )
        {
            /**
             * Apply a matrix tranform on the new point using the transform matrix of the target svg
             *  Note: must inverse the matrix before tranforming the points
             * */ 
            return pt.matrixTransform( DragBoxContainer.getScreenCTM().inverse() )
        }
        else
        {
            console.error( "Error: SVG Point Mapping Failed" )
        }
    }

    /**
     * @function getIconParentContainer
     * @param {Object} target 
     * @description this function loops until failure or until a expected / draggable parent is found (Usually Fails in 4 to 5 loops)
     * TODO: this could be structured better by liitig the while loop to a predictable and expected layer depth. because every loop represents a nested child element
     */
    function getIconParentContainer( target )
    {
        try {
            while( !( target == null )
            && !validDraggableNode(target.nodeName) )
            {
                target = target.parentElement
            }
        }catch(err)
        {
            console.log(err)
        }

        return target
    }

    // ---------------- ^ End Private functions ^ --------------------------

    // ----------------- Main code section ----------------------------

    // validate initialization of DraggableObject
    if( objectbox &&
        objectbox.getAttribute("id") &&
        objectbox.nodeName &&
        validNode(objectbox.nodeName)
    ){
        // private variables
        var DragBoxContainer = objectbox;

        // ---------------- Private Listener Functions ( Only Needed on Successful Init ) --------------------------
        /**
         * 
         * @param {*} event 
         */
        function dragObject ( event )
        {
            // transform the mouse event location to the svg subspace
            let svgP = createSVGP(event.clientX, event.clientY)

            if( draggingIcon.nodeName == "g" )
            {
                // get the scaled points and the mouse event
                let scaledX = getScaledPoint(svgP.x, getTransform("scale", draggingIcon), draggingIcon.getBBox().width)
                let scaledY = getScaledPoint(svgP.y, getTransform("scale", draggingIcon), draggingIcon.getBBox().height)

                // update the input fields using the id of the draggingObject
                updateInputField(draggingIcon.getAttribute("id"), scaledX, scaledY)

                // set the new icon transform using the uniform setter function
                setTransform(draggingIcon, scaleString(getTransform("scale", draggingIcon)), translateString(scaledX, scaledY))
            }
            else if( draggingIcon.nodeName == "rect" )
            {
                currentX = getScaledPoint(svgP.x, 1, 1)
                currentY = getScaledPoint(svgP.y, 1, 1)

                let y = Number(draggingIcon.getAttribute("y")) + (currentY - oldY)
                let x = Number(draggingIcon.getAttribute("x")) + (currentX - oldX)

                draggingIcon.setAttribute("x", x)
                draggingIcon.setAttribute("y", y)

                updateInputField(draggingIcon.getAttribute("id"), x, y)

            }
            else if( draggingIcon.nodeName == "line" )
            {

                // get first mouse position
                currentX = getScaledPoint(svgP.x, 1, 1)
                currentY = getScaledPoint(svgP.y, 1, 1)

                let x1 = Number(draggingIcon.getAttribute("x1")) + (currentX - oldX)
                let y1 = Number(draggingIcon.getAttribute("y1")) + (currentY - oldY)
                let x2 = Number(draggingIcon.getAttribute("x2")) + (currentX - oldX)
                let y2 = Number(draggingIcon.getAttribute("y2")) + (currentY - oldY)
                
                draggingIcon.setAttribute("x1", x1)
                draggingIcon.setAttribute("y1", y1)
                draggingIcon.setAttribute("x2", x2)
                draggingIcon.setAttribute("y2", y2)

                updateInputField(draggingIcon.getAttribute("id"), x1, y1, x2, y2)
            }

            oldX = currentX;
            oldY = currentY;
        }
        
        /**
         * @function
         * @param {void}
         */
        function endDrag( )
        {
            let svgcontainer = DragBoxContainer

            try{
                svgcontainer.removeEventListener("mousemove", dragObject )
                svgcontainer.removeEventListener("mouseleave", endDrag )
                svgcontainer.removeEventListener("mouseup", endDrag )
            }catch( err )
            {
                console.log(err)
            }

            draggingIcon.classList.remove('dragging')
            svgcontainer.classList.remove('dragging')

            draggingIcon = null
            oldX = null
            oldY = null
            currentX = null
            currentY = null
        }

        /**
         * 
         * @param {_Event} event 
         */
        function dragHandler ( event )
        {
            let svgcontainer = DragBoxContainer

            if(event.target.nodeName != "image")
            {
                draggingIcon = getIconParentContainer( event.target )

                console.log("The dragging object is: ")
                console.log(draggingIcon)

                if( draggingIcon != null )
                {   
                    // requires svgHelper.js
                    let svgP = createSVGP( event.clientX, event.clientY )
                    oldX = svgP.x
                    oldY = svgP.y
            
                    svgcontainer.addEventListener("mousemove", dragObject )
                    svgcontainer.addEventListener("mouseleave", endDrag )
                    svgcontainer.addEventListener("mouseup", endDrag )

                    draggingIcon.classList.add('dragging')
                    svgcontainer.classList.add('dragging')

                }
            }
        }
        // ---------------- End Private functions 2 --------------------------


        // add the main listener to the object target by Draggable
        DragBoxContainer.addEventListener("mousedown", dragHandler )

        // return the DraggableArea object
        return {

            /**
             * @function getContainerObject
             * @description return the DOM object assosiated with the DraggableObject
             */
            getContainerObject: function(){
                return DragBoxContainer;
            },
            /**
             * @function svgAPI
             * @description
             */
            svgAPI: (x, y) => {
                return createSVGP( x, y )
            }
        };
    }
    else
    {
        // on failure return the failed nodeName
        return {
            NodeName: objectbox.nodeName
        };
    }
}