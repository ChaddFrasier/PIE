/**
 * 
 * @file svgHelper.js
 * @fileoverview file for helping the DraggableArea and DraggableList files
*/

"use strict";

// Namespaces Global
var NS = {
        xhtml:"http://www.w3.org/1999/xhtml",
        svg: "http://www.w3.org/2000/svg"
    };

/**
 * @function setSVGBackground
 * @param {Node} svg 
 * @param {string} color 
 * @description just changes the background of the specified element
 */
function setSVGBackground( id, color )
{
    document.getElementById(id).setAttribute("fill", color);
}

/**
 * @function detectLeftMouse
 * 
 * @param { event } evt 
 * 
 * @see https://github.com/ChaddFrasier/PIPS/blob/master/js/index.js detectLeftButton
 * @description this function takes in an event and checks to see if it was a left click event
*/
function detectLeftMouse(evt) {
    // if evt is null then get the currently active window event
    evt = evt || window.event;

    // if browser has which then use which code check
    if ("which" in evt) {
        return evt.which == 1;
    }
    
    // otherwise check for the button code
    var button = evt.buttons || evt.button;   
    return button == 1;
}

/**
 * @function detectRightMouse
 * 
 * @param { event } evt 
 * 
 * @see https://github.com/ChaddFrasier/PIPS/blob/master/js/index.js detectRightButton
 * @description this function takes in an event and checks to see if it was a left click event
*/
function detectRightMouse(evt) {
    // if evt is null then get the currently active window event
    evt = evt || window.event;

    // if browser has which then use which code check
    if ("which" in evt) {
        return evt.which == 3;
    }
    
    // otherwise check for the button code
    var button = evt.buttons || evt.button;   
    return button == 2;
}

/**
 * @function setTransform
 * @param {string} scaleString - a string returned by scaleString()
 * @param {string} translateString - a string returned by translateString()
 * @description This function sets all transform values for any browser using the main rendering engines
 */
function setTransform( element, scaleString, translateString )
{
    if( element.nodeName !== "image")
    {
        element.style.webkitTransform = scaleString + " " + translateString;
        element.style.MozTransform = scaleString + " " + translateString;
        element.style.msTransform = scaleString + " " + translateString;
        element.style.OTransform = scaleString + " " + translateString;
        element.style.transform = scaleString + " " + translateString;
    
    }
}

/**
 * @function getTransform
 * @param {string} attr - the transform value that you want to recieve `scale`, `x`, `y`
 * @param {object} object - the HTML DOM object that we want to change 
 * @description return the attr of the transform css that is contained in object
 */
function getTransform( attr, object)
{
    try {
            if( object.style.transform )
            {
                switch( attr )
                {
                    case "scale":
                        return parseFloat(object.style.transform.split("scale3d(")[1])
            
                    case "x":
                        return parseFloat(object.style.transform.split("translate(")[1])
                
                    case "y":
                        return parseFloat(object.style.transform.split("translate(")[1].split(',')[1])
                    
                    default:
                        throw -1
                }
            }
            else
            {
                switch( attr )
                {
                    case "scale":
                        return 1
            
                    case "x":
                        return parseFloat(object.getAttribute("x"))
                
                    case "y":
                        return parseFloat(object.getAttribute("y"))
                    
                    default:
                        throw -1
                }
            }
        } 
    catch (error) {
        console.log(error)
    }
}

/**
 * @function translateString
 * @param {number} x - the x value in pixels
 * @param {number} y - the y value in pixels
 * @description returns a string for of the x,y point as a translate() command
 */
function translateString( x, y )
{
    return String( "translate(" +  x  + "px, " +  y  + "px)" )
}

/**
 * @function translateString
 * @param {number} x - the x value in pixels
 * @param {number} y - the y value in pixels
 * @param {number} scale - the scale value
 * @description returns a string for of the x,y point as a translate() and scale3d() command
 */
function scaleString( scale)
{
    return String( "scale3d(" + scale + "," + scale + ",1)" )
}

/**
 * @function getScaledPoint
 * @param {number} p - the point that we need to scale
 * @param {number} scale - the new scale of the image
 * @param {number} objectDim - the object dimension, either width or height
 * @description move the point over half the scaled width and then divide by the scale again 
 */
function getScaledPoint( p, scale, objectDim )
{
    // scale object dimension and get half of it because we want the center of the object
    let p_half = (objectDim * scale) / 2

    // scale the point down with half subtracted to find the center of the icon
    return ( p  - p_half ) /  scale  
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

/**
 * @function moveSvgDown
 * @param {Node} element - the element to shift down a layer of the svg parent
 * @description move the svg element down to the top of the layers of the svg
 */
function moveSvgDown( element )
{
    document.getElementById("figurecontainer").insertBefore(element, element.previousSibling)
}

/**
 * @function updateTranslate
 * @requires translateSring()
 * @param {string} translateStr - translate string for the translate
 * @param {string} attr - the attribute to update
 * @param {number} value - the new value
 * @description update just one part of the translate. either x or y and return translateString()
 */
function updateTranslate ( object, attr, value )
{
    // quick fix for unknown javascript 0px error that changes the transform string
    value = ( value == 0 ) ? 1 : value
    object.setAttribute(attr, value)
}