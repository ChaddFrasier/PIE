/**
 * @function createSVGPoint
 * @param {number} x - x translate
 * @param {number} y - y translate
 * @description this function creates a svg point from the svgContainer matrix and transforms it into the client space.
 *  This is used to get the pixel in the svg that was clicked when dropping icons on screen
 */
function createSVGPoint( x, y )
{
    // create a svg point on screen
    let pt = svgContainer.createSVGPoint()
    
    // input to a float and set the initial point values in the svgpoint object
    pt.x = parseFloat( x )
    pt.y = parseFloat( y )

    if( !isNaN( pt.x ) && !isNaN( pt.y ) )
    {
        /**
         * Apply a matrix tranform on the new point using the transform matrix of the target svg
         *  Note: must inverse the matrix when being inputed because of matrix arithmetic
         * */ 
        return pt.matrixTransform( svgContainer.getScreenCTM().inverse() )
    }
    else
    {
        console.error( "Error: SVG Point Mapping Failed" )
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
 * @function getScaledPoint
 * @param {number} p - the point that we need to scale
 * @param {number} scale - the new scale of the image
 * @param {number} objectDim - the object dimension, either width or height
 * @description move the point over half the scaled width and then divide by the scale again 
 */
function getScaledPoint( p, scale, objectDim )
{
    // scale object dimension and get half of it because we want the center of the object
    let p_half = objectDim * scale / 2

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
 * @description update just one part of the translate. either x or y
 */
function updateTranslate ( translateStr, attr, value, scale )
{
    // quick fix for unknown javascript 0px error that changes the transform string
    value = ( value == 0 ) ? 1 : value

    if( attr == "x" )
    {
        let y = parseInt( translateStr.split( "," )[ 1 ] )

        return  String( "translate(" +  value / scale  + "px, " + y  + "px)" ) 
    }
    else if( attr == "y" )
    {
        let x = parseInt( translateStr.split( "translate(" )[ 1 ].split( "," )[ 0 ] )

        return  String( "translate(" +  x  + "px, " + value / scale   + "px)" )

    }
}