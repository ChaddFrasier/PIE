/**
 * @file GhostDraggable.js
 * @fileoverview 
 *              This file is used to create a simple object 
 *      that allows you to add Ghost-like objects to the browser. This is used to mimic a drag-and-drop
 *      feature where you drag a svg group from inside of a another SVG box. This file can help create 
 *      an exact copy of the button and then make that "Ghost" copy follow the mouse until the mouse ius released
*/

"use strict";

/**
 * @function initShadowIcon
 * @description this is the initializer for the GhostDraggable icon
 */
function initShadowIcon( )
{
    // init the icon to copy
    var PrivateIcon = null;

    // then return the usable function
    return {
        // return the icon we are copying
        icon: PrivateIcon,

        /**
         * @function drawShadowIcon
         * @param {Event} event - the mouse click event that begins the shadow icon
         * @description init and return the shadow icon so it can be appended to the docuement body
         */
        drawShadowIcon: function( event )
        {
            // create a mini symbol that follows the mouse
            let shadowdiv = document.createElement("div");
            shadowdiv.setAttribute("width", "50px");
            shadowdiv.setAttribute("height", "50px");
            shadowdiv.innerHTML = (event.target.nodeName == "BUTTON") ? event.target.innerHTML: event.target.parentElement.parentElement.parentElement.innerHTML;
            
            shadowdiv.style.opacity = .5;
            shadowdiv.style.position = "fixed";
            shadowdiv.style.left = event.pageX+'px';
            shadowdiv.style.top = event.pageY+'px';
            shadowdiv.style.pointerEvents = "none";

            PrivateIcon = shadowdiv;
            return shadowdiv;
        }, 

        /**
         * @function shadowAnimate
         * @param {Event} event- mouse dragging event
         * @description animate the icon to the mouse location
         */
        shadowAnimate: function( event )
        {
            PrivateIcon.style.left = Number(event.pageX).toFixed(0)+'px';
            PrivateIcon.style.top = Number(event.pageY).toFixed(0)+'px';
        }
    };
}