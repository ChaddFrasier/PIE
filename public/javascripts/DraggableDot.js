"use strict"

var _this3 = null

class DraggableDot {
    constructor( SVGObject=undefined ) {
        this.rectstartx = 0;
        this.rectstarty = 0;
        this.rectwidth = 0;
        this.rectheight = 0;
        this.draggableSvg = SVGObject;
        _this3 = this
    }

    shiftKeyup( event )
    {
        // stop event chain
        event.preventDefault()

        // if the key being let go is the shift key
        if( event.key === "Shift" || event.key ==='shift' || event.key === 16 )
        {
            // unpause the drag stuff from the DraggableArea Object
            _this3.draggableSvg.unpauseDraggables();
            // reactivate the UI buttons
            changeButtonActivation("enable", 2)
            // update the main dom elements and inner children to class
            DraggableDot.applyClassToMainDOMandChildren("shifting", "remove")
            // remove the color the endpoints of the lines and the endpoints of the rectangles
            document.removeEventListener("keyup", _this3.shiftKeyup)
            // remove all draggable dots
            document.querySelectorAll("circle.draggableDot").forEach( dot => {
                dot.removeEventListener("mousedown", _this3.dotMouseDownFunction)
                _this3.draggableSvg.getContainerObject().removeChild( dot )
            });
        }
        return true
    }

    /**
     * @function dotMouseDownFunction
     * @param {Event} event 
     * @description capture the starting data for the mousemove function and activate the other listeners
     */
    dotMouseDownFunction( event )
    {
        // get the dot the user clicks and the svg it belongs to
        _this3.draggingDot = event.target;

        let svg = document.getElementById( _this3.draggingDot.getAttribute("spyId").split("-")[0] )

        // read in the starting data as floats
        _this3.rectstartx = parseFloat( _this3.draggingDot.getAttribute("cx") );
        _this3.rectstarty = parseFloat( _this3.draggingDot.getAttribute("cy") );
        _this3.rectwidth = parseFloat( svg.getAttribute('width') );
        _this3.rectheight = parseFloat( svg.getAttribute('height') );
        // activate the dragging and stopping function
        _this3.draggableSvg.getContainerObject().addEventListener( "mousemove", _this3.dotMouseMoveFunction );
        _this3.draggableSvg.getContainerObject().addEventListener( "mouseup", _this3.dotEndFunction );
        _this3.draggableSvg.getContainerObject().addEventListener( "mouseleave", _this3.dotEndFunction );
    }

    /**
     * @function dotEndFunction
     * @description clear the globals and reove the functions
     */
    dotEndFunction()
    {
        _this3.draggingDot = null
        _this3.rectstartx = 0
        _this3.rectstarty = 0
        _this3.rectwidth = 0
        _this3.rectheight = 0

        _this3.draggableSvg.getContainerObject().removeEventListener("mousemove", _this3.dotMouseMoveFunction)
        _this3.draggableSvg.getContainerObject().removeEventListener("mouseup", _this3.dotEndFunction)
        _this3.draggableSvg.getContainerObject().removeEventListener("mouseleave", _this3.dotEndFunction)
    }

