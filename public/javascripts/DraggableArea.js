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
        currentY = null,
        paused = false;

    // ---------------- Private functions --------------------------

    /**
     * @function validNode
     * @param {string} nodeName
     * @description this function only checks that the node in question is valid for becoming a draggable area
     * @returns {Boolean} True if the node can be converted into draggable area; False otherwise.
     */
    function validNode( nodeName )
    {
        var testarray = ["svg"];
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
        var testarray = ["g", "line", "rect"];

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
        let pt = DragBoxContainer.createSVGPoint();
        
        // Then Scale the x and y into the point object 
        pt.x = parseFloat( x );
        pt.y = parseFloat( y );

        if( !isNaN( pt.x ) && !isNaN( pt.y ) )
        {
            /**
             * Apply a matrix tranform on the new point using the transform matrix of the target svg
             *  Note: must inverse the matrix before tranforming the points
             * */ 
            return pt.matrixTransform( DragBoxContainer.getScreenCTM().inverse() );
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
     */
    function getIconParentContainer( target )
    {
        try {
            while( !( target == null )
            && !validDraggableNode(target.nodeName) && target.classList.contains("holder") )
            {
                target = target.parentElement;
            }
        }catch(err)
        {
            console.log(err);
        }

        return target;
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
         * @function dragObject
         * @param {_Event} event the mouse move event to get the location of the mouse
         * @description Function that adjusts the element's transform that is currently being clicked on inside the DraggableArea.
         */
        function dragObject ( event )
        {
            event.preventDefault();
            // transform the mouse event location to the svg subspace
            let svgP = createSVGP(event.clientX, event.clientY);

            if( draggingIcon.nodeName == "g" && draggingIcon.getAttribute("id").indexOf("-hg") > -1)
            {
                // get the current mouse location with no object body attached
                currentX = getScaledPoint(svgP.x, 1, 1);
                currentY = getScaledPoint(svgP.y, 1, 1);

                draggingIcon.childNodes.forEach(child => {

                    let childScale = 1;
                    let origX = parseFloat(child.getAttribute("x"));
                    let origY = parseFloat( child.getAttribute("y"));

                    let newX = origX + (currentX - oldX)/childScale;
                    let newY = origY + (currentY - oldY)/childScale;

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
            else if( draggingIcon.nodeName == "svg" ) // 'svg' nodes house complex icons like the north arrow
            {
                // get only mouse position, not adjusted for icon size and convert to parent element matrix
                currentX = getScaledPoint(svgP.x, 1, parseFloat(draggingIcon.getAttribute("width")) );
                currentY = getScaledPoint(svgP.y, 1, parseFloat(draggingIcon.getAttribute("height")) );


                // update the input fields using the id of the draggingObject
                updateInputField( draggingIcon.getAttribute("id"), currentX, currentY );

                // set the new icon transform using the uniform setter function
                draggingIcon.setAttribute("x", currentX);
                draggingIcon.setAttribute("y", currentY);
            }
            else if( draggingIcon.nodeName == "rect" )
            {
                // get the current mouse location with no body to the rect
                currentX = getScaledPoint(svgP.x, 1, 1);
                currentY = getScaledPoint(svgP.y, 1, 1);

                // get the x and y of the new point using the diffrence of the old and current mouse locations
                let y = Number(draggingIcon.getAttribute("y")) + (currentY - oldY);
                let x = Number(draggingIcon.getAttribute("x")) + (currentX - oldX);

                // set the icon x and y
                draggingIcon.setAttribute("x", x);
                draggingIcon.setAttribute("y", y);
                // update the input fields
                updateInputField(draggingIcon.getAttribute("id"), x, y);

            }
            else if( draggingIcon.nodeName == "line" )
            {
                // get transformed mouse position
                currentX = getScaledPoint(svgP.x, 1, 1);
                currentY = getScaledPoint(svgP.y, 1, 1);

                // get the new location of all the points of the line element
                let x1 = Number(draggingIcon.getAttribute("x1")) + (currentX - oldX);
                let y1 = Number(draggingIcon.getAttribute("y1")) + (currentY - oldY);
                let x2 = Number(draggingIcon.getAttribute("x2")) + (currentX - oldX);
                let y2 = Number(draggingIcon.getAttribute("y2")) + (currentY - oldY);
                
                // set the new location of the line and uodate the line input fields
                draggingIcon.setAttribute("x1", x1);
                draggingIcon.setAttribute("y1", y1);
                draggingIcon.setAttribute("x2", x2);
                draggingIcon.setAttribute("y2", y2);
                updateInputField(draggingIcon.getAttribute("id"), x1, y1, x2, y2);
            }

            // update the old location to the current after every cycle
            oldX = currentX;
            oldY = currentY;
        }
        
        /**
         * @function endDrag
         * @param {void}
         * @description Trys to remove all the event listeners from the svgcontainer to change the location of the icon and then erases the memory at the variables
         */
        function endDrag( )
        {
            let svgcontainer = DragBoxContainer;

            try{
                svgcontainer.removeEventListener("mousemove", dragObject );
                svgcontainer.removeEventListener("mouseleave", endDrag );
                svgcontainer.removeEventListener("mouseup", endDrag );
            }catch( err )
            {
                console.log(err)
            }

            draggingIcon.classList.remove('dragging');
            svgcontainer.classList.remove('dragging');

            draggingIcon = null;
            oldX = null;
            oldY = null;
            currentX = null;
            currentY = null;
        }

        /**
         * @function dragHandler
         * @param {_Event} event the mouse move event
         * @description This function drags the elemnt inside the DraggableArea that was clicked on 
         */
        function dragHandler ( event )
        {
            event.preventDefault();

            // IF THE NODE IS AN IMAGE IGNORE
        
            // get the parent container of the target if it is valid
            draggingIcon = getIconParentContainer( event.target );

            if(draggingIcon.classList.contains("marker"))
            {
                draggingIcon = draggingIcon.parentElement;
            }

            console.log(draggingIcon)

            // if the drag icon is found to be valid then initiate the dragging functions
            if( draggingIcon != null && !paused && draggingIcon.getAttribute("id") != "bgelement")
            {   
                // requires svgHelper.js
                let svgP = createSVGP( event.clientX, event.clientY );
                oldX = svgP.x;
                oldY = svgP.y;

                console.log(event)
        
                DragBoxContainer.addEventListener("mousemove", dragObject );
                DragBoxContainer.addEventListener("mouseleave", endDrag );
                DragBoxContainer.addEventListener("mouseup", endDrag );

                draggingIcon.classList.add('dragging');
                DragBoxContainer.classList.add('dragging');
            }
        }
        // ---------------- End Private functions 2 --------------------------

        // add the main listener to the object targeted by DraggableArea() init function
        DragBoxContainer.addEventListener("mousedown", dragHandler );

        // return the DraggableArea object function helpers
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
                return createSVGP( x, y );
            },

            /**
             * 
             */
            pauseDraggables: () => {
                DragBoxContainer.removeEventListener("mousedown", dragHandler );
                paused = true;
            },

            /**
             * 
             */
            unpauseDraggables: () => {
                // add the main listener to the object targeted by DraggableArea() init function
                DragBoxContainer.addEventListener("mousedown", dragHandler );
                paused = false;
            }
        };
    }
    else
    {
        // on failure return the failed nodeName that could not resolve to a proper DraggableArea
        return {
            NodeName: objectbox.nodeName
        };
    }
}