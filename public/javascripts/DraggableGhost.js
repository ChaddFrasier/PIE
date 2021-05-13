var _this = undefined;
/**
 * @class
 */
"use strict"
class DraggableGhost {
    constructor( ) {
        this.icon = null
        _this = this
    }

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

    shadowAnimate( event ) {
        _this.icon.style.left = Number(event.pageX).toFixed(0)+'px';
        _this.icon.style.top = Number(event.pageY).toFixed(0)+'px';
    }
}