    /**
     * @function dotMouseMoveFunction
     * @param {Event} event 
     * @description manipuate the rect and line elements and adjust the dots respectivley
     */
    dotMouseMoveFunction( event )
    {
        // make sure draggingDot is valid
        if( _this3.draggingDot !== null )
        {
            // check if the dot is for a line
            if( String(_this3.draggingDot.getAttribute("spyId")).indexOf('line') > -1 )
            {
                // get the svg point that the line uses
                var svgP = _this3.draggableSvg.svgAPI(event.pageX, event.pageY),
                    svgObject = document.getElementById( _this3.draggingDot.getAttribute("spyId").split("-")[0] ),
                    code = (_this3.draggingDot.getAttribute("spyId").split("-")[1] == 'start') ? 1 : 2;

                // set the point for the new line end
                _this3.draggingDot.setAttribute("cx", svgP.x)
                _this3.draggingDot.setAttribute("cy", svgP.y)
                svgObject.setAttribute(`x${code}`, svgP.x)
                svgObject.setAttribute(`y${code}`, svgP.y)

                // update the line input field
                updateLineXY( svgObject.id, svgP.x, svgP.y, code )
            }
            else if( String(_this3.draggingDot.getAttribute("spyId")).indexOf('rect') > -1 )
            {
                // get the scaled point on the svg and the rectangle dimensions
                var svgP = _this3.draggableSvg.svgAPI(event.pageX, event.pageY),
                    svgObject = document.getElementById( _this3.draggingDot.getAttribute("spyId").split("-")[0] ),
                    code = _this3.draggingDot.getAttribute("spyId").split("-")[1],
                    width = parseFloat(svgObject.getAttribute("width")),
                    height = parseFloat(svgObject.getAttribute("height")), 
                    newwidth = 0, 
                    newheight = 0;

                // use a different if statement for each corner of the rectangle
                if( code === "ptl" )
                {
                    newwidth = width - (svgP.x - _this3.rectstartx),
                    newheight = height - (svgP.y - _this3.rectstarty)

                    if( newheight > 0 )
                    {
                        // update the dot locations
                        _this3.draggingDot.setAttribute("cy", svgP.y)
                        svgObject.setAttribute("y", svgP.y)
                        svgObject.setAttribute( "height", newheight )
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-ptr']`)
                            .setAttribute("cy", svgP.y );
                        _this3.rectstarty = svgP.y
                    }
                    if( newwidth > 0 )
                    {
                        _this3.draggingDot.setAttribute("cx", svgP.x);
                        svgObject.setAttribute("x", svgP.x);
                        svgObject.setAttribute( "width", newwidth );
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-pbr']`)
                            .setAttribute("cy", svgP.y + newheight);
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-pbl']`)
                            .setAttribute("cx", svgP.x );
                        _this3.rectstartx = svgP.x
                    }

                    if( newwidth > 0 || newheight > 0 )
                    {
                        // standard drag update
                        updateRectDims( svgObject.id, _this3.rectstartx, _this3.rectstarty, newwidth, newheight)
                    }
                }
                else if( code === "ptr" )
                {
                    newwidth = width + (svgP.x - _this3.rectstartx),
                    newheight = height - (svgP.y - _this3.rectstarty)

                    if( newheight > 0 )
                    {
                        // update the dot location
                        _this3.draggingDot.setAttribute("cy", svgP.y);
                        svgObject.setAttribute("y", svgP.y);
                        svgObject.setAttribute( "height", newheight );
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-ptl']`)
                            .setAttribute("cy", svgP.y );
                        _this3.rectstarty = svgP.y
                    }
                    if( newwidth > 0 )
                    {
                        _this3.draggingDot.setAttribute("cx", svgP.x)
                        svgObject.setAttribute( "width", newwidth )
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-pbr']`)
                            .setAttribute("cx", svgP.x );
                        _this3.rectstartx = svgP.x
                    }

                    if( newwidth > 0 || newheight > 0 )
                    {
                        // standard drag update
                        updateRectDims( svgObject.id, _this3.rectstartx - newwidth, _this3.rectstarty, newwidth, newheight)
                    }
                }
                else if( code === "pbr" )
                {
                    newwidth = width + (svgP.x - _this3.rectstartx),
                    newheight = height + (svgP.y - _this3.rectstarty)

                    if( newheight > 0 )
                    {
                        // update the dot location
                        _this3.draggingDot.setAttribute("cy", svgP.y)
                        svgObject.setAttribute( "height", newheight )
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-pbl']`)
                            .setAttribute("cy", svgP.y );
                        _this3.rectstarty = svgP.y
                    }
                    if( newwidth > 0 )
                    {
                        _this3.draggingDot.setAttribute("cx", svgP.x)
                        svgObject.setAttribute( "width", newwidth )
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-ptr']`)
                            .setAttribute("cx", svgP.x );
                        _this3.rectstartx = svgP.x
                    }

                    if( newwidth > 0 || newheight > 0 )
                    {
                        // standard drag update
                        updateRectDims( svgObject.id, _this3.rectstartx - newwidth, _this3.rectstarty - newheight, newwidth, newheight)
                    }
                }
                else if( code === "pbl" )
                {
                    newwidth = width - (svgP.x - _this3.rectstartx),
                    newheight = height + (svgP.y - _this3.rectstarty);

                    if( newheight > 0 )
                    {
                        // update the dot location
                        _this3.draggingDot.setAttribute("cy", svgP.y)
                        svgObject.setAttribute( "height", newheight )
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-pbr']`)
                            .setAttribute("cy", svgP.y );
                        _this3.rectstarty = svgP.y
                    }
                    if( newwidth > 0 )
                    {
                        _this3.draggingDot.setAttribute("cx", svgP.x)
                        svgObject.setAttribute("x", svgP.x)
                        svgObject.setAttribute( "width", newwidth )
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-ptl']`)
                            .setAttribute("cx", svgP.x );
                        _this3.rectstartx = svgP.x
                    }

                    if( newwidth > 0 || newheight > 0 )
                    {
                        // standard drag update
                        updateRectDims( svgObject.id, _this3.rectstartx, _this3.rectstarty - newheight, newwidth, newheight)
                    }
                }
            }
        }
    }

