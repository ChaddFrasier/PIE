/**
 * @file svgHelper.js
 * @fileoverview file for helping the DraggableArea and DraggableList files
*/
"use strict";
// Namespaces Global
var NS = {
        xhtml:"http://www.w3.org/1999/xhtml",
        svg: "http://www.w3.org/2000/svg",
        cc: "http://creativecommons.org/ns#",
        dc: "http://purl.org/dc/elements/1.1/",
        rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
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
 * @function detectRightMouse
 * @param { event } evt
 * @see https://github.com/ChaddFrasier/PIPS/blob/master/js/index.js detectRightButton
 * @description this function takes in an event and checks to see if it was a left click event
*/
function detectRightMouse(evt)
{
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
 * @function updateInputField
 * @param {string} objectid the object id to change
 * @param  {...any} args list of the values to update in order of input fields for each object
 */
function updateInputField( objectid, ...args )
{
    // dragging a line
    if( objectid.indexOf("line") > -1)
    {
        var objectArr = document.getElementsByClassName("draggableToolbox")
        // more than 1 toolbox present
        for(let i = 0; i < objectArr.length; i++ )
        {
            if( objectArr[i].getAttribute("objectid") == objectid )
            { 
                // set the ui input boxes
                var x1input = objectArr[i].children[1].querySelector("input[name='linex1input']"),
                    y1input = objectArr[i].children[1].querySelector("input[name='liney1input']"),
                    x2input = objectArr[i].children[1].querySelector("input[name='linex2input']"),
                    y2input = objectArr[i].children[1].querySelector("input[name='liney2input']");
                
                x1input.value = Number(args[0]).toFixed(0)
                y1input.value = Number(args[1]).toFixed(0)
                x2input.value = Number(args[2]).toFixed(0)
                y2input.value = Number(args[3]).toFixed(0)
            }
        }
    }
    else if( objectid.indexOf("rect") > -1)
    {
        var objectArr = document.getElementsByClassName("draggableToolbox")

        // more than 1 toolbox present
        for(let i = 0; i < objectArr.length; i++ ){
            if( objectArr[i].getAttribute("objectid") == objectid )
            {
                // set the ui input boxes
                var xinput = objectArr[i].children[1].querySelector("input[name='rectxinput']"),
                    yinput = objectArr[i].children[1].querySelector("input[name='rectyinput']");

                xinput.value = Number(args[0]).toFixed(0)
                yinput.value = Number(args[1]).toFixed(0)
            }
        }
    }
    else if( objectid.indexOf("Icon") > -1 )
    {
        var objectArr = document.getElementsByClassName("draggableToolbox") 
 
        if( objectArr.length > 0)
        {
            // more than 1 toolbox present
            for(let i = 0; i < objectArr.length; i++ ){
                if( objectArr[i].getAttribute("objectid").indexOf(objectid.split("-")[1]) > -1 )
                {
                    // set the ui input boxes
                    var xinput = objectArr[i].querySelectorAll("input[name='iconxcoordinput']"),
                        yinput = objectArr[i].querySelectorAll("input[name='iconycoordinput']");

                    if(xinput.length > 0 && yinput.length > 0)
                    {
                        xinput.forEach(inputfield => {
                            if(inputfield.getAttribute("objectid") === objectid)
                            {
                                inputfield.value = Number(args[0]).toFixed(0)
                            }
                        });

                        yinput.forEach(inputfield => {
                            if(inputfield.getAttribute("objectid") === objectid)
                            {
                                inputfield.value = Number(args[1]).toFixed(0)
                            }
                        });
                    }
                }
            }
        }
        else
        {
            console.log("Something went wrong")
        }
    }
    else if( objectid.indexOf("image") > -1 )
    {
        var objectArr = document.getElementsByClassName("draggableToolbox")
        
        if(objectArr.length > 0)
        {
            // more than 1 toolbox present
            for(let i = 0; i < objectArr.length; i++ ){
                if( objectArr[i].getAttribute("objectid").split('-')[0] === objectid )
                {
                    // set the ui input boxes
                    var xinput = objectArr[i].children[1].querySelector("input[name='xcoordinput']"),
                        yinput = objectArr[i].children[1].querySelector("input[name='ycoordinput']")

                    xinput.value = Number(args[0]).toFixed(0)
                    yinput.value = Number(args[1]).toFixed(0)
                }
            }
        }
        else
        {
            console.log("Something went wrong")
        }
    }
    else if(objectid.indexOf("caption") > -1)
    {
        var objectArr = document.getElementsByClassName("draggableToolbox")
        
        if(objectArr.length > 0)
        {
            // more than 1 toolbox present
            for(let i = 0; i < objectArr.length; i++ ){
                if( objectArr[i].getAttribute("objectid").split('-')[0] === objectid )
                {
                    // set the ui input boxes
                    var xinput = objectArr[i].children[1].querySelector("input[name='xcoordinput']"),
                        yinput = objectArr[i].children[1].querySelector("input[name='ycoordinput']");

                    xinput.value = Number(args[0]).toFixed(0)
                    yinput.value = Number(args[1]).toFixed(0)
                }
            }
        }
        else
        {
            console.log("Something went wrong")
        }
    }
    else
    {
        console.error("Could not find object to correct")
    }
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
    object.setAttribute(attr, value)
}