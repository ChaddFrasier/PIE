/**
 * 
 * @file svgHelper.js
 * @fileoverview file for helping the DraggableArea and DraggableList files
 */


/**
 * 
 * @param {string} translateString 
 * @param {string} scaleString 
 */
function setTransform( element, scaleString, translateString )
{
    element.style.webkitTransform = scaleString + " " + translateString;
    element.style.MozTransform = scaleString + " " + translateString;
    element.style.msTransform = scaleString + " " + translateString;
    element.style.OTransform = scaleString + " " + translateString;
    element.style.transform = scaleString + " " + translateString;
}

function getTransform( attr, object)
{
    switch( attr )
    {
        case "scale":
            return parseInt(object.style.transform.split("scale3d(")[1])

        case "x":
            console.log(object.style.transform.split("translate("))
            break
    
        case "y":
            console.log(object.style.transform.split("translate("))
            break
        
        default:
            console.log("error")
            break
            
        
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
 * @param {Node} element
 * @description move the svg element up to the top of the layers of the svg
 */
function moveSvgUp( element )
{
    element.nextSibling.insertAdjacentElement("afterend", element)
}

/**
 * @function moveSvgDown
 * @param {Node} element
 * @description move the svg element down to the top of the layers of the svg
 */
function moveSvgDown( element )
{
    document.getElementById("figurecontainer").insertBefore(element, element.previousSibling)
}

/**
 * @function updateTranslate
 * @param {string} translateStr - translate string for the translate
 * @param {string} attr - the attribute to update
 * @param {number} value - the new value
 * @param {number} scale - the current scale
 * @description update just one part of the translate. either x or y and return translateString()
 */
function updateTranslate ( translateStr, attr, value, scale )
{
    // quick fix for unknown javascript 0px error that changes the transform string
    value = ( value == 0 ) ? 1 : value

    if( attr == "x" )
    {
        let y = parseInt( translateStr.split( "," )[ 1 ] )

        return  translateString(value/scale, y) 
    }
    else if( attr == "y" )
    {
        let x = parseInt( translateStr.split( "translate(" )[ 1 ].split( "," )[ 0 ] )

        return  translateString(x, value/scale)

    }
}