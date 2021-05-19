"use strict"
class EventManager {
    RunningEvent = undefined;

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

    setEventFlag( val ) {
        this.RunningEvent = val;
    }

    deactivateBtn( id ) {
        var btn = document.getElementById(id)
        if( btn )
        {
            btn.classList.add("disabled")
        }
    }

    reactivateBtn( id ) {
        var btn = document.getElementById(id)
        if( btn )
        {
            btn.classList.remove("disabled")
        }
    }
    
}