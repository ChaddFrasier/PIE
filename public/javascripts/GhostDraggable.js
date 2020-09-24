"use strict";

function initShadowIcon( )
{
    var PrivateIcon = null;
    return {
        icon: PrivateIcon,

        drawShadowIcon: function( event )
        {
            // create a mini symbol that follows the mouse
            let shadowdiv = document.createElement("div");
            shadowdiv.setAttribute("width", "50px");
            shadowdiv.setAttribute("height", "50px");
            shadowdiv.innerHTML = event.target.innerHTML;

            shadowdiv.style.opacity = .5;
            shadowdiv.style.position = "fixed";
            shadowdiv.style.left = event.pageX+'px';
            shadowdiv.style.top = event.pageY+'px';
            shadowdiv.style.pointerEvents = "none";

            PrivateIcon = shadowdiv;
            return shadowdiv;
        }, 

        shadowAnimate: function( event )
        {
            PrivateIcon.style.left = Number(event.pageX).toFixed(0)+'px';
            PrivateIcon.style.top = Number(event.pageY).toFixed(0)+'px';
        }
    };
}