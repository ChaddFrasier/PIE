/**
 * @file EventManager.js
 * @fileoverview This file controls the flow of events on the webpage
 */
"use strict"

/**
 * @class EventManager
 * @classdesc this class controls the flow of events and helps prevent events from starting over one another
 */
class EventManager {
    RunningEvent = undefined;
    /**
     * @function activateEvent
     * @description set the running event flags
     */
    activateEvent() {
        // if there is no event running then return true otherwise false
        if( this.RunningEvent )
        {
            return false;
        }
        else
        {
            return true;
        }
    }

    /**
     * @function setEventFlag
     * @param {boolean} val 
     * @description set the running event flag for PIE.
     */
    setEventFlag( val ) {
        this.RunningEvent = val;
    }

    /**
     * @function deactivateBtn
     * @param {string} id 
     * @description set the class to deactivate the btn at the id.
     */
    deactivateBtn( id ) {
        var btn = document.getElementById(id)
        if( btn )
        {
            btn.classList.add("disabled")
        }
    }

    /**
     * @function reactivateBtn
     * @param {string} id the id of the button clicked
     * @description turn on the button with the id.
     */
    reactivateBtn( id ) {
        var btn = document.getElementById(id)
        if( btn )
        {
            btn.classList.remove("disabled")
        }
    }
}