/**
 * @file DraggableGhost.js
 * @fileoverview This class is used to copy a button on the screen and make a smaller 'ghost' version of the icon that follows the mouse for drag and dropping effect.
 */
var _this = undefined;
/**
 * @class DraggableGhost
 */
"use strict"
class DraggableGhost {
    constructor( ) {
        this.icon = null
        _this = this
    }

    /**
     * @function drawShadowIcon
     * @param {_Event} event 
     * @description this function creates a new holder group for the icon we are 'ghosting'
     */
    drawShadowIcon( event ) {
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
        _this.icon = shadowdiv;
        return shadowdiv;
    }

    /**
     * @function shadowAnimate
     * @param {_Event} event 
     * @description this function sets the position of the 'ghosting' icon
     */
    shadowAnimate( event ) {
        _this.icon.style.left = Number(event.pageX).toFixed(0)+'px';
        _this.icon.style.top = Number(event.pageY).toFixed(0)+'px';
    }
}