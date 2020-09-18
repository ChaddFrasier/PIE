/**
 * @file DraggableArea.js
 * @requires svgHelper.js
 * @fileoverview 
 *      This file is used in PIE and can be used as a basic framework for a draggable container in HTML using javascript listeners
 */

"use strict";

/**
 * @function constructor
 *       var dragObj = DraggableArea( HTML_Object )
 * @param {DOM Object} objectbox the object that you would like the dragging actions to take place inside of.
 */
function DraggableArea( objectbox=undefined )
{

    // ---------------- Private functions --------------------------
    function validNode( nodeName )
    {
        var testarray = ["svg"]
        // check test nodes for the current node name
        return (testarray.indexOf(nodeName) > -1) ? true: false;
    }

    function validDraggableNode( nodeName )
    {
        var testarray = ["g", "line", "rect"]
        // check test nodes for the current node name
        return (testarray.indexOf(nodeName) > -1) ? true: false;
    }

    /**
     * 
     * @param {Object} target 
     * @description this function loops until failure or until a expected / draggable parent is found
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

    // validate input
    if( objectbox &&
        objectbox.getAttribute("id") &&
        objectbox.nodeName &&
        validNode(objectbox.nodeName)
    ){
        // private variables
        var DragBoxContainer = objectbox;
        var draggingIcon = null,
            oldX = null,
            oldY = null,
            currentX = null,
            currentY = null;

        // ---------------- Private Functions Only Needed on Success --------------------------
        function dragObject ( event )
        {
            let svgP = createSVGPoint(event.clientX, event.clientY)

            if( draggingIcon.nodeName == "g" )
            {
                let scaledX = getScaledPoint(svgP.x, Number(draggingIcon.style.scale), 25)
                let scaledY = getScaledPoint(svgP.y, Number(draggingIcon.style.scale), 25)

                updateInputField(draggingIcon.getAttribute("id"), scaledX, scaledY)

                draggingIcon.style.transform = translateString(scaledX, scaledY)
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

            oldX = currentX
            oldY = currentY
        }
        
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
                    let svgP = createSVGPoint( event.clientX, event.clientY )
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

            // public variables
            
            // public functions

            /**
             * @function getContainerObject
             * @description return the DOM object assosiated with the DraggableObject
             */
            getContainerObject: function(){
                return DragBoxContainer;
            },
        };
    }
    else
    {
        return {
            NodeName: objectbox.nodeName
        };
    }
}