    /**
     * @function createDot
     * @param {string} spyId the id of the 'spy' SVG Element
     * @param {float} x the cx of the dot
     * @param {float} y the cy of the dot
     * @description create and add a single dot to the svg element
     */
    static createDot( spyId, x, y )
    {
        // add a dot where one of the line points are
        var dot = document.createElementNS( "http://www.w3.org/2000/svg", "circle" );
        dot.setAttribute( "class", "draggableDot" );
        dot.setAttribute( "r", "13" );
        // get the x and y of all the points of the rectangles and lines
        dot.setAttribute( "cx", x );
        dot.setAttribute( "cy", y );
        dot.setAttribute( "spyId", spyId );
        dot.addEventListener( "mousedown", _this3.dotMouseDownFunction );
        _this3.draggableSvg.getContainerObject().append( dot );
    }


    /**
     * @function applyClassToMainDOMandChildren
     * @param {string} cls the class to apply
     * @param {'add' || 'remove'} interaction the key work to 'add' or 'remove'
     * @description this class simplified the part of the index.js that controlled the user cursor UI
     */
    static applyClassToMainDOMandChildren( cls, interaction ){
        
        switch (interaction) {
            case "remove":
                // add the pencil cursor icon to the main content objects
                document.getElementById("maincontent").childNodes.forEach((childel) => {
                    childel.classList.remove(cls)
                });
                // add the pencil cursor icon to the svg objects
                document.getElementById("figurecontainer").childNodes.forEach((childel) => {
                    childel.classList.remove(cls)
                });
                break;
        
            case "add":
                // add the pencil cursor icon to the main content objects
                document.getElementById("maincontent").childNodes.forEach((childel) => {
                    childel.classList.add(cls)
                });
                // add the pencil cursor icon to the svg objects
                document.getElementById("figurecontainer").childNodes.forEach((childel) => {
                    childel.classList.add(cls)
                });
                break;
        }    
    }

}// end of class


/**
 * @function updateLineXY
 * @param {string} id the id of the target line
 * @param {number} x the new x of that line
 * @param {number} y the new y of that line
 * @param {number} code used to distinguish from both ends of the line
 */
function updateLineXY( id, x, y, code )
{
    var linexList = document.querySelectorAll(`input[name='linex${code}input']`),
        lineyList = document.querySelectorAll(`input[name='liney${code}input']`);

    linexList.forEach( lineinputfield => {
        if( lineinputfield.getAttribute("objectid") == id )
        {
            lineinputfield.value = x
        }
    });
    lineyList.forEach( lineinputfield => {
        if( lineinputfield.getAttribute("objectid") == id )
        {
            lineinputfield.value = y
        }
    });
}

/**
 * @function updateRectDims
 * @param {string} id the id of the rectangle
 * @param {number} x the new x value of the rectangle
 * @param {number} y the new y value of the rectangle
 * @param {number} width the new width of the rectangle
 * @param {number} height the new height of rectangle
 */
function updateRectDims( id, x, y, width, height )
{
    var rectxList = document.querySelectorAll(`input[name='rectxinput']`),
        rectyList = document.querySelectorAll(`input[name='rectyinput']`),
        rectwList = document.querySelectorAll(`input[name='rectwidthinput']`),
        recthList = document.querySelectorAll(`input[name='rectheightinput']`);

    rectxList.forEach( rectinputfield => {
        if( rectinputfield.getAttribute("objectid") == id )
        {
            rectinputfield.value = x
        }
    });
    rectyList.forEach( rectinputfield => {
        if( rectinputfield.getAttribute("objectid") == id )
        {
            rectinputfield.value = y
        }
    });
    rectwList.forEach( rectinputfield => {
        if( rectinputfield.getAttribute("objectid") == id )
        {
            rectinputfield.value = width
        }
    });
    recthList.forEach( rectinputfield => {
        if( rectinputfield.getAttribute("objectid") == id )
        {
            rectinputfield.value = height
        }
    });
}