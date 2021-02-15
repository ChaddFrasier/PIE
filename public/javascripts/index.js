/**
 * @file index.js
 * @requires "svgHelper.js"
 * @requires "DraggableArea.js"
 * @requires "DraggableList.js"
 * @requires "GhostDraggable.js"
 * @requires "PIE-api.js"
 * 
 * @fileoverview main event loop for the index page of PIE
*/

var draggableSvg = null,
    draggableList = null,
    geoIconArray = Array('northarrowopt', 'scalebarbtnopt', 'sunarrowopt', 'keyopt', 'observerarrowopt');

// Function executes when the page loads fully
document.addEventListener( "DOMContentLoaded", ( event ) => {
    // Pre config
    preConfigPage();

    // local jquery variables
    var PencilFlag = false,
        selectedObject = null,
        OutlineFlag = false,
        shadowIcon = initShadowIcon(),
        activeEventManager = startActiveEM(),
        draggingDot = null,
        rectstartx = 0,
        rectstarty = 0;

    // get the global figure element
    let svgContainer = document.getElementById("figurecontainer")
    
    // add the custom keys 
    document.addEventListener("keydown", customKeys);
    // start draggable actions
    configDraggables( svgContainer, document.getElementById("DraggableContainer") )

    /**
     * @function shiftKeyup
     * @param {Event} event 
     * @description remove the dots and listener events from the dots if the shift key if lifted
     */
    function shiftKeyup( event )
    {
        // stop event chain
        event.preventDefault()

        // if the key being let go is the shift key
        if( event.key === "Shift" || event.key ==='shift' || event.key === 16 )
        {
            // unpause the drag stuff from the DraggableArea Object
            draggableSvg.unpauseDraggables();
            // reactivate the UI buttons
            changeButtonActivation("enable", 2)
            // remove the color the endpoints of the lines and the endpoints of the rectangles
            document.removeEventListener("keyup", shiftKeyup)
            // remove all draggable dots
            document.querySelectorAll("circle.draggableDot").forEach( dot => {
                dot.removeEventListener("mousedown", dotMouseDownFunction)
                draggableSvg.getContainerObject().removeChild( dot )
            });
        }
        return true
    }

    /**
     * @function dotMouseMoveFunction
     * @param {Event} event 
     * @description manipuate the rect and line elements and adjust the dots respectivley
     */
    function dotMouseMoveFunction( event )
    {
        // make sure draggingDot is valid
        if( draggingDot !== null )
        {
            // check if the dot is for a line
            if( String(draggingDot.getAttribute("spyId")).indexOf('line') > -1 )
            {
                // get the svg point that the line uses
                var svgP = draggableSvg.svgAPI(event.pageX, event.pageY),
                    svgObject = document.getElementById( draggingDot.getAttribute("spyId").split("-")[0] ),
                    code = (draggingDot.getAttribute("spyId").split("-")[1] == 'start') ? 1 : 2;

                // set the point for the new line end
                draggingDot.setAttribute("cx", svgP.x)
                draggingDot.setAttribute("cy", svgP.y)
                svgObject.setAttribute(`x${code}`, svgP.x)
                svgObject.setAttribute(`y${code}`, svgP.y)
            }
            else if( String(draggingDot.getAttribute("spyId")).indexOf('rect') > -1 )
            {
                // get the scaled point on the svg and the rectangle dimensions
                var svgP = draggableSvg.svgAPI(event.pageX, event.pageY),
                    svgObject = document.getElementById( draggingDot.getAttribute("spyId").split("-")[0] ),
                    code = draggingDot.getAttribute("spyId").split("-")[1],
                    width = parseFloat(svgObject.getAttribute("width")),
                    height = parseFloat(svgObject.getAttribute("height")), 
                    newwidth = 0, 
                    newheight = 0;

                // use a different if statement for each corner of the rectangle
                if( code === "ptl" )
                {
                    newwidth = width - (svgP.x - rectstartx),
                    newheight = height - (svgP.y - rectstarty)

                    if( newheight > 0 )
                    {
                        // update the dot locations
                        draggingDot.setAttribute("cy", svgP.y)
                        svgObject.setAttribute("y", svgP.y)
                        svgObject.setAttribute( "height", newheight )
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-ptr']`).setAttribute("cy", svgP.y )
                        rectstarty = svgP.y
                    }

                    if( newwidth > 0 )
                    {
                        draggingDot.setAttribute("cx", svgP.x)
                        svgObject.setAttribute("x", svgP.x)
                        svgObject.setAttribute( "width", newwidth )
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-pbr']`).setAttribute("cy", svgP.y + newheight)
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-pbl']`).setAttribute("cx", svgP.x )
                        rectstartx = svgP.x
                    }
                }
                else if( code === "ptr" )
                {
                    newwidth = width + (svgP.x - rectstartx),
                    newheight = height - (svgP.y - rectstarty)

                    if( newheight > 0 )
                    {
                        // update the dot location
                        draggingDot.setAttribute("cy", svgP.y)
                        svgObject.setAttribute("y", svgP.y)
                        svgObject.setAttribute( "height", newheight )
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-ptl']`).setAttribute("cy", svgP.y )
                        rectstarty = svgP.y
                    }

                    if( newwidth > 0 )
                    {
                        draggingDot.setAttribute("cx", svgP.x)
                        svgObject.setAttribute( "width", newwidth )
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-pbr']`).setAttribute("cx", svgP.x )
                        rectstartx = svgP.x
                    }
                }
                else if( code === "pbr" )
                {
                    newwidth = width + (svgP.x - rectstartx),
                    newheight = height + (svgP.y - rectstarty)

                    if( newheight > 0 )
                    {
                        // update the dot location
                        draggingDot.setAttribute("cy", svgP.y)
                        svgObject.setAttribute( "height", newheight )
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-pbl']`).setAttribute("cy", svgP.y )
                        rectstarty = svgP.y
                    }

                    if( newwidth > 0 )
                    {
                        draggingDot.setAttribute("cx", svgP.x)
                        svgObject.setAttribute( "width", newwidth )
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-ptr']`).setAttribute("cx", svgP.x )
                        rectstartx = svgP.x
                    }
                }
                else if( code === "pbl" )
                {
                    newwidth = width - (svgP.x - rectstartx),
                    newheight = height + (svgP.y - rectstarty)

                    if( newheight > 0 )
                    {
                        // update the dot location
                        draggingDot.setAttribute("cy", svgP.y)
                        svgObject.setAttribute( "height", newheight )
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-pbr']`).setAttribute("cy", svgP.y )
                        rectstarty = svgP.y
                    }

                    if( newwidth > 0 )
                    {
                        draggingDot.setAttribute("cx", svgP.x)
                        svgObject.setAttribute("x", svgP.x)
                        svgObject.setAttribute( "width", newwidth )
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-ptl']`).setAttribute("cx", svgP.x )
                        rectstartx = svgP.x
                    }
                }
            }
        }
    }

    /**
     * @function dotEndFunction
     * @description clear the globals and reove the functions
     */
    function dotEndFunction( )
    {
        draggingDot = null
        rectstartx = 0
        rectstarty = 0
        rectwidth = 0
        rectheight = 0

        draggableSvg.getContainerObject().removeEventListener("mousemove", dotMouseMoveFunction)
        draggableSvg.getContainerObject().removeEventListener("mouseup", dotEndFunction)
        draggableSvg.getContainerObject().removeEventListener("mouseleave", dotEndFunction)
    }

    /**
     * @function dotMouseDownFunction
     * @param {Event} event 
     * @description capture the starting data for the mousemove function and activate the other listeners
     */
    function dotMouseDownFunction( event )
    {
        // get the dot the user clicks and the svg it belongs to
        draggingDot = event.target
        let svg = document.getElementById(draggingDot.getAttribute("spyId").split("-")[0])

        // read in the starting data as floats
        rectstartx = parseFloat(draggingDot.getAttribute("cx"))
        rectstarty = parseFloat(draggingDot.getAttribute("cy"))
        rectwidth = parseFloat(svg.getAttribute('width'))
        rectheight = parseFloat(svg.getAttribute('height'))

        // activate the dragging and stopping function
        draggableSvg.getContainerObject().addEventListener("mousemove", dotMouseMoveFunction)
        draggableSvg.getContainerObject().addEventListener("mouseup", dotEndFunction)
        draggableSvg.getContainerObject().addEventListener("mouseleave", dotEndFunction)
    }

    /**
     * @function createDot
     * @param {string} spyId the id of the 'spy' SVG Element
     * @param {float} x the cx of the dot
     * @param {float} y the cy of the dot
     * @description create and add a single dot to the svg element
     */
    function createDot( spyId, x, y )
    {
        // add a dot where one of the line points are
        var dot = document.createElementNS(NS.svg, "circle")
        dot.setAttribute("class", "draggableDot")
        dot.setAttribute("r", "13")
        // get the x and y of all the points of the rectangles and lines
        dot.setAttribute("cx", x)
        dot.setAttribute("cy", y)
        dot.setAttribute("spyId", spyId)
        dot.addEventListener("mousedown", dotMouseDownFunction)
        draggableSvg.getContainerObject().append(dot)
    }

    /**
     * @function customKeys
     * @param {Keydown Event} event the ketdown event
     * @description add the custom key listeners for when the user is using any function on the page
     */
    function customKeys( event )
    {
        // cross broswer key grab that works with older versions and newer versions of all browsers
        var key = event.key || event.keyCode

        // escape listener
        if( key === 'Escape' || key === 'Esc' || key === 27 )
        {
            // disable any default esc function
            event.preventDefault()

            // get the child list and the last child in the figure
            let children = draggableSvg.getContainerObject().children;
            let rmChild = children[children.length - 1];

            // the pencil function is going
            if( PencilFlag )
            {
                // check to see if the last child is a line that has not been placed yet
                if( String(rmChild.nodeName).toUpperCase() === "LINE" && !rmChild.classList.contains("placed") )
                {
                    // remove the half drawn line
                    draggableSvg.getContainerObject().removeChild(rmChild)
                }
                else
                {
                    // else just turn off the drawing function
                    document.querySelector("button.drawing").trigger("click")
                }
            }

            // same with outline
            if( OutlineFlag )
            {
                if( String(rmChild.nodeName).toUpperCase() === "RECT" && !rmChild.classList.contains("placed") && rmChild.getAttribute("id") !== "bgelement" )
                {
                    draggableSvg.getContainerObject().removeChild(rmChild)
                }
                else
                {
                    document.querySelector("button.outlining").trigger("click")
                }
            }
        }
        else if( key === "Enter" || key === 'enter' || key === 13 )
        {
            // if the enter key was hit with the savebtn on screen then try to save the figure
            if( document.getElementById("savebtn") )
            {
                document.getElementById("savebtn").click()
            }
        }
        else if( (key === "Shift" 
                || key === 'shift' 
                || key === 16) 
                && (!PencilFlag && !OutlineFlag)
                && (document.querySelectorAll("line.placed").length > 0 
                    || document.querySelectorAll("rect.placed").length > 0 )
            )
        {
            // pause the drag stuff from the DraggableArea Object
            draggableSvg.pauseDraggables();
            // disable the buttons in the toolbox
            changeButtonActivation("disable", 2)

            // color the endpoints of the lines and the endpoints of the rectangles.
            var shiftObjectLists = document.querySelectorAll("line.placed")
            shiftObjectLists = Array(shiftObjectLists).concat(document.querySelectorAll("rect.placed"))
            shiftObjectLists.forEach( svgList => {
                // check if it is a list of lines or a list of rect
                svgList.forEach( obj => {
                    var dotObjectName = `${obj.id}-`;
                    
                    switch( String(obj.nodeName).toLowerCase() )
                    {
                        case 'line':
                            // create a new dot element that has an attribute for spy element attribute name
                                // Example:   <circle ... spyId="line345-start" ... /> 
                                //            <circle ... spyId="line345-end" ... /> 

                            createDot(dotObjectName + 'start', obj.getAttribute("x1"), obj.getAttribute("y1"))
                            createDot(dotObjectName + 'end', obj.getAttribute("x2"), obj.getAttribute("y2"))
                            break;

                        case 'rect':
                            // create a new dot element that has an attribute for spy element attribute name
                                // Example:   <circle ... spyId="rect123-ptl" ... /> top left 
                                //            <circle ... spyId="rect123-ptr" ... /> top right
                                //            <circle ... spyId="rect123-pbr" ... /> bottom right
                                //            <circle ... spyId="rect123-pbl" ... /> bottom left
                            let x = parseFloat( obj.getAttribute("x") ),
                                y = parseFloat( obj.getAttribute("y") ),
                                width = parseFloat( obj.getAttribute("width") ),
                                height = parseFloat( obj.getAttribute("height") );

                            createDot(dotObjectName + 'ptl', x, y)
                            createDot(dotObjectName + 'ptr', x + width, y)
                            createDot(dotObjectName + 'pbr', x + width, y + height)
                            createDot(dotObjectName + 'pbl', x, y + height)
                            break;

                        default:
                            console.log("failure")
                            break;
                    }
                });
            });
            // add the key listener specifically to cancel the shift function
            document.addEventListener("keyup", shiftKeyup);
        }

        return true;
    }

    /**
     * @function .windowminimizebtn.click()
     * @description Show and hide contents of the tool windows works generically so we can add more later
     */
    document.querySelectorAll('button.windowminimizebtn').forEach( button => {
        button.addEventListener( "click", (event) => { minimizeToolsWindow(event) }) 
    });
    
    /**
     * @function #penciloptbtn.click()
     * @description this function activates the drawing listeners and handles multiple click instances.
     */
    document.getElementById('penciloptbtn').addEventListener("click", function( event )
    {    
        event.preventDefault()
        if( PencilFlag )
        {
            if( !activeEventManager.activateEvent() )
            {
                // cancel the drawing functionality
                event.target.classList.remove("drawing")
                // remove the pencil icon to the main box on hover
                document.getElementById("maincontent").childNodes.forEach(childel => {
                    childel.classList.remove("drawing")
                });
                // remove the pencil icon to the main box on svg main elements
                document.getElementById("figurecontainer").childNodes.forEach(childel => {
                    childel.classList.remove("drawing")
                });
                changeButtonActivation("enable", 0)
                // allow dragging again
                draggableSvg.unpauseDraggables()
                // remove draw listeners
                draggableSvg.getContainerObject().removeEventListener("mousedown", drawMouseDownListener)

                activeEventManager.setEventFlag(undefined)
                activeEventManager.reactivateBtn( 'outlinebtnopt' )
            }
        }
        else
        {
            if( activeEventManager.activateEvent() )
            {
                // start the drawing functionality
                event.target.classList.add("drawing")
                // add the pencil cursor icon to the main content objects
                document.getElementById("maincontent").childNodes.forEach((childel) => {
                    childel.classList.add("drawing")
                });
                // add the pencil cursor icon to the svg objects
                document.getElementById("figurecontainer").childNodes.forEach((childel) => {
                    childel.classList.add("drawing")
                });
                changeButtonActivation("disable", 0)
                // pause the dragging function for now
                draggableSvg.pauseDraggables()
                // add event listener for click on svg
                draggableSvg.getContainerObject().addEventListener("mousedown", drawMouseDownListener )

                activeEventManager.setEventFlag(true)
                activeEventManager.deactivateBtn( 'outlinebtnopt' )
            }
        }
        PencilFlag = !(PencilFlag)
    });

    /**
     * @function #outlinebtnopt.click()
     * @description activate and deactivate the drawing capability of the rectangles 
     */
    document.getElementById('outlinebtnopt').addEventListener("click", function( event )
    {
        event.preventDefault()
        if( OutlineFlag )
        {
            if( !activeEventManager.activateEvent() )
            {
                // cancel the drawing functionality
                document.getElementById("editbox").classList.remove("outlining")
                event.target.classList.remove("outlining")
                // add the crosshair cursor icon to the main content objects
                document.getElementById("maincontent").childNodes.forEach((childel) => {
                    childel.classList.remove("outlining")
                });
                // add the crosshair cursor icon to the svg objects
                document.getElementById("figurecontainer").childNodes.forEach((childel) => {
                    childel.classList.remove("outlining")
                });
                // unblock dragging
                draggableSvg.unpauseDraggables()
                changeButtonActivation("enable", 1)
                // remove draw listeners
                draggableSvg.getContainerObject().removeEventListener("mousedown", drawBoxMouseDownListener )

                activeEventManager.setEventFlag(undefined)
                activeEventManager.reactivateBtn( 'penciloptbtn' )
            }
        }
        else
        {
            if ( activeEventManager.activateEvent() )
            {
                // start the drawing functionality
                document.getElementById("editbox").classList.add("outlining")
                event.target.classList.add("outlining")
                // add the crosshair cursor icon to the main content objects
                document.getElementById("maincontent").childNodes.forEach((childel) => {
                    childel.classList.add("outlining")
                });
                // add the crosshair cursor icon to the svg objects
                document.getElementById("figurecontainer").childNodes.forEach((childel) => {
                    childel.classList.add("outlining")
                });
                changeButtonActivation("disable", 1)
                // block dragging again
                draggableSvg.pauseDraggables()
                // add event listener for click on svg
                draggableSvg.getContainerObject().addEventListener("mousedown", drawBoxMouseDownListener )

                activeEventManager.setEventFlag(true)
                activeEventManager.deactivateBtn( 'penciloptbtn' )
            }
        }
        OutlineFlag = !(OutlineFlag)
    });
    
    /** 
     * @function .windowoptionsbar.click()
     * @description Hide and show the toolbox if the option bar is clicked
     */
    document.querySelectorAll(".windowoptionsbar").forEach( bar => {
        bar.addEventListener("click", (event) => { optionsAction(event.target); });
    });

    /**
     * @function exportbtn.mousedown()
     * @description drae the box that is used for inputing export information
     */
    document.getElementById('exportbtn').addEventListener("mousedown", () => {
        // if the exportbox exists cancel whole function
        if (document.querySelectorAll("div[class='exportmainbox']").length !== 0) {
            // dont allow bubbling
            return false;
        }

        let mainholder = document.createElement("div"),
            titleholder = document.createElement("div"),
            inputholder = document.createElement("div"),
            buttonholder = document.createElement("div"),
            title = document.createElement("h3"),
            savebtn = document.createElement("button"),
            cancelbtn = document.createElement("button"),
            leftbox = document.createElement("div"),
            centerbox = document.createElement("div"),
            form = document.createElement("form"),
            fileinputname = document.createElement("input"),
            fileinputtype = document.createElement("input"),
            fileinputtypelabel = document.createElement("label"),
            fileinputtypesvglabel = document.createElement("label"),
            fileinputnamelabel = document.createElement("label"),
            rightbox = document.createElement("div");

        titleholder.classList.add("exporttitlebox");
        inputholder.classList.add("exportinputholder");
        buttonholder.classList.add("exportbuttonholder");

        title.innerHTML = "Save Figure As ...";
        titleholder.appendChild(title);

        savebtn.innerHTML = "Download";
        savebtn.type = "button";
        savebtn.classList.add("exportpanelbtn");
        savebtn.setAttribute("id", "savebtn");

        cancelbtn.innerHTML = "Cancel";
        cancelbtn.classList.add("exportpanelbtn");

        centerbox.style.width = "30%";

        leftbox.appendChild(cancelbtn);
        leftbox.style.textAlign = "center";
        leftbox.style.width = "30%";

        rightbox.appendChild(savebtn);
        rightbox.style.width = "30%";
        rightbox.style.textAlign = "center";

        fileinputname.setAttribute("name", "exportfilename");
        fileinputname.setAttribute("type", "text");
        fileinputnamelabel.innerHTML = "File Name:  ";
        fileinputname.placeholder = "filename";

        fileinputtype.setAttribute("name", "exportfiletype-svg");
        fileinputtype.setAttribute("type", "checkbox");
        fileinputtypelabel.innerHTML = "Output Types:   ";

        fileinputtypesvglabel.innerHTML = "SVG";
        fileinputtypesvglabel.style.margin = "0 auto 0 0";
        fileinputtypesvglabel.style.width = "3em";

        let fileinputtype1 = fileinputtype.cloneNode(true),
            fileinputtypetifflabel = fileinputtypesvglabel.cloneNode(true),
            fileinputtypepnglabel = fileinputtypesvglabel.cloneNode(true),
            fileinputtype2 = fileinputtype.cloneNode(true),
            fileinputtype3 = fileinputtype.cloneNode(true),
            fileinputtypejpeglabel = fileinputtypesvglabel.cloneNode(true);

        fileinputtypepnglabel.innerHTML = "PNG";
        fileinputtypetifflabel.innerHTML = "GeoTIFF";
        fileinputtypejpeglabel.innerHTML = "JPEG";

        //remove this function for the next docker build of v1.1.0
        //fileinputtype2.classList.add("disabled") 

        form.setAttribute("method", "post");
        form.setAttribute("enctype", "multipart/form-data");
        form.setAttribute("runat", "server");
        form.setAttribute("action", "/export");

        let formlabelbox = document.createElement("div"),
            forminputbox = document.createElement("div"), 
            forminputcheckboxholder = document.createElement("div"),
            dividericonbox = document.createElement("div");

        dividericonbox.innerHTML = "&rarr;";
        dividericonbox.style.margin = "0 auto 0 0";
        dividericonbox.style.width = "1em";

        formlabelbox.classList.add("formlabelbox");
        forminputbox.classList.add("forminputbox");
        forminputcheckboxholder.classList.add("forminputcheckboxholder");

        formlabelbox.append(fileinputnamelabel, document.createElement("br"), document.createElement("br"), fileinputtypelabel);
        forminputbox.append(fileinputname, forminputcheckboxholder);

        let columnsvg = document.createElement("div"),
            columnpng = document.createElement("div"),
            columntiff = document.createElement("div"),
            columnjpg = document.createElement("div");

        columnsvg.classList.add("column");
        columnpng.classList.add("column");
        columntiff.classList.add("column");
        columnjpg.classList.add("column");

        columnsvg.append(fileinputtypesvglabel, dividericonbox, fileinputtype);
        columnpng.append(fileinputtypepnglabel, dividericonbox.cloneNode(true), fileinputtype1);
        //columntiff.append(fileinputtypetifflabel, dividericonbox.cloneNode(true), fileinputtype2)
        columnjpg.append(fileinputtypejpeglabel, dividericonbox.cloneNode(true), fileinputtype3);

        forminputcheckboxholder.append(columnsvg, columntiff, columnpng, columnjpg);
        form.append(formlabelbox, forminputbox);
        inputholder.appendChild(form);

        /**
         * @function onclick savebtn
         * @description send a post to the server to download an svg file of the svgcontainer
         * */
        savebtn.addEventListener( "click", function( event ) {
            // prevent default form submit
            event.preventDefault();

            var regexp = new RegExp( /([A-Z]|[0-9])*(?:\.(png|jpg|svg|tiff|tif)|\s)$/i ),
                breakFlag = false;

            // change the color of the border for bad filename
            if( regexp.test(fileinputname.value) || fileinputname.value.length == 0 )
            {
                fileinputname.classList.add("invalid");
                breakFlag = true;
                alert("User Error: filename should not include any file extension.\n Example: 'test.png' should be 'test'.");
            }
            else 
            {
                fileinputname.classList.remove("invalid");
            }

            // change color of the input box if needed
            if( validFileTypes(fileinputtype.checked, fileinputtype1.checked, fileinputtype2.checked, fileinputtype3.checked) 
                && !breakFlag )
            {
                forminputcheckboxholder.classList.remove("invalid");
            }
            else if( !breakFlag )
            {
                forminputcheckboxholder.classList.add("invalid");
                breakFlag = true;
                alert("User Error: Must select an export type from the checkboxes.");
            }

            // send request if the filename input is not empty
            if( fileinputname.value.length !== 0 && !breakFlag )
            {
                // create the request data using the form
                var fd = new FormData(form),
                    xhr = new XMLHttpRequest(),
                    temp = cleanSVG(document.getElementById("figurecontainer").cloneNode(true));

                // set response type
                xhr.responseType = 'json';

                // append the xml header line to make an official svg file
                var data = '<?xml version="1.0" encoding="UTF-8"?>'
                    + (new XMLSerializer()).serializeToString(temp);

                // creates a blob from the encoded svg and sets the type of the blob to and image svg
                var svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });

                // append the svgBlob as a file with the name given the exportfile 
                fd.append("exportfile", svgBlob, fileinputname.value + "_tmp.svg");
                fd.append("svg", fileinputtype.checked);
                fd.append("png", fileinputtype1.checked);
                //fd.append("tiff",fileinputtype2.checked )
                fd.append("jpeg", fileinputtype3.checked);
                fd.append("dims", figsizeselect.value);

                // when the requests load handle the response
                xhr.onloadend = () => {
                    // response has all the links for downloading images
                    Object.keys(xhr.response).forEach(filetype => {
                        const filename = xhr.response[filetype];

                        // create new formdata to tell the server what to download
                        var postData = new FormData(),
                            xhrd = new XMLHttpRequest()
                            
                        postData.append('fileName', filename);

                        // set up the XMLHttp request to the download link
                        xhrd.open('GET', '/download/' + filename, true);
                        xhrd.responseType = 'blob';

                        // download the blob as a file
                        xhrd.onload = function (event) {
                            var blob = this.response;
                            saveBlob(blob, filename);
                        };
                        xhrd.send(postData);
                    });
                };

                // open the request and send the data
                xhr.open('POST', "/export", true);
                xhr.send(fd);

                // remove the UI download box
                cancelbtn.click();
                return false;
            }
            return false;
        });

        // cancel button listener
        cancelbtn.addEventListener("click", () => {
            document.getElementById("maincontent").removeChild(mainholder);
        });

        // append the main section boxes for the button holder
        buttonholder.append(leftbox, centerbox, rightbox);
        mainholder.append(titleholder, inputholder, document.createElement("br"), buttonholder);
        mainholder.classList.add("exportmainbox");
        // append the main content box
        document.getElementById("maincontent").appendChild(mainholder);
    });

    /** 
     * @function .toolboxminimizebtn.click() 
     * @description handler for the whole tool window mini button
     */
    document.querySelectorAll('.toolboxminimizebtn').forEach(button => {
        button.addEventListener("click", function(event)
        {
            let toolbox = document.getElementById('toolbox'),
                imgbtn = document.getElementById('addimagebtn'),
                capbtn = document.getElementById('addcaptionbtn'),
                POWbtn = document.getElementById('addpowbtn');

            // check if the box is already closed, if true, open it, otherwise close
            if( toolbox.classList.contains('closed') )
            {
                toolbox.classList.remove('closed')
                // reactivate the other buttons
                imgbtn.classList.remove("disabled")
                capbtn.classList.remove("disabled")
                POWbtn.classList.remove("disabled")
                event.target.innerHTML = "&larrb;"
            }
            else
            {
                toolbox.classList.add('closed')
                // disable the other buttons to help focus on editing image
                imgbtn.classList.add("disabled")
                capbtn.classList.add("disabled")
                POWbtn.classList.add("disabled")

                event.target.innerHTML = "&rarrb;"
            }
        });
    });

    /**
     * @function button.toolboxaddcaptionbtn.click()
     * @description adds all caption elements to the svg and menu
     */
    document.getElementById('addcaptionbtn').addEventListener("click", () =>
    {
        // used for identifying the tool box for each caption in the image 
        let captionId = randomId("caption"),
            newoptionsbar = document.createElement("div"),
            header = document.createElement("h4"),
            minibtn = document.createElement("button"),
            deletebtn = document.createElement("button"),
            layerbtn = document.createElement("button")

        // set required styles
        newoptionsbar.classList.add("windowoptionsbar")
        newoptionsbar.style.display = "flex"

        newoptionsbar.addEventListener("click", function ( event )
        {
            optionsAction(event.target)
        })

        // setup the header of the optionsbar
        header.innerHTML = "Caption Layer"

        // same with the minimize button
        minibtn.classList.add("windowminimizebtn")
        minibtn.innerHTML = "▲"

        // cant forget the event handler for the minimize btn
        minibtn.addEventListener( "click", function(event) {
            minimizeToolsWindow(event)
        })

        // same for delete as minimize
        deletebtn.classList.add("windowremovebtn")
        deletebtn.innerHTML = "&times"
        
        deletebtn.addEventListener("click", function(event){removeToolsWindow(event) })
        
        // set the class css and the svg button graphic
        createLayerBtn(layerbtn, draggableList)

        // this is all dynamic css for the caption tool box
        // the most important part is just the 'objectid' attribute
        let toolsarea = document.createElement("div"),
            textinput = document.createElement("textarea"),
            widthlabel = document.createElement("label"),
            widthinput = document.createElement("input"),
            heightlabel = document.createElement("label"),
            fontSizeInput = document.createElement("input"),
            fontSizeLabel = document.createElement("label"),
            heightinput = document.createElement("input"),
            xcoordlabel = document.createElement("label"),
            xcoordinput = document.createElement("input"),
            ycoordlabel = document.createElement("label"),
            ycoordinput = document.createElement("input"),
            textlabel = document.createElement("label"),
            captiontextcolorinput = document.createElement("input"),
            captiontextcolorlabel = document.createElement("label"),
            captionbackgroundcolorinput = document.createElement("input"),
            captionbackgroundcolorlabel = document.createElement("label");

        captiontextcolorlabel.setAttribute("objectid", captionId)
        captiontextcolorinput.setAttribute("objectid", captionId)

        captiontextcolorinput.setAttribute("type", "color")
        captiontextcolorlabel.innerHTML = "Font Color: "
        captiontextcolorinput.value ="#000"

        fontSizeLabel.innerHTML = "Font Size (px): "
        fontSizeInput.value = "30"
        fontSizeInput.type = "number"
        fontSizeInput.min = "30"
        fontSizeInput.setAttribute("objectid", captionId)

        fontSizeInput.addEventListener("change", function(event){
            let inputInt = parseInt(this.value),
                captionTextElement = document.getElementById(this.attributes.objectid.value+"text")

            if( !isNaN(inputInt) )
            {
                captionTextElement.setAttribute("font-size", inputInt+"px")
                // find the matching html caption element
                let matchingCaption = document.getElementById( this.attributes.objectid.value )

                // updpate the text inside once found
                if( matchingCaption )
                {   
                    matchingCaption.lastChild.innerHTML = text2PieText(textinput.value, parseFloat(matchingCaption.getAttribute("width")), parseInt(captionTextElement.getAttribute("font-size")))
                }
            }
        })

        captionbackgroundcolorlabel.setAttribute("objectid", captionId)
        captionbackgroundcolorinput.setAttribute("objectid", captionId)
        captionbackgroundcolorinput.setAttribute("type", "color")
        captionbackgroundcolorinput.value = "#d3d3d3"

        captionbackgroundcolorlabel.innerHTML = "Background Color: "

        // set attributes and classes
        toolsarea.classList.add("captiontoolsbox")
        toolsarea.setAttribute("id", "captiontoolsbox-"+captionId)
        toolsarea.setAttribute("objectid", captionId)
        textlabel.innerHTML = "Caption Text: "
        textlabel.setAttribute("for", "captiontextinput")
        textinput.setAttribute("name","captiontextinput")
        textinput.setAttribute("placeholder", "Type your caption here")
        textinput.classList.add('textareainputfield')

        // pass the keyup listener to update the text input
        textinput.addEventListener("keyup", function(){

            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value+"text" )

            console.log(this.value)

            // updpate the text inside once found
            if(matchingCaption)
            {
                matchingCaption.innerHTML = text2PieText(this.value, parseFloat(matchingCaption.parentElement.getAttribute("width")), parseInt(matchingCaption.getAttribute("font-size")));
            }
        })

        /**
         * Do the same general idea for the text input on all the input to follow here
         */
        widthlabel.innerHTML = "Caption Width: "
        widthlabel.setAttribute("for", "widthinput")
        widthinput.setAttribute("type", "number")
        widthinput.setAttribute("min", '500')
        widthinput.setAttribute("max", 'none')
        widthinput.value = 750
        widthinput.setAttribute("name","widthinput")

        widthinput.addEventListener("change", function() {
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value )
            // updpate the text inside once found
            if(matchingCaption && !isNaN(Number(this.value)))
            {
                if( Number(this.value) < Number(this.getAttribute("min")) )
                {
                    matchingCaption.setAttribute("width", Number(this.getAttribute("min")))
                    this.value = Number(this.getAttribute("min"))
                }
                else
                {
                    matchingCaption.setAttribute("width", Number(this.value))
                }

                matchingCaption.lastChild.innerHTML = text2PieText(textinput.value, parseFloat(matchingCaption.getAttribute("width")), parseInt(document.getElementById(this.attributes.objectid.value+"text").getAttribute("font-size")))
            }
        })

        heightlabel.innerHTML = "Caption Height: "
        heightlabel.setAttribute("for", "heightinput")

        heightinput.setAttribute("type", "number")
        heightinput.setAttribute("min", '100')
        heightinput.value = 100
        heightinput.setAttribute("name","heightinput")
        heightinput.addEventListener("change", function() {
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value )
            // updpate the text inside once found
            if(matchingCaption && !isNaN(Number(this.value)))
            {
                if( Number(this.value) < Number(this.getAttribute("min")) )
                {
                    matchingCaption.setAttribute("height", Number(this.getAttribute("min")))
                    this.value = Number(this.getAttribute("min"))
                }
                else
                {
                    matchingCaption.setAttribute("height", Number(this.value))
                }
            }
        })

        xcoordlabel.innerHTML = "Caption X: "
        xcoordlabel.setAttribute("for", "xcoordinput")
        xcoordinput.setAttribute("type", "number")
        xcoordinput.value = 0
        xcoordinput.setAttribute("name","xcoordinput")

        xcoordinput.addEventListener("change", function() {
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value )
            // updpate the text inside once found
            if(matchingCaption && !isNaN(Number(this.value)))
            {
                matchingCaption.setAttribute("x", Number(this.value))
            }
        })
        
        ycoordlabel.innerHTML = "Caption Y: "
        ycoordlabel.setAttribute("for", "ycoordinput")
        ycoordinput.setAttribute("type", "number")
        ycoordinput.value = '0'
        ycoordinput.setAttribute("name","ycoordinput")
        
        ycoordinput.addEventListener("change", function() {
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value )
            // updpate the text inside once found
            if(matchingCaption && !isNaN(Number(this.value)))
            {
                matchingCaption.setAttribute("y", Number(this.value))
            }
        })

        captiontextcolorinput.addEventListener("change", function(event){
            updateCaptionTextColor( event.target.value , event.target.attributes.objectid.value)
        })

        captionbackgroundcolorinput.addEventListener("change", function(event){
            updateCaptionBoxColor( event.target.value , event.target.attributes.objectid.value)
        })

        // append all the elements to the tool box
        toolsarea.append( 
            textlabel,
            document.createElement("br"),
            textinput,
            document.createElement("br"),
            captiontextcolorlabel,
            document.createElement("br"),
            captiontextcolorinput,
            document.createElement("br"),
            captionbackgroundcolorlabel,
            document.createElement("br"),
            captionbackgroundcolorinput,
            document.createElement("br"),
            fontSizeLabel,
            document.createElement("br"),
            fontSizeInput,
            document.createElement("br"),
            widthlabel,
            document.createElement("br"),
            widthinput,
            document.createElement("br"),
            heightlabel,
            document.createElement("br"),
            heightinput,
            document.createElement("br"),
            xcoordlabel,
            document.createElement("br"),
            xcoordinput,
            document.createElement("br"),
            ycoordlabel,
            document.createElement("br"),
            ycoordinput
        )

        // set caption id on all input elements
        toolsarea.childNodes.forEach(element => {
            element.setAttribute("objectid", captionId)
        })

        // append all elements together
        newoptionsbar.append(
            header,
            minibtn,
            deletebtn,
            layerbtn,
            toolsarea
        )

        newoptionsbar.setAttribute( "objectid", captionId )

        // finish by appending the whole thing
        let holderbox = document.createElement("div")
        holderbox.setAttribute("class", "draggableToolbox")
        holderbox.append(newoptionsbar, toolsarea)
        holderbox.setAttribute("objectid", captionId)

        draggableList.getContainerObject().insertAdjacentElement("afterbegin", holderbox)

        /** Add a caption box in the svg area */
        const textholder = document.createElementNS(NS.svg, "svg")
        textholder.setAttribute("id", captionId)
        textholder.setAttribute("x", "0")
        textholder.setAttribute("y", "0")
        textholder.setAttribute("width", "750")
        textholder.setAttribute("height", "100")
        textholder.setAttribute("preserveAspectRatio", "xMidYMid meet")

        const rect = document.createElementNS(NS.svg,"rect");
        rect.setAttribute("id", captionId+"bg");
        rect.setAttribute("width", "100%");
        rect.setAttribute("height", "100%");
        rect.setAttribute("fill", "#fff");
        rect.setAttribute("x", "0");
        rect.setAttribute("y", "0");
        rect.classList.add("marker")

        const text = document.createElementNS(NS.svg, "text")
        
        text.setAttribute("id", captionId + "text")
        text.setAttribute("data-cy", "caption")
        text.setAttribute("width", "100%")
        text.setAttribute("height", "100%")
        text.setAttribute("font-size", "30px")
        text.setAttribute("pointer-events", "none")
        
        // how to display the caption text
        text.innerHTML = "<tspan x='0' y='30'>Type your caption here</tspan>"

        // finish by adding them to the document
        textholder.append(rect, text)
        draggableSvg.getContainerObject().appendChild(textholder)

        getObjectCount(1, "caption")
    });
    

    /**
     * @function button.toolboxaddimagebtn.click()
     * @description add the image to the svg and the toolbox stuff
     * 
     * TODO: POW
     * 
     */
    document.getElementById('addpowbtn').addEventListener("click", () =>
    {
        // used for identifying the tool box for each caption in the image 
        let imageId = randomId("image"),
            newoptionsbar = document.createElement("div"),
            header = document.createElement("h4"),
            minibtn = document.createElement("button"),
            deletebtn = document.createElement("button"),
            layerbtn = document.createElement("button"),
            toolsarea = document.createElement("div"),
            powIdLabel = document.createElement("label"),
            powIdInput = document.createElement("input"),
            powIdSubmitBtn = document.createElement("button"),
            imagesvg = document.createElementNS(NS.svg, "image");

        // create the main holder group for the image
        var holdergroup = document.createElementNS(NS.svg, "g");

        // set the class for the options bar
        newoptionsbar.classList.add("windowoptionsbar")
        newoptionsbar.style.display = "flex"

        newoptionsbar.addEventListener("click", function ( event )
        {
            optionsAction(event.target)
        })

        header.innerHTML = "POW Layer"

        // setup minimize button
        minibtn.classList.add("windowminimizebtn")
        minibtn.innerHTML = "▲"
        minibtn.addEventListener( "click", function(event) {
            minimizeToolsWindow(event)
        })

        // setup delete button
        deletebtn.classList.add("windowremovebtn")
        deletebtn.innerHTML = "&times"
        
        deletebtn.addEventListener("click", function(event){removeToolsWindow(event) })

        // set the class css and the svg button graphic
        createLayerBtn(layerbtn, draggableList)
        
        /** End Dynamic button*/

        // toolbox attributes
        toolsarea.classList.add("powtoolsbox")
        toolsarea.setAttribute("id", "powtoolsbox-"+imageId)
        toolsarea.setAttribute("objectid", imageId)

        powIdLabel.innerHTML = "Enter POW Job Id:";
        powIdInput.name = "powIdInput"
        
        powIdInput.placeholder = "4580b40493f62edca422fb1958d7635";

        powIdSubmitBtn.addEventListener("click", (e) => {
            let powId = powIdInput.value;
            const powRegExp = /(\d|\w){31}$/
            if( powRegExp.test(powId) )
            {
                console.log("THIS IS WHERE I NEED TO MAKE THE REQUEST TO THE SERVER TO FIND THE JOB ID FOLDER")

                // send request to server
                fetch(`/pow?pow=${powId}`, {
                    method: "GET",
                    header: {"Content-Type": "json"}
                })
                .then( imagedatares => imagedatares.json())
                .then((json) => {
                    console.log(json)
                })
            }
            else
            {
                window.alert("The ID you have entered could not be validated as a valid POW Job Id.")
            }
        });

        powIdSubmitBtn.innerHTML = "Submit Id"

        toolsarea.append(
            powIdLabel,
            powIdInput,
            powIdSubmitBtn
        )

        // set caption id on all input elements
        toolsarea.childNodes.forEach(element => {
            element.setAttribute("objectid", imageId)
        });

        // append all elements together
        newoptionsbar.append(header, minibtn, deletebtn, layerbtn, toolsarea)
        newoptionsbar.setAttribute("objectid", imageId)
    
        // finish by appending the whole thing
        let holderbox = document.createElement("div")
        holderbox.setAttribute("class", "draggableToolbox")
        holderbox.setAttribute("objectid", imageId+"-hg")
        holderbox.setAttribute("width", "100%")
        holderbox.setAttribute("height", "100%")
        holderbox.append(newoptionsbar, toolsarea)

        draggableList.getContainerObject().insertAdjacentElement("afterbegin", holderbox)

        // set image initial attributes
        imagesvg.setAttribute("x", "0")
        imagesvg.setAttribute("y", "0")
        imagesvg.setAttribute("width", "1500")
        imagesvg.setAttribute("height", "1000")
        imagesvg.setAttribute("id", imageId)
        imagesvg.setAttribute("class", "holder")

        // this is where the desfault image is set
        imagesvg.setAttribute("href", "#")

        holdergroup.appendChild(imagesvg)

        // This is the box that will hold the image and the icons for said image
        holdergroup.setAttribute("id", imageId+ "-hg")
        holdergroup.setAttribute("transform", "scale(1)")
        holdergroup.classList.add("containingelement")

        draggableSvg.getContainerObject().appendChild(holdergroup)

        // add 1 to the totaly image count
        getObjectCount(1, "image")
    });


    /**
     * @function button.toolboxaddimagebtn.click()
     * @description add the image to the svg and the toolbox stuff
     */
    document.getElementById('addimagebtn').addEventListener("click", () =>
    {
        // used for identifying the tool box for each caption in the image 
        let imageId = randomId("image"),
            newoptionsbar = document.createElement("div"),
            header = document.createElement("h4"),
            minibtn = document.createElement("button"),
            deletebtn = document.createElement("button"),
            layerbtn = document.createElement("button"),
            toolsarea = document.createElement("div"),
            filelabel = document.createElement("label"),
            fileinput = document.createElement("input"),
            widthlabel = document.createElement("label"),
            widthinput = document.createElement("input"),
            heightlabel = document.createElement("label"),
            heightinput = document.createElement("input"),
            xcoordlabel = document.createElement("label"),
            xcoordinput = document.createElement("input"),
            ycoordlabel = document.createElement("label"),
            ycoordinput = document.createElement("input"),
            scalelabel = document.createElement("label"),
            scaleinput = document.createElement("input"),
            imagesvg = document.createElementNS(NS.svg, "image"),
            holdergroup = document.createElementNS(NS.svg, "g");

        // set the class for the options bar
        newoptionsbar.classList.add("windowoptionsbar")
        newoptionsbar.style.display = "flex"
        newoptionsbar.addEventListener("click", function ( event )
        {
            optionsAction(event.target)
        })

        header.innerHTML = "Image Layer"

        // setup minimize button
        minibtn.classList.add("windowminimizebtn")
        minibtn.innerHTML = "▲"
        minibtn.addEventListener( "click", function(event) {
            minimizeToolsWindow(event)
        })

        // setup delete button
        deletebtn.classList.add("windowremovebtn")
        deletebtn.innerHTML = "&times"
        
        deletebtn.addEventListener("click", function(event){removeToolsWindow(event) })

        // set the class css and the svg button graphic
        createLayerBtn(layerbtn, draggableList)

        // toolbox attributes
        toolsarea.classList.add("imagetoolsbox")
        toolsarea.setAttribute("id", "imagetoolsbox-"+imageId)
        toolsarea.setAttribute("objectid", imageId)
       
        // file input attributes
        filelabel.innerHTML = "Upload an Image: "
        filelabel.setAttribute("for", "imageinput")
        fileinput.setAttribute("type", "file")
        fileinput.setAttribute("name", "imageinput")
        fileinput.setAttribute("id","input"+imageId)
        fileinput.classList.add('fileinputfield')

        // main form section for file input
        let form = document.createElement("form")
        form.setAttribute("runat", "server")
        form.setAttribute("class", "imageform")
        form.setAttribute("method", "post")
        form.setAttribute("enctype", "multipart/form-data")
        form.setAttribute("action", "/upload")
        form.appendChild(fileinput)

        // listener for when the user changes the image of the input field
        fileinput.addEventListener("change", function(event){
            // use regexp to test the acceptable file types and handle either way
            let imgregexp = new RegExp("^.*\.(png|PNG|jpg|JPG|SVG|svg)$")
            let isisregexp = new RegExp("^.*\.(CUB|cub|tif|TIF)$")

            if(imgregexp.test(this.value))
            {
                // add the loading icon
                document.getElementById("loadicon").style.visibility = "visible"

                // read a simple image file and display
                if(this.files && this.files[0])
                {
                    var reader = new FileReader()

                    // occurs after readAsDataURL
                    reader.onload = function(e) {
                        // use jquery to update the image source
                        document.getElementById(imageId).setAttribute('href', e.target.result)
                        document.getElementById(imageId).setAttribute('GEO', null)
                        document.getElementById(imageId).setAttribute('filePath', null)

                        ButtonManager.addImage( imageId, [])

                        // remove the north icon b/c there is no north data
                        try{
                            document.getElementById(`northIcon-${imageId}`).remove()
                        }
                        catch(err)
                        {
                            /** No Thing */
                        }

                        // remove the Sun icon b/c there is no sun data
                        try{
                            document.getElementById(`sunIcon-${imageId}`).remove()
                        }
                        catch(err)
                        {
                            /** No Thing */
                        }

                        // remove the Observer icon b/c there is no observer data
                        try{
                            document.getElementById(`observerIcon-${imageId}`).remove()
                        }
                        catch(err)
                        {
                            /** No Thing */
                        }

                        // remove the scale icon b/c there is no scale data
                        try{
                            document.getElementById(`scalebarIcon-${imageId}`).remove()
                        }
                        catch(err)
                        {
                            /** No Thing */
                        }

                        // remove the key icon b/c there is no scale data
                        try{
                            document.getElementById(`keyIcon-${imageId}`).remove()
                        }
                        catch(err)
                        {
                            /** No Thing */
                        }

                        // remove the load icon from the UI
                        document.getElementById("loadicon").style.visibility = "hidden"
                    }

                    // convert to base64 string
                    reader.readAsDataURL(this.files[0])
                }
            }
            else if( isisregexp.test(this.value) )
            {
                //add the loading icon
                document.getElementById("loadicon").style.visibility = "visible"
                
                // prevent page default submit
                event.preventDefault()

                // create a form data and request object to call the server
                var fd = new FormData(form)
                var xhr = new XMLHttpRequest()

                // when the requests load handle the response
                xhr.onloadend = () => {
                    var reader = new FileReader()

                    var responseObject = {}
                    try
                    {
                        JSON.parse(xhr.response)
                    }
                    catch(err)
                    {
                        // remove the btn after displaying the error to the user
                        var imgRemoveBtn = document.querySelector(`.windowoptionsbar[objectid='${imageId}']>.windowremovebtn`);
                        document.getElementById("loadicon").style.visibility = "hidden"
                        alert(`Image Failed to Upload:\nError: ${xhr.response}`)
                        imgRemoveBtn.click()
                        return false
                    }
                    
                    if (xhr.status == 200)
                    {
                        // Helps when testing server returns
                        console.log(xhr.response)

                        responseObject = JSON.parse(xhr.response)

                        fetch(responseObject.imagefile, {
                            method: "GET",
                            header: {"Content-Type": "blob"}
                        })
                        .then( imagedatares => imagedatares.blob())
                        .then((blob) => {
                            // remove the load icon from the UI
                            document.getElementById("loadicon").style.visibility = "hidden"

                            // occurs after readAsDataURL
                            reader.onload = function(e) {
                                // use jquery to update the image source
                                document.getElementById(imageId).setAttribute('href', e.target.result)
                                document.getElementById(imageId).setAttribute('GEO', 'true')

                                // TODO: if the lines or samples is not there then we need to figure out how to get
                                // set the height and width of the actual image.
                                document.getElementById(imageId).setAttribute('width', responseObject.pvlData.data['Samples'])
                                document.getElementById(imageId).setAttribute('height', responseObject.pvlData.data['Lines'])

                                // update image input fields
                                document.querySelector(`input[objectid='${imageId}'][name='widthinput']`).value = document.getElementById(imageId).getAttribute("width")
                                document.querySelector(`input[objectid='${imageId}'][name='heightinput']`).value = document.getElementById(imageId).getAttribute("height")
                                
                                // read in the data values into attribute values for the image
                                responseObject.pvlData.keys.forEach( key => {
                                    document.getElementById(imageId).parentElement.setAttribute(key, responseObject.pvlData.data[key])
                                });

                                // test to see which data values where recieved and activate the buttons that need to be activated for each data value.
                                var btnArray = []
                                // test if the north arrow data is valid and activte the button
                                if ( responseObject.pvlData.data['NorthAzimuth'] )
                                {
                                    btnArray.push('north')
                                    try{
                                        document.getElementById(`northIcon-${imageId}`).firstElementChild.setAttribute("transform", "rotate(" + (parseFloat(document.getElementById(imageId+"-hg").getAttribute("NorthAzimuth")) + 90) + " 13.5 13.5" + ")")
                                    }
                                    catch(err)
                                    {
                                        /** Nothing */
                                    }
                                }
                                else
                                {
                                    // remove the north icon b/c there is no north data
                                    try{
                                        document.getElementById(`northIcon-${imageId}`).remove()
                                    }
                                    catch(err)
                                    {
                                        /** No Thing */
                                    }
                                }
                                // test if the sun arrow data is valid and activte the button
                                if ( responseObject.pvlData.data['SubSolarAzimuth'] )
                                {
                                    btnArray.push('sun')
                                    try{
                                        document.getElementById(`sunIcon-${imageId}`).firstElementChild.setAttribute("transform", "rotate(" + (parseFloat(document.getElementById(imageId+"-hg").getAttribute("SubSolarAzimuth")) + 90) + " 13.5 13.5" + ")")
                                    }
                                    catch(err)
                                    {
                                        try{
                                            document.getElementById(`sunIcon-${imageId}`).remove()
                                        }
                                        catch(err)
                                        {
                                            /** No Thing */
                                        }
                                    }
                                }
                                else
                                {
                                    // remove the Sun icon b/c there is no sun data
                                    try{
                                        document.getElementById(`sunIcon-${imageId}`).remove()
                                    }
                                    catch(err)
                                    {
                                        /** No Thing */
                                    }
                                }
                                
                                // test if the observer arrow data is valid and activte the button
                                if ( responseObject.pvlData.data['SubSpacecraftGroundAzimuth'] )
                                {
                                    btnArray.push('observer')

                                    try{
                                        document.getElementById(`observerIcon-${imageId}`).firstElementChild.setAttribute("transform", "rotate(" + (parseFloat(document.getElementById(imageId+"-hg").getAttribute("SubSpacecraftGroundAzimuth")) + 90) + " 14 14" + ")")
                                    }
                                    catch(err)
                                    {
                                        try{
                                            document.getElementById(`observerIcon-${imageId}`).remove()
                                        }
                                        catch(err)
                                        {
                                            /** No Thing */
                                        }
                                    }
                                }
                                else
                                {
                                    // remove the Observer icon b/c there is no observer data
                                    try{
                                        document.getElementById(`observerIcon-${imageId}`).remove()
                                    }
                                    catch(err)
                                    {
                                        /** No Thing */
                                    }
                                }

                                // remove the key icon b/c there is no scale data
                                try{
                                    document.getElementById(`keyIcon-${imageId}`).remove()
                                }
                                catch(err)
                                {
                                    /** No Thing */
                                }

                                // test if the scalebar data is valid and activte the button
                                if ( responseObject.pvlData.data['PixelResolution'] )
                                {
                                    btnArray.push('scale');
                                    try {
                                        // calculate the scale nneded for the scalebar and multiply by the svg dimensions
                                        var scaleObject = getScalebarData( 
                                            ( document.getElementById(imageId + '-hg').getAttribute("PixelResolution") ) 
                                                ? document.getElementById(imageId + '-hg').getAttribute("PixelResolution")
                                                : document.getElementById(imageId + '-hg').getAttribute("ObliquePixelResolution"),
                                            document.getElementById(imageId).getAttribute("width"), document.getElementById(imageId).getAttribute("height"),
                                            document.getElementById(imageId + '-hg').getAttribute("Lines"), document.getElementById(imageId + '-hg').getAttribute("Samples"))

                                        let scalebar = document.getElementById(`scalebarIcon-${imageId}`)
                
                                        scalebar.setAttribute("width", (scaleObject.width * scaleObject.sc * 2) )
                                        scalebar.setAttribute("height", (scaleObject.sc * 700) )
                
                                        document.getElementById("scalestart-"+imageId).innerHTML = scaleObject.display
                                        document.getElementById("scaleend-"+imageId).innerHTML = scaleObject.display + " " + scaleObject.units
                                    }
                                    catch( err )
                                    {
                                        /** Nothing */
                                    }
                                }
                                else
                                {
                                    // remove the Scalebar icon b/c there is no observer data
                                    try{
                                        document.getElementById(`scalebarIcon-${imageId}`).remove()
                                    }
                                    catch(err)
                                    {
                                        /** No Thing */
                                    }
                                }

                                ButtonManager.addImage(imageId, btnArray )

                                // this is not the same in the testing environment
                                //console.log(responseObject)
                            }    
                            // convert to base64 string
                            reader.readAsDataURL(blob)
                        });
                    }
                    else if( xhr.status > 299 )
                    {
                        console.error("WHYY")
                        console.error(xhr.response)
                    }
                }

                // open the request and send the data
                xhr.open('POST', "/upload", true)
                xhr.send(fd)

                // prevent propigation with non-true return
                return false
            }
            else{
                alert("File Type Not Supported")
            }
        });

        // width input field
        widthlabel.innerHTML = "Image Width (Samples): "
        widthlabel.setAttribute("for", "widthinput")
        widthinput.value = 1500
        widthinput.setAttribute("name","widthinput")

        // height input field
        heightlabel.innerHTML = "Image Height (Lines): "
        heightlabel.setAttribute("for", "heightinput")
        heightinput.value = 1000
        heightinput.setAttribute("name","heightinput")
        
        // x coordinate input string
        xcoordlabel.innerHTML = "Image X: "
        xcoordlabel.setAttribute("for", "xcoordinput")
        xcoordinput.setAttribute("type", "number")
        xcoordinput.value = 0
        xcoordinput.setAttribute("name","xcoordinput")

        xcoordinput.addEventListener("change", function(){
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value )
            // updpate the text inside once found
            if(matchingCaption && !isNaN(Number(this.value)))
            {
                matchingCaption.setAttribute("x", Number(this.value))
            }
        })
        
        // y coordinate input strings
        ycoordlabel.innerHTML = "Image Y: "
        ycoordlabel.setAttribute("for", "ycoordinput")
        ycoordinput.setAttribute("type", "number")
        ycoordinput.setAttribute("min", '0')
        ycoordinput.value = 0
        ycoordinput.setAttribute("name","ycoordinput")

        ycoordinput.addEventListener("change", function(){
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value )
            // updpate the text inside once found
            if(matchingCaption && !isNaN(Number(this.value)))
            {
                matchingCaption.setAttribute("y", Number(this.value))
            }
        })

        // y coordinate input strings
        scalelabel.innerHTML = "Image Scale: "
        scalelabel.setAttribute("for", "scaleinput")
        scaleinput.setAttribute("type", "number")
        scaleinput.setAttribute("min", '.5')
        scaleinput.setAttribute("step", '.025')
        scaleinput.value = 1
        scaleinput.setAttribute("name","scaleinput")

        scaleinput.addEventListener("change", function(){
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value + "-hg" )
            // updpate the text inside once found
            if(matchingCaption && !isNaN(Number(this.value)))
            {
                matchingCaption.setAttribute("transform", `scale(${Number(this.value)})`)
            }
        })

        // icon divider section
        let divider2 = document.createElement("h3")
        divider2.classList.add("dividerline")
        divider2.setAttribute("id", "innerdivider")
        divider2.innerHTML = "Icon Tools"
    
        // append main tool box for image
        toolsarea.append( 
            filelabel, 
            document.createElement("br"),
            form, 
            document.createElement("br"), 
            widthlabel, 
            document.createElement("br"), 
            widthinput, 
            document.createElement("br"), 
            heightlabel, 
            document.createElement("br"), 
            heightinput, 
            document.createElement("br"), 
            scalelabel,
            document.createElement("br"),
            scaleinput,
            document.createElement("br"), 
            xcoordlabel, 
            document.createElement("br"),
            xcoordinput, 
            document.createElement("br"), 
            ycoordlabel, 
            document.createElement("br"), 
            ycoordinput, 
            document.createElement("br"), 
            divider2
        )

        // set caption id on all input elements
        toolsarea.childNodes.forEach(element => {
            element.setAttribute("objectid", imageId)
        })

        // append all elements together
        newoptionsbar.append(header, minibtn, deletebtn, layerbtn, toolsarea)
        newoptionsbar.setAttribute("objectid", imageId)
    
        // finish by appending the whole thing
        let holderbox = document.createElement("div")
        holderbox.setAttribute("class", "draggableToolbox")
        holderbox.setAttribute("objectid", imageId+"-hg")
        holderbox.setAttribute("width", "100%")
        holderbox.setAttribute("height", "100%")
        holderbox.append(newoptionsbar, toolsarea)

        draggableList.getContainerObject().insertAdjacentElement("afterbegin", holderbox)

        // set image initial attributes
        imagesvg.setAttribute("x", "0")
        imagesvg.setAttribute("y", "0")
        imagesvg.setAttribute("width", "1500")
        imagesvg.setAttribute("height", "1000")
        imagesvg.setAttribute("id", imageId)
        imagesvg.setAttribute("class", "holder")

        // this is where the desfault image is set
        imagesvg.setAttribute("href", "#")

        holdergroup.appendChild(imagesvg)

        // This is the box that will hold the image and the icons for said image
        holdergroup.setAttribute("id", imageId+ "-hg")
        holdergroup.setAttribute("transform", "scale(1)")
        holdergroup.classList.add("containingelement")

        draggableSvg.getContainerObject().appendChild(holdergroup)

        // add 1 to the totaly image count
        getObjectCount(1, "image")
    });

    /**
     * @function figsizeselect.onchange
     * @description changes the viewbox setting of the output figure
     */
    document.getElementById('figsizeselect').addEventListener("change", (event) =>
    {
        // update the svgContainer size
        let tmp = event.target.value.split("x")
        draggableSvg.getContainerObject().setAttribute("viewBox", "0 0 " + tmp[0] + ' ' + tmp[1])
        draggableSvg.getContainerObject().parentElement.setAttribute("viewBox", "-500 0 " + (Number(tmp[0])+1000) + ' ' + tmp[1])
        draggableSvg.getContainerObject().setAttribute("width", tmp[0])
        draggableSvg.getContainerObject().setAttribute("height", tmp[1])
    });

    /**
     * @function backgroundcolor.onchange
     * @description Changes the background color of the editing area.
     * will be visible when exported
     */
    document.getElementById('backgroundcolor').addEventListener("change", (event) => { setSVGBackground("bgelement", event.target.value) });

    /**
     * Loop over all the buttons and set the custom drag and drop functions
     */
    geoIconArray.forEach(element => {
        document.getElementById(element).addEventListener("mousedown", geoIconButtonListener)
    });

    /**
     * @function geoIconButtonListener
     * @param {MouseEvent} event 
     * @description this function is used to start the drag and drop events for the image metadata relignent buttons
     */
    function geoIconButtonListener( event )
    {
        if( leftClick(event.button) )
        {
            event.preventDefault()
            
            let btn = ( event.target.nodeName == "BUTTON" )? event.target: event.target.parentElement;
            if( btn.classList.contains("disabled") )
            {
                return false;
            }
            else if( getObjectCount(0,"image") != 0 )
            {
                if(selectedObject){
                    selectedObject = null
                }
                else {
                    // make new shadow icon
                    shadowIcon.icon = shadowIcon.drawShadowIcon( event )
                    document.addEventListener("mousemove", shadowIcon.shadowAnimate);
                    document.getElementsByClassName("maincontent")[0].appendChild(shadowIcon.icon);

                    btn.classList.add("selected")
                    document.addEventListener("mouseup", setElement, true)
                }
            }
            else{
                alert("There must be a Geospacial Image in the figure to add geo icons.")
            }
        }
    }
 
    /**
     * @function setElement
     * @param {_Event} event 
     * @description set the current element that the mouse dropped over
     */
    function setElement( event ) 
    {
        let btn = document.getElementsByClassName( "selected" )[ 0 ]
        
        document.getElementsByClassName("maincontent")[0].removeChild(shadowIcon.icon)
        document.removeEventListener("mousemove", shadowIcon.shadowAnimate)

        shadowIcon.icon = null

        if(typeofObject(event.target.id) == "image" && event.target.getAttribute("GEO") == "true")
        {
            if( btn.id.indexOf("north") > -1 && event.target.parentElement.getAttribute("NorthAzimuth"))
            {
                // set element
                selectedObject = event.target
            }
            else if( btn.id.indexOf("sun") > -1 && event.target.parentElement.getAttribute("SubSolarAzimuth") )
            {
                // set element
                selectedObject = event.target
            }
            else if( btn.id.indexOf("observer") > -1 && event.target.parentElement.getAttribute("SubSpacecraftGroundAzimuth") )
            {
                // set element
                selectedObject = event.target
            }
            else if( btn.id.indexOf("scale") > -1 && event.target.parentElement.getAttribute("PixelResolution") )
            {
                // set element
                selectedObject = event.target
            }
            else if( btn.id.indexOf("key") > -1 )
            {
                // set element
                selectedObject = event.target
            }
            else
            {
                alert("Data Error:\nThe image you are adding the icon to does not have the required metadata for this icon.")
            }
        }
        else if(btn != event.target)
        {
            alert("CANNOT ADD ICON TO THIS ELEMENT")
        }

        // remove the current listener
        this.removeEventListener("mouseup", setElement, true)
        btn.classList.remove("selected")

        /* call the drawing function with the type of image that can
        be found fron the btn and on the selectedObject*/
        if ( selectedObject )
        {
            let iconType

            if( btn.id.indexOf( "north" ) > -1 )
            {
                iconType = "north"
            }
            else if( btn.id.indexOf( "sun" ) > -1 )
            {
                iconType = "sun"
            }
            else if( btn.id.indexOf( "observer" ) > -1 )
            {
                iconType = "observer"
            }
            else if( btn.id.indexOf( "scalebar" ) > -1 )
            {
                iconType = "scalebar"
            }
            else if( btn.id.indexOf( "key" ) > -1 )
            {
                iconType = "key"
            }
            else
            {
                console.log("Unknown Object ID = " + btn.id)
            }
            
            // draw the icon
            drawSvgIcon( selectedObject, iconType, event )

            // after drawing svg icon is finished remove the object
            selectedObject = null
        }
    }

    /**
     * @function drawSvgIcon
     * @param {Node} image 
     * @param {string} icontype 
     * @param {_Event} event
     * @description this function draws the svg icons over the svg figure image where the mouse drop occurs
     */
    function drawSvgIcon( image, icontype, event )
    {
        let icongroup = null,
            svgP = null,
            newX = 0,
            newY = 0;

        switch (icontype)
        {
            // drawing the north icon
            case "north":
                if ( !document.getElementById('northIcon-' + image.id) )
                {
                    // get svg transformed point
                    svgP = draggableSvg.svgAPI(event.clientX, event.clientY)

                    // set group attributes for svg
                    icongroup = document.getElementById("northgroup").cloneNode(true)
                    icongroup.setAttribute("objectid", image.id)
                    icongroup.setAttribute("id", "northIcon-" + image.id)

                    // set the translate location of the icon to where the mouse was released
                    newX = getScaledPoint( svgP.x, 1, 27*5 )
                    newY = getScaledPoint( svgP.y, 1, 27*5 )

                    // test valid input and set the transform for all browsers
                    if( !isNaN(newX) && !isNaN(newY))
                    {
                        // set the x and y location
                        icongroup.setAttribute("x", newX)
                        icongroup.setAttribute("y", newY)
                        
                        // create the scale attribute
                        icongroup.setAttribute("scale", 5)

                        // set the height and width using the scale
                        icongroup.setAttribute("width", 27 * icongroup.getAttribute("scale"))
                        icongroup.setAttribute("height", 27 * icongroup.getAttribute("scale"))
                        
                        // rotate the icon
                        icongroup.firstChild.setAttribute("transform", "rotate(" + (parseFloat(document.getElementById(image.id+"-hg").getAttribute("NorthAzimuth")) + 90) + " 13.5 13.5" + ")" )
                    }
                    else
                    {
                        console.error("Translate Values Failed")
                    }
                    // append the icon to the svg object
                    document.getElementById(image.id+"-hg").appendChild(icongroup)
                }
                else
                {
                    iconFailureAlert()
                }
                break;
        
            case "sun":
                if( !document.getElementById('sunIcon-'+image.id) )
                {
                    // get svg transformed point
                    svgP = draggableSvg.svgAPI(event.clientX, event.clientY)

                    // set group attributes for svg
                    icongroup = document.getElementById("sungroup").cloneNode(true)
                    icongroup.setAttribute("objectid", image.id)
                    icongroup.setAttribute("id", "sunIcon-" + image.id)
                
                    // set the translate location of the icon to where the mouse was released
                    newX = getScaledPoint( svgP.x, 1, 27*5 )
                    newY = getScaledPoint( svgP.y, 1, 27*5 )

                    // test valid input and set the transform for all browsers
                    if( !isNaN(newX) && !isNaN(newY))
                    {
                        // set the x and y location
                        icongroup.setAttribute("x", newX)
                        icongroup.setAttribute("y", newY)

                        // set the scale
                        icongroup.setAttribute("scale", 5)

                        // set the width and height
                        icongroup.setAttribute("width", 27 * icongroup.getAttribute("scale") )
                        icongroup.setAttribute("height", 27 * icongroup.getAttribute("scale") )

                        icongroup.firstChild.setAttribute("transform", "rotate(" + (parseFloat(document.getElementById(image.id+"-hg").getAttribute("SubSolarAzimuth")) + 90) + " 13.5 13.5" + ")" )
                    }
                    else
                    {
                        console.log("Translate Values Failed")
                    }

                    // append the icon
                    document.getElementById(image.id+"-hg").appendChild(icongroup)
                }
                else
                {
                    iconFailureAlert()
                }
                break
        
            case "observer":
                if( !document.getElementById('observerIcon-'+image.id) )
                {
                    // get svg transformed point
                    svgP = draggableSvg.svgAPI(event.clientX, event.clientY)

                    // set group attributes for svg
                    icongroup = document.getElementById("observergroup").cloneNode(true)
                    icongroup.setAttribute("objectid", image.id)
                    icongroup.setAttribute("id", "observerIcon-" + image.id)

                    // set the translate location of the icon to where the mouse was released
                    newX = getScaledPoint( svgP.x, 1, 27*5 )
                    newY = getScaledPoint( svgP.y, 1, 27*5 )

                    // test valid input and set the transform for all browsers
                    if( !isNaN(newX) && !isNaN(newY))
                    {
                        icongroup.setAttribute("x", newX)
                        icongroup.setAttribute("y", newY)
                        icongroup.setAttribute("scale", 5)
                        icongroup.setAttribute("width", 27 * icongroup.getAttribute("scale") )
                        icongroup.setAttribute("height", 27 * icongroup.getAttribute("scale") )
                    
                        icongroup.firstChild.setAttribute("transform", "rotate(" + (parseFloat(document.getElementById(image.id+"-hg").getAttribute("SubSpacecraftGroundAzimuth")) + 90) + " 13.5 13.5" + ")" )
                    }
                    else
                    {
                        console.error("Translate Values Failed")
                    }

                    // append the icon
                    document.getElementById(image.id+"-hg").appendChild(icongroup)
                }
                else
                {
                    iconFailureAlert()
                }
                break

            case "scalebar":
                if( !document.getElementById("scalebarIcon-" + image.id) )
                {
                    // get svg transformed point
                    svgP = draggableSvg.svgAPI(event.clientX, event.clientY)
                        
                    // set group attributes for svg
                    icongroup = document.getElementById("scalebargroup").cloneNode(true)
                    icongroup.setAttribute("objectid", image.id)
                    icongroup.setAttribute("id", "scalebarIcon-" + image.id)

                    // test valid input and set the transform for all browsers
                    if( !isNaN(newX) && !isNaN(newY))
                    {                 
                        // calculate the scale nneded for the scalebar and multiply by the svg dimensions
                        var scaleObject = getScalebarData( 
                            ( document.getElementById(image.id + '-hg').getAttribute("PixelResolution") ) 
                                ? document.getElementById(image.id + '-hg').getAttribute("PixelResolution")
                                : document.getElementById(image.id + '-hg').getAttribute("ObliquePixelResolution"),
                            document.getElementById(image.id).getAttribute("width"), document.getElementById(image.id).getAttribute("height"),
                            document.getElementById(image.id + '-hg').getAttribute("Lines"), document.getElementById(image.id + '-hg').getAttribute("Samples"))
                        
                        icongroup.setAttribute("width", (scaleObject.width * scaleObject.sc * 2) )
                        icongroup.setAttribute("height", (scaleObject.sc * 700) )

                        // set the translate location of the icon to where the mouse was released
                        newX = getScaledPoint( svgP.x, 1, parseFloat(icongroup.getAttribute("width")) )
                        newY = getScaledPoint( svgP.y, 1, parseFloat(icongroup.getAttribute("height")) )

                        // set translate
                        icongroup.setAttribute("x", newX)
                        icongroup.setAttribute("y", newY)
                    }
                    else
                    {
                        console.error("Translate Values Failed")
                    }

                    // append the icon
                    document.getElementById(image.id+"-hg").appendChild(icongroup)

                    var scaleNumberStart = document.querySelectorAll("tspan#scalestart")
                    var scaleNumberEnd = document.querySelectorAll("tspan#scaleend")

                    scaleNumberEnd[1].id = "scaleend-"+image.id
                    scaleNumberStart[1].id = "scalestart-"+image.id

                    document.getElementById("scalestart-"+image.id).innerHTML = scaleObject.display
                    document.getElementById("scaleend-"+image.id).innerHTML = scaleObject.display + " " +  scaleObject.units
                }
                else
                {
                    iconFailureAlert()
                }
                break

            case "key":
                if( !document.getElementById("keyIcon-" + image.id) )
                {
                    // get svg transformed point
                    svgP = draggableSvg.svgAPI(event.clientX, event.clientY)
                        
                    // set group attributes for svg
                    icongroup = document.createElementNS( NS.svg, "svg")

                    // add dimensions to svg
                    icongroup.setAttribute("xlink", NS.svg)
                    icongroup.setAttribute("viewBox", "0 0 400 800")
                    icongroup.setAttribute("scale", "5")
                    icongroup.setAttribute("id", image.id+"-keygroup")
                    icongroup.setAttribute("objectid", "keyIcon-" + image.id)

                    icongroup.setAttribute("objectid", image.id)
                    icongroup.setAttribute("id", "keyIcon-" + image.id)

                    // set the translate location of the icon to where the mouse was released
                    newX = getScaledPoint( svgP.x, 1, 27*5 )
                    newY = getScaledPoint( svgP.y, 1, 27*5 )

                    // test valid input and set the transform for all browsers
                    if( !isNaN(newX) && !isNaN(newY))
                    {
                        
                        // determine how many lines the key box needs to have
                        let imageDataObject = retrieveDataObject( image.id + "-hg" ),
                            svgStringsObject = getSvgIcons( imageDataObject );

                            // svgStringsObject will contain the icons as innerHTML strings and keys that coordinate with imageDataObject
                            // console.log(svgStringsObject)

                        let keyDim = {width: 400, height: 800};

                        icongroup.setAttribute("width", keyDim.width)
                        icongroup.setAttribute("height", keyDim.height)

                        var holder = document.createElementNS( NS.svg, "g"),
                            metagroup = document.createElementNS( NS.svg, "g")
                        holder.classList.add("holder")

                        metagroup.setAttribute("fill", "#000000")

                        var offset = -30,
                            textoffset = 110;
                        Object.keys(svgStringsObject).forEach(key => {
                            // parts to meta line
                            var text = document.createElementNS(NS.svg, "text"),
                                imagesvg = document.createElementNS(NS.svg, "svg"),
                                angle = document.createElementNS(NS.svg, "text");

                            imagesvg.setAttribute("viewBox", "0 0 100 160")
                            imagesvg.setAttribute("x", 285)
                            imagesvg.setAttribute("y", offset)

                            // set the key
                            text.innerHTML = key
                            text.setAttribute("x", 25)
                            text.setAttribute("height", 30)
                            text.setAttribute("font-size", "22px")
                            text.setAttribute("y", textoffset)

                            imagesvg.innerHTML = svgStringsObject[key];

                            angle.innerHTML = imageDataObject[key];
                            angle.setAttribute("x", 40)
                            angle.setAttribute("height", 30)
                            angle.setAttribute("font-size", "25px")
                            angle.setAttribute("y", textoffset + 35)

                            metagroup.append(text, imagesvg, angle);
                            offset += 120;
                            textoffset += 115;
                        });

                        var mainkeybox = document.createElementNS(NS.svg, "rect")
                        mainkeybox.setAttribute("width", keyDim.width)
                        mainkeybox.setAttribute("height", keyDim.height)
                        mainkeybox.setAttribute("fill", "#ffffff")
                        mainkeybox.setAttribute("stroke", "#000000")
                        mainkeybox.setAttribute("stroke-width", "20px")

                        var text_header = document.createElementNS( NS.svg, "text")
                        text_header.setAttribute("x", "170")
                        text_header.setAttribute("y", "50")
                        text_header.setAttribute("font-size", "42px")
                        text_header.setAttribute("font-family", "Ariel")
                        text_header.setAttribute("fill", "#000000")
                        text_header.setAttribute("stroke", "#ffffff")
                        text_header.setAttribute("stroke-width", "1px")
                        text_header.innerHTML = "Key"

                        var marker = document.createElementNS( NS.svg, "rect")
                        marker.setAttribute("width", keyDim.width)
                        marker.setAttribute("height", keyDim.height)
                        marker.setAttribute("class", "marker")
                        marker.setAttribute("fill", "transparent")
                        marker.setAttribute("stroke", "transparent")

                        holder.append( mainkeybox, text_header, metagroup)

                        icongroup.append(holder, marker)

                        icongroup.setAttribute("x", newX)
                        icongroup.setAttribute("y", newY)
                    }
                    else
                    {
                        console.error("Translate Values Failed")
                    }

                    // append the icon
                    document.getElementById(image.id+"-hg").appendChild(icongroup)
                }
                else
                {
                    iconFailureAlert()
                }
                break
        }

        if( icongroup != null )
        {
            // find proper tool box
            let imagetoolbox = findImageToolbox( selectedObject.id, document.getElementsByClassName("imagetoolsbox") )

            // draw the tool box based on the icon type
            drawToolbox( imagetoolbox, icontype, icongroup.id, newX, newY )
        }
    }
}) // end of jquery functions

/* Helper functions */

/**
 * @function getSvgIcons
 * @param {JSON} obj the json object that houses the data values and their keys 
 * @description this function helps the key drawing functions by returning a batch of icons that need to used during the key construction
 * @return it's important that returnObj has the same key map as the input obj
 */
function getSvgIcons( obj )
{
    var returnObj = {};
    Object.keys( obj ).forEach( key => {
        if( key.indexOf('North') > -1 )
        {
            returnObj[key] = document.getElementById("northgroup").innerHTML
        }
        else if( key.indexOf('Solar') > -1 )
        {
            returnObj[key] = document.getElementById("sungroup").innerHTML
        }
        else if( key.indexOf('Spacecraft') > -1 )
        {
            returnObj[key] = document.getElementById("observergroup").innerHTML
        }
        else if( key.indexOf('Phase') > -1 || key.indexOf('Emission') > -1 || key.indexOf('Incidence') > -1  )
        {
            returnObj[key] = createIcon( key )
        }
    });
    return returnObj;
}

/**
 * @function createIcon
 * @param {string} key the keys of the special object
 * @description this function passes back the html string of the icon that will be used by the key to show angle values and any other icon needed that is not already an svg icon on the screen
 */
function createIcon( key )
{
    switch( key )
    {
        case "Phase":
            return '<g transform="rotate(1.0153 60.444 -51.232)">\
            <g transform="matrix(.92397 -.004502 .0052733 1.0823 0 0)" stroke-width=".72858" aria-label="0">\
             <path d="m15.48 23.654q-1.5653 0-2.8602-0.73996-1.2807-0.73996-2.2056-2.0633-0.91072-1.3234-1.4088-3.1591-0.49805-1.8357-0.49805-4.0129 0-2.0064 0.49805-3.7852 0.49805-1.7787 1.4088-3.1021 0.92495-1.3376 2.2056-2.106 1.2949-0.76842 2.8602-0.76842t2.846 0.76842q1.2807 0.76842 2.1914 2.106 0.92495 1.3234 1.423 3.1021 0.49805 1.7787 0.49805 3.7852 0 2.1772-0.49805 4.0129-0.49805 1.8357-1.423 3.1591-0.91072 1.3234-2.1914 2.0633t-2.846 0.73996zm0-0.93918q0.95341 0 1.6649-0.73996t1.1811-1.9922q0.46959-1.2522 0.69727-2.8745 0.24191-1.6364 0.24191-3.4294 0-1.793-0.24191-3.401-0.22768-1.608-0.69727-2.8033-0.46959-1.2095-1.1811-1.921-0.7115-0.7115-1.6649-0.7115-0.96764 0-1.6791 0.7115-0.7115 0.7115-1.1811 1.921-0.46959 1.1953-0.69727 2.8033-0.22768 1.608-0.22768 3.401 0 1.793 0.22768 3.4294 0.22768 1.6222 0.69727 2.8745 0.46959 1.2522 1.1811 1.9922t1.6791 0.73996z" stroke-width=".72858"/>\
            </g>\
            <path d="m9.8557 13.56h9.1943v1.6536h-9.1943z" stroke-linecap="round" stroke-linejoin="round" stroke-width=".23998" style="paint-order:fill markers stroke"/>\
           </g>';

        case "Incidence":
            return  '<g transform="translate(1.0708 -.35694)">\
            <g transform="matrix(.90664 .17818 -.2087 1.062 0 0)" stroke-width=".72858" aria-label="i">\
             <path d="m11.905 7.4232v-0.99086q0.43714-0.17486 1.1657-0.34972 0.72858-0.204 1.5446-0.34972t1.6029-0.23314q0.816-0.11657 1.428-0.11657l0.52457 0.34972-2.6229 12.561h2.04v0.99086q-0.37886 0.26229-0.90343 0.49543-0.49543 0.23314-1.0783 0.408-0.55372 0.17486-1.1366 0.26229-0.58286 0.11657-1.1074 0.11657-1.1074 0-1.5446-0.408-0.408-0.43714-0.408-0.93258 0-0.58286 0.08743-1.1366t0.23314-1.224l1.9817-9.0343zm2.448-6.5572q0-0.99086 0.67029-1.5446t1.6903-0.55372q1.1074 0 1.7486 0.55372 0.67029 0.55372 0.67029 1.5446 0 0.93258-0.67029 1.4863-0.64115 0.55372-1.7486 0.55372-1.02 0-1.6903-0.55372-0.67029-0.55372-0.67029-1.4863z" stroke-width=".72858"/>\
            </g>\
           </g>';
        
        case "Emission":
            return '<g transform="translate(.086042 -4.2161)">\
            <g transform="matrix(.90664 .17818 -.2087 1.062 0 0)" stroke-width=".72858" aria-label="e">\
             <path d="m22.688 17.128q-0.32057 0.58286-0.93258 1.224-0.612 0.612-1.428 1.1366-0.816 0.49543-1.8069 0.816-0.99086 0.34972-2.0692 0.34972-2.5937 0-4.0509-1.3989-1.428-1.428-1.428-4.0217 0-2.0109 0.64115-3.7886 0.64115-1.7777 1.7777-3.1183 1.1657-1.3697 2.7394-2.1566 1.6029-0.78686 3.4972-0.78686 1.7486 0 2.8852 0.816 1.1366 0.78686 1.1366 2.1857 0 1.9817-1.9817 3.264-1.9526 1.2823-6.3532 1.6029-0.08743 0.408-0.14572 0.84515-0.02914 0.408-0.02914 0.78686 0 1.6612 0.84515 2.5646 0.84515 0.87429 2.1566 0.87429 0.55372 0 1.1074-0.17486t1.0491-0.46629q0.52457-0.29143 0.93258-0.612 0.43714-0.34972 0.75772-0.67029zm-3.7303-10.083q-0.99086 0-1.9234 1.0783-0.90343 1.0783-1.5154 3.6429 2.1566-0.05829 3.468-0.96172 1.3406-0.90343 1.3406-2.3606 0-0.58286-0.32057-0.99086-0.29143-0.408-1.0491-0.408z" stroke-width=".72858"/>\
            </g>\
           </g>';
    }
}

/**
 * @function retrieveDataObject
 * @param {string} holderid the id of the object holding the metadata
 */
function retrieveDataObject( holderid )
{
    var holder =  document.getElementById( holderid )
    var keyObject = {
        "Emission": null,
        "Incidence": null,
        "Phase": null,
        "NorthAzimuth": null,
        "SubSolarAzimuth": null,
        "SubSpacecraftGroundAzimuth": null,
        "PixelResolution": null,
        "ObliquePixelResolution": null,
    }

    Object.keys(keyObject).forEach( key => {
        keyObject[key] = holder.getAttribute(key)
    })
    return keyObject;
}


/**
 * @function configDraggables
 * @requires DraggableContainer
 * @requires DraggableList
 * @param {SVG Object} svg 
 * @param {HTML Object} dragCont 
 * @description this function just initiates the draggable things on the index page
 */
function configDraggables( svg, dragCont )
{
    // create the Draggable Object Container
    draggableSvg = DraggableArea( svg )
    // create the DraggableList
    draggableList = DraggableList( dragCont )
}

/**
 * @function preConfigPage
 * @description this function is to set a few required things for the body of the index that cannot be set
 *              with a PUG template
 */
function preConfigPage()
{
    // contain the index homepage
    document.body.parentElement.setAttribute("class", "contained")
    // disable contextmenu listener for the figure
    document.getElementById('figurecontainer').setAttribute("oncontextmenu", "return false;")
}

 /**
  * @function iconFailureAlert
  * @description alert the user that adding icons can only happen one time
  */
function iconFailureAlert()
{
    window.alert("User Error: Cannot add multiple icons to the same image.\n\n Let the developers know if this feature should change.")
}

/**
 * @function startButtonManager
 * @description a simple object that helps handle the button UIs
 */
var startButtonManager = function() {

    var MemoryObject = {};

    return {
        refresh: function()
        {
            // deactivate all the buttons
            setMains("disable")
            
            // activate only the ones that are needed
            Object.keys(MemoryObject).forEach( imageId => {

                if( MemoryObject[imageId].indexOf("north") > -1 )
                {
                    // activate the north button
                    document.getElementById("northarrowopt").classList.remove("disabled")
                    document.getElementById("keyopt").classList.remove("disabled")
                }
                if( MemoryObject[imageId].indexOf("sun") > -1 )
                {
                    // activate the north button
                    document.getElementById("sunarrowopt").classList.remove("disabled")
                    document.getElementById("keyopt").classList.remove("disabled")
                }
                if( MemoryObject[imageId].indexOf("observer") > -1 )
                {
                    // activate the north button
                    document.getElementById("observerarrowopt").classList.remove("disabled")
                    document.getElementById("keyopt").classList.remove("disabled")
                }
                if( MemoryObject[imageId].indexOf("scale") > -1 )
                {
                    // activate the north button
                    document.getElementById("scalebarbtnopt").classList.remove("disabled")
                    document.getElementById("keyopt").classList.remove("disabled")
                }
            });
        },

        addImage: function( imagename, btnArray )
        {
            MemoryObject[imagename] = btnArray
            this.refresh()
        },

        removeImage: function( imagename )
        {
            if( MemoryObject[imagename] ) 
            {
                delete MemoryObject[imagename]
                this.refresh()
            }
        }
    }
}
const ButtonManager = startButtonManager();

/**
 * @function startActiveEM
 * @description This function creates an event manager object that acts as a universal flagger to start or disable running events
 */
var startActiveEM = function() {
    var RunningEvent = undefined;

    return {
        activateEvent: function()
        {
            // if there is no event running then return true otherwise false
            if( RunningEvent )
            {
                return false;
            }
            else
            {
                return true;
            }
        },

        setEventFlag: function( val ) {
            RunningEvent = val;
        },

        deactivateBtn: function( id )
        {
            var btn = document.getElementById(id)
            if( btn )
            {
                btn.classList.add("disabled")
            }
        },

        reactivateBtn: function( id )
        {
            var btn = document.getElementById(id)
            if( btn )
            {
                btn.classList.remove("disabled")
            }
        }
    };
}

/**
 * @function getScalebarData
 * @param {float} resolution ISIS data point either PixelResolution or ObliquePixelResolution
 * @param {number} imageW Image width
 * @param {number} imageH Image height
 * @param {integer} lineCount ISIS data point Lines
 * @param {integer} sampleCount ISIS data point Samples
 * @description Function was created with the help of Laszlo Kestay's mathematics on ISIS scalebar data
 */
function getScalebarData( resolution, imageW, imageH, lineCount, sampleCount )
{
    var widthScale = imageW/sampleCount,
        heightScale = imageH/lineCount,
        obj = {},
        imageWidthMeters = resolution * sampleCount;
    
    obj['sc'] = (widthScale <= heightScale) ? widthScale : heightScale;

    var realImageWidthMeters = (heightScale < widthScale)? ((heightScale * imageW)*resolution)/2 : imageWidthMeters/2;

    /* Laszlo's bar Algortithm */
    // cut the legth of the image in meters in half and then get the base10 of it
    let x = Math.log10(realImageWidthMeters);
    // save the floor of that value as another variable
    let a = Math.floor(x);
    // get the remaining room between incriments of 10
    let b = x - a;
    // if the decimal is 75% or more closer to a whole 10 set the base to 5
    // check if 35% or greater, set base 2
    // if the value is very close to a whole base on the low side 
    //      set base to 5 and decrement the 10 base
    // (this is to keep text from leaving image)
    // default to 1
    if(b >= 0.75){
        b = 5;
    }
    else if(b >= 0.35){
        b = 2;
    }
    else if(b<.05){
        a -= 1;
        b = 5;
    }
    else{
        b=1;
    }

    // init the return data
    var scalebarMeters = b*Math.pow(10,a),
        scalebarLength = null,
        scalebarPx = null,
        scalebarUnits="";

    // if the length is less than 1km return length in meters
    if(imageWidthMeters/1000 < 1){
        scalebarLength = scalebarMeters;
        scalebarPx = parseInt(scalebarLength / (parseFloat(resolution)));
        scalebarUnits = "m";
    }
    else{
        scalebarLength = scalebarMeters/1000;
        scalebarPx = parseInt(scalebarLength / (parseFloat(resolution)/1000));
        scalebarUnits = "km";
    }

    // set the return parts
    obj['width'] = scalebarPx
    obj['units'] = scalebarUnits
    obj['display'] = scalebarLength
    
    // return the object
    return obj;
}

/**
 * @function removeToolsWindow
 * @param {_Event} event - the event to remove a window when button click happens
 * @description This function is used to delete the tools window and options bar from the tool box area
*/
function removeToolsWindow( event )
{
    if(event.target.parentElement.attributes.objectid.value)
    {
        // remove the current options bar, its next child and the caption matching the same id
        var parentBox = event.target.parentElement.parentElement,
            svgObject = document.getElementById(event.target.parentElement.attributes.objectid.value),
            svgcontainer = draggableSvg.getContainerObject()

        ButtonManager.removeImage(event.target.parentElement.attributes.objectid.value)

        // remove the options and other things for image
        draggableList.removeObject(parentBox)

        // remove the image holder now
        if( svgcontainer === svgObject.parentElement )
        {
            svgcontainer.removeChild(svgObject);
        }
        else
        {
            svgcontainer.removeChild(svgObject.parentElement);
        }
    }
}

/**
 * @function minimizeToolsWindow
 * @param {_Event} event
 * @description this is used to close and open the tool boxes using the close btn in the optionsbar
 *      this is a general function so if the html of the tool box area changes so does this
 */
function minimizeToolsWindow( event )
{
    if( event.target.parentElement.nextElementSibling.classList.contains("closed") )
    {
        // set open UI
        event.target.innerHTML = '▲'
        event.target.parentElement.nextElementSibling.classList.remove("closed")
    }
    else
    {
        // set closed UI
        event.target.innerHTML = '▼'
        event.target.parentElement.nextElementSibling.classList.add("closed")
    }
}

/**
 * @function detectMouseWheelDirection
 * @param {_Event} e - the mouse wheel event
 * @description tells which way the scroll wheel is going vertically
 */
function detectMouseWheelDirection( e )
{
    var delta = null,
        direction = false;

    if ( !e ) 
    { // if the event is not provided, we get it from the window object
        e = window.event;
    }
    if ( e.wheelDelta )
    { // will work in most cases
        delta = e.wheelDelta / 60;
    } else if ( e.detail )
    { // fallback for Firefox
        delta = -e.detail / 2;
    }
    // set return value
    if ( delta !== null ) 
    {
        direction = delta > 0 ? 'up' : 'down';
    }
    // return he vertical direction the mouse is moving
    return direction;
}

/**
 * @function randomId
 * @param {string} textareaprefix
 * @description generate a random number and return with prefix
 */
function randomId( textareaprefix )
{
    return textareaprefix + String( Math.floor((Math.random() * 1000) + 1) )
}

/**
 * stores and retrieves object count for me
 */
var imageCount = 0,
    captionCount = 0;

/**
 * @function objectCount
 * @param {number} inc - 0: show the current count, 1: add 1 to the count then return, -1: remove 1 from count then return
 * @description arg explained below and what it does 
 */
function getObjectCount( inc=0, objecttype="both" ) 
{
    // switch on the object
    switch( objecttype )
    {
        case "image":
            // switch on the increment
            switch( inc )
            {
                case 1: 
                    return ++imageCount
                case -1:
                    return --imageCount
                default:
                    return imageCount
            }
        case "caption":
            // switch on the increment
            switch( inc )
            {
                case 1: 
                    return ++captionCount
                case -1:
                    return --captionCount
                default:
                    return captionCount
            }
        case "both":
            return captionCount + imageCount
    }
}

/**
 * @function typeofObject
 * @param {string} testString
 * @description this function uses regexp to check and see if a string fits on of the object prefixes
 */
function typeofObject(testString)
{
    // create the new Reg-Expresions
    let imagereexp = new RegExp('^image[0-9]*')
    let captionreexp = new RegExp('^caption[0-9]*')

    // test string for image
    if( imagereexp.test( testString ) )
    {
        return "image";
    }
    // test string for caption
    else if( captionreexp.test( testString ) )
    {
        return "caption";
    }
    else{
        return "none";
    }
}

/**
 * @function drawToolbox
 * @param {Node} toolbox 
 * @param {string} icontype 
 * @param {string} iconId
 * @param {number} transX 
 * @param {number} transY
 * @description draws tool boxes for each icon, this method allows for more than 1 of each icon
 * 
 * TODO: refactor this function
 */
function drawToolbox( toolbox, icontype, iconId, transX, transY )
{
    switch ( icontype )
    {
        case "north":
            let iconscaleinput = document.createElement("input"),
                iconmaincolorinput = document.createElement("input"),
                iconaccentcolorinput = document.createElement("input"),
                scalelabel = document.createElement("label"),
                maincolorlabel = document.createElement("label"),
                accentcolorlabel = document.createElement("label"),
                icontoolbox = document.createElement("div"),
                iconoptionbar = document.createElement("div"),
                iconoptionheader = document.createElement("h4"),
                deletebtn = document.createElement("button"),
                northicontranslatex = document.createElement("input"),
                northicontranslatexlabel = document.createElement("label"),
                northicontranslatey = document.createElement("input"),
                northicontranslateylabel = document.createElement("label");

            // options bar stuff
            iconoptionbar.setAttribute("class", 'windowoptionsbar')
            iconoptionbar.style.display = "flex"
            iconoptionbar.addEventListener("click", function ( event )
            {
                optionsAction(event.target)
            })

            iconoptionheader.innerHTML = "North Icon"

            // same for delete as minimize
            deletebtn.classList.add("windowremovebtn")
            deletebtn.innerHTML = "&times"

            // set event listener to remove north icon
            deletebtn.addEventListener( "click", function(event) {
                removeIconWindow(event)
            })

            // set aptions bar nodes
            iconoptionbar.append( 
                iconoptionheader,
                document.createElement("br"), 
                deletebtn
            )
            iconoptionbar.setAttribute("objectid", iconId)

            // set scale attributes
            iconscaleinput.setAttribute("type", "number")
            iconscaleinput.setAttribute("objectid", iconId)
            iconscaleinput.setAttribute("name", "iconscaleinput")
            icontoolbox.setAttribute("objectid", iconId)
            iconscaleinput.setAttribute("step", 0.5)
            iconscaleinput.setAttribute("min", 1)
            iconscaleinput.value = 5

            // labels for north
            maincolorlabel.innerHTML = "North Main Color: "
            maincolorlabel.setAttribute("for", "iconmaincolorinput")

            accentcolorlabel.innerHTML = "North Secondary Color: "
            accentcolorlabel.setAttribute("for", "iconsecondarycolorinput")

            scalelabel.innerHTML = "North Scale: "
            scalelabel.setAttribute("for", "iconscaleinput")

            // both color input fields
            iconmaincolorinput.setAttribute("type", "color")
            iconmaincolorinput.setAttribute("objectid", iconId)
            iconmaincolorinput.value = "#ffffff"
            iconmaincolorinput.setAttribute("name", "iconmaincolorinput")

            iconaccentcolorinput.setAttribute("type", "color")
            iconaccentcolorinput.setAttribute("objectid", iconId)
            iconaccentcolorinput.value = "#000000"
            iconaccentcolorinput.setAttribute("name", "iconsecondarycolorinput")

            // set translate x and y element attributes
            northicontranslatex.setAttribute("type", "number")
            northicontranslatex.setAttribute("objectid", iconId)
            northicontranslatex.setAttribute("min", "0")
            northicontranslatex.setAttribute("name", "iconxcoordinput")

            northicontranslatey.setAttribute("type", "number")
            northicontranslatey.setAttribute("objectid", iconId)
            northicontranslatey.setAttribute("min", "1")
            northicontranslatey.setAttribute("name", "iconycoordinput")

            // set translate value based on icon scale and fix to integer
            northicontranslatex.value = (transX).toFixed(0)
            northicontranslatey.value = (transY).toFixed(0)

            // set translate labels
            northicontranslateylabel.innerHTML = "North Y: "
            northicontranslateylabel.setAttribute("for", "iconycoordinput")

            northicontranslatexlabel.innerHTML = "North X: "
            northicontranslatexlabel.setAttribute("for", "iconxcoordinput")

            // set event listeners
            iconscaleinput.addEventListener("change", updateIconScale)

            iconmaincolorinput.addEventListener("change", function(event){updateIconColor(event, 0)})
            iconaccentcolorinput.addEventListener("change", function(event){updateIconColor(event, 1)})
            northicontranslatex.addEventListener("change", function(event){updateIconPosition(event, 0)})
            northicontranslatey.addEventListener("change", function(event){updateIconPosition(event, 1)})

            icontoolbox.classList.add("icontoolbox")

            // append elements to page
            icontoolbox.append(
                maincolorlabel,
                document.createElement("br"),
                iconmaincolorinput,
                document.createElement("br"),
                accentcolorlabel,
                document.createElement("br"),
                iconaccentcolorinput,
                document.createElement("br"),
                scalelabel,
                document.createElement("br"),
                iconscaleinput,
                document.createElement("br"),
                northicontranslatexlabel,
                document.createElement("br"),
                northicontranslatex,
                document.createElement("br"),
                northicontranslateylabel,
                document.createElement("br"),
                northicontranslatey 
            )
            toolbox.append(iconoptionbar, icontoolbox)
            break
    
        case "sun":

            let suniconscaleinput = document.createElement("input"),
                suniconmaincolorinput = document.createElement("input"),
                suniconaccentcolorinput = document.createElement("input"),
                sunscalelabel = document.createElement("label"),
                sunmaincolorlabel = document.createElement("label"),
                sunaccentcolorlabel = document.createElement("label"),
                sunicontoolbox = document.createElement("div"),
                sunoptionbar = document.createElement("div"),
                sunoptionheader = document.createElement("h4"),
                deletebtn1 = document.createElement("button"),
                sunicontranslatex = document.createElement("input"),
                sunicontranslatexlabel = document.createElement("label"),
                sunicontranslatey = document.createElement("input"),
                sunicontranslateylabel = document.createElement("label");

            // options bar stuff
            sunoptionbar.setAttribute("class", 'windowoptionsbar')
            sunoptionbar.style.display = "flex"
            sunoptionbar.addEventListener("click", function ( event )
            {
                optionsAction(event.target)
            })

            sunoptionheader.innerHTML = "Sun Icon"

            // same for delete as minimize
            deletebtn1.classList.add("windowremovebtn")
            deletebtn1.innerHTML = "&times"
            
            // add remove window listener
            deletebtn1.addEventListener( "click", function(event) {
                removeIconWindow(event)
            })

            // translate x and y input fields
            sunicontranslatex.setAttribute("type", "number")
            sunicontranslatex.setAttribute("objectid", iconId)
            sunicontranslatex.setAttribute("min", "0")
            sunicontranslatex.setAttribute("name", "iconxcoordinput")

            sunicontranslatey.setAttribute("type", "number")
            sunicontranslatey.setAttribute("objectid", iconId)
            sunicontranslatey.setAttribute("min", "1")
            sunicontranslatey.setAttribute("name", "iconycoordinput")

            // set label input
            sunicontranslateylabel.innerHTML = "Sun Y: "
            sunicontranslateylabel.setAttribute("for", "iconycoordinput")

            sunicontranslatexlabel.innerHTML = "Sun X: "
            sunicontranslatexlabel.setAttribute("for", "iconxcoordinput")

            // append optionsbar stuff
            sunoptionbar.append(sunoptionheader, document.createElement("br"), deletebtn1)
            sunoptionbar.setAttribute("objectid", iconId)

            // scale input fields
            suniconscaleinput.setAttribute("type", "number")
            suniconscaleinput.setAttribute( "objectid", iconId )
            suniconscaleinput.value = "5"
            suniconscaleinput.setAttribute("min", 1)
            suniconscaleinput.setAttribute("step", "0.5")
            suniconscaleinput.setAttribute("name", "iconscaleinput")

            // labels for input fields
            sunmaincolorlabel.innerHTML = "Sun Main Color: "
            sunmaincolorlabel.setAttribute("for", "iconmaincolorinput")

            sunaccentcolorlabel.innerHTML = "Sun Secondary Color: "
            sunaccentcolorlabel.setAttribute("for", "iconsecondarycolorinput")

            sunscalelabel.innerHTML = "Sun Scale: "
            sunscalelabel.setAttribute("for", "iconscaleinput")

            // set translate value
            sunicontranslatex.value = (transX).toFixed(0)
            sunicontranslatex.setAttribute("name", "iconxcoordinput")

            sunicontranslatey.value = (transY).toFixed(0)
            sunicontranslatey.setAttribute("name", "iconycoordinput")

            // main color input
            suniconmaincolorinput.setAttribute("type", "color")
            suniconmaincolorinput.setAttribute( "objectid", iconId )
            suniconmaincolorinput.value = "#ffffff"
            suniconmaincolorinput.setAttribute("name", "iconmaincolorinput")

            // color accent input
            suniconaccentcolorinput.setAttribute("type", "color")
            suniconaccentcolorinput.setAttribute( "objectid", iconId )
            suniconaccentcolorinput.value = "#000000"
            suniconaccentcolorinput.setAttribute("name", "iconsecondarycolorinput")

            // set event listeners
            suniconscaleinput.addEventListener("change", updateIconScale, false)
            suniconmaincolorinput.addEventListener("change", function(event){updateIconColor(event, 0)}, false)
            suniconaccentcolorinput.addEventListener("change", function(event){updateIconColor(event, 1)}, false)
            sunicontranslatex.addEventListener("change", function(event){updateIconPosition(event, 0)}, false)
            sunicontranslatey.addEventListener("change", function(event){updateIconPosition(event, 1)}, false)

            sunicontoolbox.classList.add("icontoolbox")

            // append all elements to page
            sunicontoolbox.append(
                sunmaincolorlabel,
                document.createElement("br"),
                suniconmaincolorinput,
                document.createElement("br"),
                sunaccentcolorlabel,
                document.createElement("br"),
                suniconaccentcolorinput,
                document.createElement("br"),
                sunscalelabel, 
                document.createElement("br"),
                suniconscaleinput,
                document.createElement("br"),
                sunicontranslatexlabel,
                document.createElement("br"),
                sunicontranslatex,
                document.createElement("br"),
                sunicontranslateylabel,
                document.createElement("br"),
                sunicontranslatey
            )
            toolbox.append( sunoptionbar, sunicontoolbox )
            break
    
        case "observer":

            let obsiconscaleinput = document.createElement("input"),
                obsiconmaincolorinput = document.createElement("input"),
                obsiconaccentcolorinput = document.createElement("input"),
                obsscalelabel = document.createElement("label"),
                obsmaincolorlabel = document.createElement("label"),
                obsaccentcolorlabel = document.createElement("label"),
                obsicontoolbox = document.createElement("div"),
                obsoptionbar = document.createElement("div"),
                obsoptionheader = document.createElement("h4"),
                deletebtn2 = document.createElement("button"),
                obsicontranslatex = document.createElement("input"),
                obsicontranslatexlabel = document.createElement("label"),
                obsicontranslatey = document.createElement("input"),
                obsicontranslateylabel = document.createElement("label");

            // Set Options bar stuff
            obsoptionbar.setAttribute("class", 'windowoptionsbar')
            obsoptionbar.style.display = "flex"
            obsoptionbar.addEventListener("click", function ( event )
            {
                optionsAction(event.target)
            })
            
            obsoptionheader.innerHTML = "Observer Icon"

            // same for delete as minimize
            deletebtn2.classList.add("windowremovebtn")
            deletebtn2.innerHTML = "&times"

            // add event listener for delete btn
            deletebtn2.addEventListener( "click", function(event) {
                removeIconWindow(event)
            })

            // x and y translate
            obsicontranslatex.setAttribute("type", "number")
            obsicontranslatex.setAttribute("objectid", iconId)
            obsicontranslatex.setAttribute("min", "0")
            obsicontranslatex.setAttribute("name", "iconxcoordinput")

            obsicontranslatey.setAttribute("type", "number")
            obsicontranslatey.setAttribute("objectid", iconId)
            obsicontranslatey.setAttribute("min", "1")
            obsicontranslatey.setAttribute("name", "iconycoordinput")

            // set start values for label and value of translate
            obsicontranslateylabel.innerHTML = "Observer Y: "
            obsicontranslateylabel.setAttribute("for", "iconycoordinput")
            
            obsicontranslatexlabel.innerHTML = "Observer X: "
            obsicontranslatexlabel.setAttribute("for", "iconxcoordinput")

            // scale input field
            obsiconscaleinput.setAttribute("type", "number")
            obsiconscaleinput.setAttribute("objectid", iconId)
            obsiconscaleinput.setAttribute("step", "0.5")
            obsiconscaleinput.setAttribute("value", 5)
            obsiconscaleinput.setAttribute("min", "1")
            obsiconscaleinput.setAttribute("name", "iconscaleinput")

            obsicontranslatex.value = (transX).toFixed(0)
            obsicontranslatey.value = (transY).toFixed(0)

            // create labels
            obsmaincolorlabel.innerHTML = "Observer Main Color: "
            obsmaincolorlabel.setAttribute("for", "iconmaincolorinput")

            obsaccentcolorlabel.innerHTML = "Observer Secondary Color: "
            obsaccentcolorlabel.setAttribute("for", "iconsecondarycolorinput")

            obsscalelabel.innerHTML = "Observer Scale: "
            obsscalelabel.setAttribute("for", "maincolorinput")

            // primary color input
            obsiconmaincolorinput.setAttribute("type", "color")
            obsiconmaincolorinput.setAttribute("objectid", iconId)
            obsiconmaincolorinput.value = "#ffffff"
            obsiconmaincolorinput.setAttribute("name", "iconmaincolorinput")

            // color input secondary
            obsiconaccentcolorinput.setAttribute("type", "color")
            obsiconaccentcolorinput.setAttribute("objectid", iconId)
            obsiconaccentcolorinput.value = "#000000"
            obsiconaccentcolorinput.setAttribute("name", "iconsecondarycolorinput")

            // add events
            obsiconscaleinput.addEventListener("change", updateIconScale, false)
            obsiconmaincolorinput.addEventListener("change", function(event){updateIconColor(event, 0)}, false)
            obsiconaccentcolorinput.addEventListener("change", function(event){updateIconColor(event, 1)}, false)
            obsicontranslatex.addEventListener("change", function(event){updateIconPosition(event, 0)}, false)
            obsicontranslatey.addEventListener("change", function(event){updateIconPosition(event, 1)}, false)

            obsicontoolbox.classList.add("icontoolbox")

            // append aspect to options bar
            obsoptionbar.append( obsoptionheader, document.createElement("br"), deletebtn2 )
            obsoptionbar.setAttribute( "objectid", iconId )

            // append rest of options
            obsicontoolbox.append( 
                obsmaincolorlabel,
                document.createElement("br"),
                obsiconmaincolorinput,
                document.createElement("br"),
                obsaccentcolorlabel,
                document.createElement("br"),
                obsiconaccentcolorinput,
                document.createElement("br"),
                obsscalelabel, 
                document.createElement("br"), 
                obsiconscaleinput, 
                document.createElement("br"),
                obsicontranslatexlabel, 
                document.createElement("br"),
                obsicontranslatex,
                document.createElement("br"),
                obsicontranslateylabel, 
                document.createElement("br"),
                obsicontranslatey
            )
            
            // append optionsbar and tools
            toolbox.append( obsoptionbar, obsicontoolbox )
            break


        case "scalebar":
            let scalemaincolorinput = document.createElement("input"),
                scaleaccentcolorinput = document.createElement("input"),
                scaleaccentcolorlabel = document.createElement("label"),
                scalemaincolorlabel = document.createElement("label"),
                scaleicontoolbox = document.createElement("div"),
                scaleoptionbar = document.createElement("div"),
                scaleoptionheader = document.createElement("h4"),
                deletebtn3 = document.createElement("button"),
                scaleicontranslatex = document.createElement("input"),
                scaleicontranslatexlabel = document.createElement("label"),
                scaleicontranslatey = document.createElement("input"),
                scaleicontranslateylabel = document.createElement("label");

            // Set Options bar stuff
            scaleoptionbar.setAttribute("class", 'windowoptionsbar')
            scaleoptionbar.style.display = "flex"
            scaleoptionbar.addEventListener("click", function ( event )
            {
                optionsAction(event.target)
            })
            
            scaleoptionheader.innerHTML = "Scalebar Icon"

            // same for delete as minimize
            deletebtn3.classList.add("windowremovebtn")
            deletebtn3.innerHTML = "&times"

            // add event listener for delete btn
            deletebtn3.addEventListener( "click", function(event) {
                removeIconWindow(event)
            })

            // x and y translate
            scaleicontranslatex.setAttribute("type", "number")
            scaleicontranslatex.setAttribute("objectid", iconId)
            scaleicontranslatex.setAttribute("min", "0")

            scaleicontranslatex.setAttribute("name", "iconxcoordinput")
            scaleicontranslatey.setAttribute("name", "iconycoordinput")

            scaleicontranslatey.setAttribute("type", "number")
            scaleicontranslatey.setAttribute("objectid", iconId)
            scaleicontranslatey.setAttribute("min", "1")

            // set start values for label and value of translate
            scaleicontranslateylabel.innerHTML = "Scalebar Y: "
            scaleicontranslatexlabel.innerHTML = "Scalebar X: "

            scaleicontranslatex.value = (transX*0.5).toFixed(0)
            scaleicontranslatey.value = (transY*0.5).toFixed(0)

            // create labels
            scalemaincolorlabel.innerHTML = "Scalebar Main Color: "
            scaleaccentcolorlabel.innerHTML = "Scalebar Secondary Color: "

            // primary color input
            scalemaincolorinput.setAttribute("type", "color")
            scalemaincolorinput.setAttribute("objectid", iconId)
            scalemaincolorinput.value = "#ffffff"

            // color input secondary
            scaleaccentcolorinput.setAttribute("type", "color")
            scaleaccentcolorinput.setAttribute("objectid", iconId)
            scaleaccentcolorinput.value = "#000000"

            // add events
            scalemaincolorinput.addEventListener("change", function(event){updateIconColor(event, 0)}, false)
            scaleaccentcolorinput.addEventListener("change", function(event){updateIconColor(event, 1)}, false)
            scaleicontranslatex.addEventListener("change", function(event){updateIconPosition(event, 0)}, false)
            scaleicontranslatey.addEventListener("change", function(event){updateIconPosition(event, 1)}, false)

            scaleicontoolbox.classList.add("icontoolbox")

            // append aspect to options bar
            scaleoptionbar.append( scaleoptionheader, document.createElement("br"), deletebtn3 )
            scaleoptionbar.setAttribute( "objectid", iconId )

            // append rest of options
            scaleicontoolbox.append( 
                scalemaincolorlabel,
                document.createElement("br"),
                scalemaincolorinput,
                document.createElement("br"),
                scaleaccentcolorlabel,
                document.createElement("br"),
                scaleaccentcolorinput,
                document.createElement("br"),
                scaleicontranslatexlabel, 
                document.createElement("br"),
                scaleicontranslatex,
                document.createElement("br"),
                scaleicontranslateylabel, 
                document.createElement("br"),
                scaleicontranslatey
            )
            
            // append optionsbar and tools
            toolbox.append( scaleoptionbar, scaleicontoolbox )
            break

        case "key":
            let keymaincolorinput = document.createElement("input"),
                keyaccentcolorinput = document.createElement("input"),
                keyaccentcolorlabel = document.createElement("label"),
                keymaincolorlabel = document.createElement("label"),
                keyicontoolbox = document.createElement("div"),
                keyoptionbar = document.createElement("div"),
                keyoptionheader = document.createElement("h4"),
                deletebtn4 = document.createElement("button"),
                keyicontranslatex = document.createElement("input"),
                keyicontranslatexlabel = document.createElement("label"),
                keyicontranslatey = document.createElement("input"),
                keyicontranslateylabel = document.createElement("label");

            // Set Options bar stuff
            keyoptionbar.setAttribute("class", 'windowoptionsbar')
            keyoptionbar.style.display = "flex"
            keyoptionbar.addEventListener("click", function ( event )
            {
                optionsAction(event.target)
            })
            
            keyoptionheader.innerHTML = "Image Key"

            // same for delete as minimize
            deletebtn4.classList.add("windowremovebtn")
            deletebtn4.innerHTML = "&times"

            // add event listener for delete btn
            deletebtn4.addEventListener( "click", function(event) {
                removeIconWindow(event)
            })

            // x and y translate
            keyicontranslatex.setAttribute("type", "number")
            keyicontranslatex.setAttribute("objectid", iconId)
            keyicontranslatex.setAttribute("min", "0")

            keyicontranslatex.setAttribute("name", "iconxcoordinput")
            keyicontranslatey.setAttribute("name", "iconycoordinput")

            keyicontranslatey.setAttribute("type", "number")
            keyicontranslatey.setAttribute("objectid", iconId)
            keyicontranslatey.setAttribute("min", "1")

            // set start values for label and value of translate
            keyicontranslateylabel.innerHTML = "Key Y: "
            keyicontranslatexlabel.innerHTML = "Key X: "

            keyicontranslatex.value = (transX*0.5).toFixed(0)
            keyicontranslatey.value = (transY*0.5).toFixed(0)

            // create labels
            keymaincolorlabel.innerHTML = "Key Main Color: "
            keyaccentcolorlabel.innerHTML = "Key Secondary Color: "

            // primary color input
            keymaincolorinput.setAttribute("type", "color")
            keymaincolorinput.setAttribute("objectid", iconId)
            keymaincolorinput.value = "#ffffff"

            // color input secondary
            keyaccentcolorinput.setAttribute("type", "color")
            keyaccentcolorinput.setAttribute("objectid", iconId)
            keyaccentcolorinput.value = "#000000"

            // add events
            keymaincolorinput.addEventListener("change", function(event){updateIconColor(event, 0)}, false)
            keyaccentcolorinput.addEventListener("change", function(event){updateIconColor(event, 1)}, false)
            keyicontranslatex.addEventListener("change", function(event){updateIconPosition(event, 0)}, false)
            keyicontranslatey.addEventListener("change", function(event){updateIconPosition(event, 1)}, false)

            keyicontoolbox.classList.add("icontoolbox")

            // append aspect to options bar
            keyoptionbar.append( keyoptionheader, document.createElement("br"), deletebtn4 )
            keyoptionbar.setAttribute( "objectid", iconId )

            // append rest of options
            keyicontoolbox.append( 
                keymaincolorlabel,
                document.createElement("br"),
                keymaincolorinput,
                document.createElement("br"),
                keyaccentcolorlabel,
                document.createElement("br"),
                keyaccentcolorinput,
                document.createElement("br"),
                keyicontranslatexlabel, 
                document.createElement("br"),
                keyicontranslatex,
                document.createElement("br"),
                keyicontranslateylabel, 
                document.createElement("br"),
                keyicontranslatey
            )
            
            // append optionsbar and tools
            toolbox.append( keyoptionbar, keyicontoolbox )
            break

        default:
            console.log("UHHH OHH this is wrong")
    }
}

/**
 * @function updateIconPosition
 * @param {_Event} event - event for the change
 * @param {number} attrId - a number to tell you either x or y 
 * @description helps update the location of the icon group
 */
function updateIconPosition ( event, attrId )
{
    let object = document.getElementById( event.target.attributes.objectid.value )

    if( attrId == 0 )
    {
        updateTranslate( object, "x", parseFloat( event.target.value ) )
    }
    else if( attrId == 1 )
    {
        updateTranslate( object, "y", parseFloat( event.target.value ) )
    }
}

/**
 * @function findImageToolbox
 * @param {string} id 
 * @param {NodeList} array 
 * @description find the element with the id in the array
 */
function findImageToolbox( id, array )
{
    for( let index = 0; index < array.length; index++ )
    {
        if( array[ index ].attributes.objectid.value == id )
        {
            return array[ index ]
        }
    }
}

/**
 * @function updateIconScale
 * @param {_Event} event - event that started the function
 * @description change the scale of the icon at the target
 */
function updateIconScale( event )
{
    var icon = document.getElementById( event.target.attributes.objectid.value )
    var inputvalue = parseFloat( event.target.value )
    if( !isNaN( inputvalue ) )
    {   
        icon.setAttribute("scale", inputvalue)
        icon.setAttribute("width", parseFloat(icon.getAttribute("viewBox").split(" 0 ")[1])*inputvalue )
        icon.setAttribute("height", parseFloat(icon.getAttribute("viewBox").split(" 0 ")[1])*inputvalue )
    }
}

/**
 * @function rescaleIconTransform
 * @param {number} oldscale - old scale (used to unscale the icon before setting new scale)
 * @param {number} scale - new scale 
 * @param {string} x - the transform x
 * @param {string} y - the transform y value
 * @description return an object that has all the components for the setTransform() function besides that actual icon
 */
function rescaleIconTransform ( oldscale, scale, x, y )
{
    let newx = x * oldscale / scale 
    let newy = y * oldscale / scale 

    // return new transform dimensions
    return {sc: scale, x:newx, y:newy}
}


/**
 * @function removeIconWindow
 * @param {_Event} event - the click event that started it
 * @description remove the icon tool box and the icon svg element
 */
function removeIconWindow( event )
{   
    if( event.target.parentElement.attributes.objectid.value )
    {
        // remove the current options bar, its next child and the caption matching the same id
        let icontoolsbar = event.target.parentElement
        let toolsbox = icontoolsbar.nextElementSibling
        let iconsvg = document.getElementById( icontoolsbar.attributes.objectid.value )
        let imagetoolbox = document.getElementById( "imagetoolsbox-" + iconsvg.attributes.objectid.value )

        imagetoolbox.removeChild( icontoolsbar )
        imagetoolbox.removeChild( toolsbox )
        document.getElementById(icontoolsbar.attributes.objectid.value.split('-')[1] + "-hg").removeChild( iconsvg )
    }
}

/**
 * @function removeMarker
 * @param {string} markerString - raw string in the form of url("#<id>")
 * @description this function removes the given marker string fromn the defs section inn the svg
 */
function removeMarker( markerId )
{
    document.getElementById( markerId ).remove()
}

/**
 * @function removeLineWindow
 * @param {_Event} event - click event on the button
 * @description remove the line objects and tools
 */
function removeLineWindow( event )
{
    if( event.target.parentElement.parentElement.attributes.objectid.value )
    {
        // remove the current options bar, its next child and the caption matching the same id
        let holderbox = event.target.parentElement.parentElement
        let linesvg = document.getElementById( holderbox.attributes.objectid.value )

        // remove all elements
        holderbox.parentElement.removeChild( holderbox )
        draggableSvg.getContainerObject().removeChild( linesvg )

        try{
            // remove marker if there is one
            if( linesvg.getAttribute("marker-end") )
            {
                removeMarker(linesvg.getAttribute("marker-end").split("url(#")[1].replace(")","") )
            }

            if( linesvg.getAttribute("marker-start") )
            {
                removeMarker(linesvg.getAttribute("marker-start").split("url(#")[1].replace(")","") )
            }
        }
        catch(err)
        {
            console.log("MARKER ERROR: " + err)
        }
    }
}

/**
 * @function updateIconColor
 * @param {_Event} event - the event object
 * @param {string} colorid - denoted 0 primmary color and 1 secondary color
 * @description update the color of the object at the target
 */
function updateIconColor( event , colorid )
{
    let icon = document.getElementById( event.target.attributes.objectid.value )
    let inputvalue = event.target.value

    switch( colorid )
    {
        case 0:
            changeIconColor( colorid, inputvalue, icon )
            break
        case 1:
            changeIconColor( colorid, inputvalue, icon )
            break
    }
}

/**
 * @function changeIconColor
 * @param {number} colorid - the id of the color, denoted primary and secondary as 0,1 respectivley
 * @param {string} colorval - the new color
 * @param {Node} icon - the icon element
 */
function changeIconColor( colorid, colorval, icon )
{
    switch( colorid )
    {
        case 0:
            // change main color
            if( icon.id.indexOf( "north" ) > -1 )
            {
                // change all three children of the north icon
                changeColorsOfChildren( icon.firstElementChild.childNodes, colorval, "", "", "", "", "","fill", "fill", "fill", "fill", "fill")
            }
            else if( icon.id.indexOf( "sun" ) > -1 )
            {
                // change the primary of the sun icon
                changeColorsOfChildren( icon.firstElementChild.childNodes, colorval, "fill", "fill", "stroke")
            }
            else if( icon.id.indexOf( "observer" ) > -1 )
            {
                // change the primary of the observer icon
                changeColorsOfChildren( icon.firstElementChild.childNodes, colorval, "fill", "fill", "", "fill", "", "fill", "fill", "" )
            }
            else if( icon.id.indexOf( "scalebar" ) > -1 )
            {
                // change the primary of the observer icon
                changeColorsOfChildren( icon.firstElementChild.childNodes, colorval, "stroke", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "stroke")
            }
            else if( icon.id.indexOf( "key" ) > -1 )
            {
                // change the primary
                updateKeyColor( 0, colorval, icon.id )

            }
            break
        case 1:
            // change secondary color
            if( icon.id.indexOf( "north" ) > -1 )
            {
                // change the secondary of the north icon
                changeColorsOfChildren( icon.firstElementChild.childNodes, colorval, "stroke", "fill stroke", "fill stroke", "fill stroke", "fill stroke", "stroke", "stroke", "stroke", "stroke", "stroke" )
            }
            else if( icon.id.indexOf( "sun" ) > -1 )
            {
                // change the secondary of the sun icon
                changeColorsOfChildren( icon.firstElementChild.childNodes, colorval, "stroke", "stroke", "fill")
            }
            else if( icon.id.indexOf( "observer" ) > -1 )
            {
                // change the secondary of the observer icon
                changeColorsOfChildren( icon.firstElementChild.childNodes, colorval, "stroke", "stroke", "stroke fill", "stroke", "fill stroke", "stroke", "stroke", "stroke fill" )
            }
            else if( icon.id.indexOf( "scalebar" ) > -1 )
            {
                // change the primary of the observer icon
                changeColorsOfChildren( icon.firstElementChild.childNodes, colorval, "fill", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" )
            }
            else if( icon.id.indexOf( "key" ) > -1 )
            {
                // change the accent color of the key
                updateKeyColor( 1, colorval, icon.id )
            }
    }
}

/**
 * @function updateKeyColor
 * @param {number} code the code to tell if the function works on the main colo or the secondary color 
 * @param {string} value the color value to change to
 * @param {string} iconId the id of the icon we are changing 
 * @description this function is used to set the color of the key and all pf the interroir icons 
 */
function updateKeyColor( code, value, iconId )
{
    var icon = document.getElementById( iconId ),
        childNodeArr = icon.firstElementChild.children;

    // # to represent complex structure used to hold the other icons and text
    var changeArray = (code === 0)?['fill', 'stroke', '#']:['stroke', 'fill', '#'];

    // loop through the main elements
    for (let index = 0; index < childNodeArr.length; index++) {
        const child = childNodeArr[index];

        // check if this element is a complex group
        if( changeArray[index] !== '#')
        {
            // set the value using the attrobute array grabbed from the code
            if( changeArray[index].indexOf(' ') == -1 )
            {
                child.setAttribute(changeArray[index], value)
            }
        }
        else
        {
            // set the values of the special group
            var svgMirrorArray = (code == 0)? [ [""], [""], [""], ["", "", "", "", "","fill", "fill", "fill", "fill", "fill"], ["fill", "fill", "stroke"], ["fill", "fill", "", "fill", "", "fill", "fill", ""] ]:
                 [ ["fill"], ["fill"], ["fill"], ["fill stroke", "fill stroke", "fill stroke", "fill stroke", "fill stroke","stroke", "stroke", "stroke", "stroke", "stroke"], ["stroke", "stroke", "fill"], ["stroke", "stroke", "fill stroke", "stroke", "fill stroke", "stroke", "stroke", "fill stroke"]];
            var svgIndex = 0;

            // loop through the child doing the same thing as before settting the values of the children of each svg and text elements
            for (let iindex = 0; iindex < child.childNodes.length; iindex++)
            {
                const innerChild = child.childNodes[iindex],
                    svgAttrs = svgMirrorArray[svgIndex];

                switch( innerChild.nodeName.toString().toLowerCase() )
                {
                    case "svg":
                        if ( innerChild.childNodes.length == 1 )
                        {
                            if( svgAttrs.length == 1 && svgAttrs[0] != "" )
                            {
                                innerChild.childNodes[0].setAttribute(svgAttrs[0], value)
                            }
                        }
                        else
                        {
                            for (let d = 0; d < innerChild.firstChild.childNodes.length; d++) {
                                const currentChild = innerChild.firstChild.childNodes[d];

                                if( String(svgAttrs[d]).indexOf(" ") > -1 &&  String(svgAttrs[d]) != "")
                                {
                                    var svgArr = svgAttrs[d].split(" ")

                                    currentChild.setAttribute(svgArr[0], value)
                                    currentChild.setAttribute(svgArr[1], value)
                                }
                                else if( String(svgAttrs[d]) != "" )
                                { 
                                    currentChild.setAttribute(svgAttrs[d], value)
                                }   
                            }
                        }

                        svgIndex++;
                        break;
                
                    case "text":
                        if( code == 1 )
                        {
                            innerChild.setAttribute("stroke", value)
                            innerChild.setAttribute("fill", value)
                        }
                        break;
                    
                    default:
                        console.log(`Something went very wrong here: nodeName = ${innerChild.nodeName}`)
                }
            }
        }
   }
}



/**
 * @function changeColorsOfChildren
 * @param {NodeList} children - HTMLElementCollection holding all layers of the icon
 * @param {string} color - the new color
 * @param  {...any} order - any number of strings that represents the elements to change of the svg element "stroke" and/or "fill"
 * @description change color of the children using the order objects to tell what attributes to change on the children. child[i].order[i] = color
  */
function changeColorsOfChildren( children, color , ...order )
{
    // error if number of order of children dont match
    if( children.length != order.length )
    {
        console.error( "Error: order array must match length of children array" )
    }
    else
    {
        // loop over all children
        for ( let index = 0; index < children.length; index++ )
        {
            // get current element and command
            let element = children[ index ]
            let commandArr = order[ index ].split(" ")

            // for each command
            commandArr.forEach( attribute => {
                if( attribute != "" )
                {
                    element.setAttribute( attribute.trim(), color )
                }
            })
        }
    }
}

/**
 * 
 * @param {*} activation 
 */
function setMains( activation )
{
    switch( activation )
    {
        case "enable":
            geoIconArray.forEach( (geoId) => {
                document.getElementById(geoId.replace("#", '')).classList.remove( "disabled" )
            });
            break;
        case "disable":
            geoIconArray.forEach( (geoId) => {
                document.getElementById(geoId.replace("#", '')).classList.add( "disabled" )
            });
            break;
        default:
            console.error("Unknown Activation Code")
            break;
    }
}


/**
 * @function changeButtonActivation
 * @param {string} code - either "enable", or "disable" 
 * @description disabled the buttons when the pencil icon is hit
 */
function changeButtonActivation( ActivationCode, code )
{
    if( getObjectCount(0, "image") !== 0 )
    {
        switch( code ) 
        {
            case 0: // change all icons and outline
                setMains(ActivationCode)

                // enable or disable buttons depending on code
                if( ActivationCode == "enable" )
                {                    
                    document.getElementById( "outlinebtnopt" ).classList.remove( "disabled" )
                }
                else if( ActivationCode == "disable" )
                {
                    document.getElementById( "outlinebtnopt" ).classList.add( "disabled" )
                }
                break
            
            case 1: // change all icons and pencil
                setMains(ActivationCode)

                // enable or disable buttons depending on code
                if( ActivationCode == "enable" )
                {
                    document.getElementById( "penciloptbtn" ).classList.remove( "disabled" )
                }
                else if( ActivationCode == "disable" )
                {
                    document.getElementById( "penciloptbtn" ).classList.add( "disabled" )
                }
                break
            
            case 2: // change all icons
                setMains(ActivationCode)

                // enable or disable buttons depending on code
                if( ActivationCode == "enable" )
                {
                    document.getElementById( "penciloptbtn" ).classList.remove( "disabled" )
                    document.getElementById( "outlinebtnopt" ).classList.remove( "disabled" )
                }
                else if( ActivationCode == "disable" )
                {                    
                    document.getElementById( "penciloptbtn" ).classList.add( "disabled" )
                    document.getElementById( "outlinebtnopt" ).classList.add( "disabled" )
                }
                break
        }
    }
}

/**
 * @function updateCaptionTextColor
 * @param {string} color - color to change to
 * @param {string} objectid - the id of the object to find
 * @description change capton text color
 */
function updateCaptionTextColor ( color, objectid )
{
    // get object
    let obj = document.getElementById( objectid )

    // change color if it is valid; error otherwise
    if( obj )
    {
        obj.setAttribute( "fill", color )
    }
    else
    {
        console.error( "Error: Cannot Find Id for object in function updateCaptionTextColor" )
    }
}

/**
 * @function updateCaptionBoxColor
 * @param {string} color - color code for to change to
 * @param {string} objectid - the object id that we are trying to change 
 * @description change caption background color
 */
function updateCaptionBoxColor ( color, objectid )
{
    // get object
    let obj = document.getElementById( objectid + "bg")

    //change color if its valid throw error otherwise
    if ( obj )
    {
        obj.setAttribute( "fill", color )
    }
    else
    {
        console.error( "Error: Cannot Find Id for object in function updateCaptionBoxColor" )
    }
}

/**
 * 
 * @param {*} activation 
 */
function toggleLayerUI( activation )
{
    let requiredLayers = [ document.getElementById("toolbox"), document.getElementById("editbox") ]

    requiredLayers.forEach(div => {
        switch(activation)
        {
            case "remove":
                div.classList.remove("hand")
                break
            
            case "add":
                div.classList.add("hand")
                break
        }
    });
} 

/**
 * @function drawMouseDownListener
 * @param {_Event} event - click event
 * @description drawing line on the svg while dragging
 */
function drawMouseDownListener( event )
{
    if( leftClick(event.button) )
    {
        // prevent defaults to stop dragging
        event.preventDefault()

        let line = document.createElementNS( NS.svg, "line" ),
            lineId = randomId("line");

        // get transformed svg point where click occured
        let svgP = draggableSvg.svgAPI( event.clientX, event.clientY )

        // set line attributes
        line.setAttribute( "x1", svgP.x )
        line.setAttribute( "y1", svgP.y )
        line.setAttribute( "stroke", "white" )
        line.setAttribute( "id", lineId )
        line.setAttribute( "stroke-width", "10" )
        line.setAttribute( "x2", svgP.x )
        line.setAttribute( "y2", svgP.y )
        line.setAttributeNS(NS.svg, "marker-start", "")
        line.setAttributeNS(NS.svg, "marker-end", "")

        // create the inner draw listener
        function endDraw( event )
        {
            if ( document.getElementById(lineId) )
            {
                let svgP = draggableSvg.svgAPI( event.clientX, event.clientY )
                // calculate distance or length of the line
                let linedist = distance ( line.getAttribute("x1"), line.getAttribute("y1"), svgP.x, svgP.y )
                if( linedist > 50 )
                {
                    // update the position
                    line.setAttribute( "x2", svgP.x )
                    line.setAttribute( "y2", svgP.y )

                    // must add tool box because this is a valid line
                    createLineToolBox( lineId, line.getAttribute("x1"), line.getAttribute("y1"), svgP.x, svgP.y, line.getAttribute('stroke-width') )
                }
                else
                {
                    draggableSvg.getContainerObject().removeChild(line)
                    // no need to add tool box
                    alert("Your line was too short please draw a larger line")
                }

                document.getElementById("penciloptbtn").click()

                draggableSvg.getContainerObject().removeEventListener( "mousemove", updateUI )
                draggableSvg.getContainerObject().removeEventListener( "mouseup", endDraw )
                draggableSvg.getContainerObject().removeEventListener( "mouseleave", endDraw )

                line.classList.add("placed")
            }
        }

        // sets the end of the line to where the mouse is
        draggableSvg.getContainerObject().addEventListener( "mouseup", endDraw , false)
        draggableSvg.getContainerObject().addEventListener( "mouseleave", endDraw , false)

        // set the update function
        function updateUI ( event )
        {
            let svgP = draggableSvg.svgAPI( event.clientX, event.clientY )

            line.setAttribute( "x2", svgP.x )
            line.setAttribute( "y2", svgP.y )
        }

        // event listener for mousemove
        draggableSvg.getContainerObject().addEventListener( "mousemove", updateUI , false)

        // put the line on the svg image
        draggableSvg.getContainerObject().appendChild(line)
    }
}

/**
 * @function createLineToolBox
 * @param {strng} objectid - the id of the line
 * @param {number} x1 - the x value of the head of the line
 * @param {number} y1 - the y value of the head of the line
 * @param {number} x2 - thex value of the taial of the line
 * @param {number} y2 - the y value of the tail of the line
 * @param {number} strokeWidth - the stroke-width of the line
 * @description create the toolbox for the given line
 */
function createLineToolBox( objectid, x1, y1, x2, y2 , strokeWidth)
{
    let linex1input = document.createElement("input"),
        linex1inputlabel = document.createElement("label"),
        liney1input = document.createElement("input"),
        liney1inputlabel = document.createElement("label"),
        widthlabel = document.createElement("label"),
        linewidthinput = document.createElement("input"),
        colorlabel = document.createElement("label"),
        linecolorinput = document.createElement("input"),
        linetoolbox = document.createElement("div"),
        lineoptionbar = document.createElement("div"),
        lineoptionheader = document.createElement("h4"),
        deletebtn = document.createElement("button"),
        minibtn = document.createElement("button"),
        layerbtn = document.createElement("button"),
        linex2input = document.createElement("input"),
        linex2inputlabel = document.createElement("label"),
        liney2input = document.createElement("input"),
        liney2inputlabel = document.createElement("label"),
        lineheadinput = document.createElement("select"),
        lineheadinputlabel = document.createElement("label");

    lineoptionbar.addEventListener("click", function( event ){
        optionsAction(event.target)
    })

    // input x1 fields
    linex1input.setAttribute( "objectid", objectid )
    linex1inputlabel.setAttribute( "objectid", objectid )
    linex1input.setAttribute( "type", "number" )
    linex1inputlabel.innerHTML = "Line Start-Point X: "
    linex1inputlabel.setAttribute("for","linex1input")
    linex1input.setAttribute("name","linex1input")
    linex1input.value = parseFloat(x1).toFixed(0)

    linex1input.addEventListener("change", function(event)
    {
        document.getElementById( this.attributes.objectid.value).setAttribute("x1", this.value )
    })

    // input y1 fields
    liney1input.setAttribute("objectid", objectid)
    liney1inputlabel.setAttribute("objectid", objectid)
    liney1inputlabel.innerHTML = "Line Start-Point Y: "
    liney1input.setAttribute("type", "number")
    liney1input.setAttribute("min", "0")
    liney1input.value = parseFloat(y1).toFixed(0)
    liney1inputlabel.setAttribute("for","liney1input")
    liney1input.setAttribute("name","liney1input")

    liney1input.addEventListener("change", function(event)
    {
        // y1 translate input
        
        document.getElementById( this.attributes.objectid.value).setAttribute("y1", this.value )
    })

    // input line width fields
    widthlabel.setAttribute("objectid", objectid)
    linewidthinput.setAttribute("objectid", objectid)
    widthlabel.innerHTML = "Line Thickness: "
    widthlabel.setAttribute("for", "linethicknessinput")
    linewidthinput.setAttribute("type", "number")
    linewidthinput.setAttribute("min", "10")
    linewidthinput.value = strokeWidth
    linewidthinput.setAttribute("name", "linethicknessinput")

    linewidthinput.addEventListener("change", function(event)
    {
        // line width setting
        if( Number(this.getAttribute("min")) > Number(this.value) )
        {
            document.getElementById( this.attributes.objectid.value).setAttribute("stroke-width", Number(this.getAttribute("min")) )
            this.value = Number(this.getAttribute("min"))
        }
        else
        {
            document.getElementById( this.attributes.objectid.value).setAttribute("stroke-width", this.value )
        }

    })

    // input line color fields
    colorlabel.setAttribute("objectid", objectid)
    linecolorinput.setAttribute("objectid", objectid)
    colorlabel.innerHTML = "Line Color: "
    colorlabel.setAttribute("for", "linecolorinput")
    linecolorinput.setAttribute("type", "color")
    linecolorinput.value = "#ffffff"

    linecolorinput.setAttribute("name", "linecolorinput")

    linecolorinput.addEventListener("change", function(event)
    {
        let lineelement = document.getElementById( this.attributes.objectid.value )
        // Update color when the color changes
        lineelement.setAttribute("stroke", this.value )

        try{
            let markerEndid = lineelement.getAttribute("marker-end").split('#')[1].replace(')','')

            if( markerEndid )
            {
                let newEndMarker = document.getElementById( markerEndid )

                // set attributes for new marker
                newEndMarker.setAttribute("id", `${objectid}-marker`)
                newEndMarker.firstChild.setAttribute("fill", this.value)
                lineelement.setAttributeNS(NS.svg, "marker-end", `url(#${newEndMarker.getAttribute("id")})`)

                // add the new marker
                document.getElementById("figdefs").appendChild(newEndMarker)
            }
        }
        catch(err)
        {
            console.error("Line Has No End")
        }
         
        try 
        {
            let markerStartid = lineelement.getAttribute("marker-start").split('#')[1].replace(')','')

            if( markerStartid )
            {
                let newStartMarker = document.getElementById( markerStartid )
                // set attributes for new marker
                newStartMarker.setAttribute("id", `${objectid}-markerEnd`)
                newStartMarker.firstChild.setAttribute("fill", this.value)
                lineelement.setAttribute("marker-start", `url(#${newStartMarker.getAttribute("id")})`)

                // add the new marker
                document.getElementById("figdefs").appendChild(newStartMarker)
            }
        }
        catch(err)
        {
            console.error("Line Has No Head")
        }
    })

    //  outer toolbox info
    linetoolbox.setAttribute("objectid", objectid)
    lineoptionbar.setAttribute("objectid", objectid)
    lineoptionheader.setAttribute("objectid", objectid)
    linetoolbox.classList.add("linetoolsbox")
    linetoolbox.setAttribute("id", "linetoolsbox-" + objectid)

    // options bar stuff
    lineoptionbar.setAttribute("class", 'windowoptionsbar')
    lineoptionbar.style.display = "flex"

    lineoptionheader.innerHTML = "Line Icon"

    // same with the minimize button
    minibtn.classList.add("windowminimizebtn")
    minibtn.innerHTML = "▲"

    // cant forget the event handler for the minimize btn
    minibtn.addEventListener( "click", function(event) {
        minimizeToolsWindow(event)
    })

    // same for delete as minimize
    deletebtn.classList.add("windowremovebtn")
    deletebtn.setAttribute("objectid", objectid)
    deletebtn.innerHTML = "&times"

    // set event listener to remove north icon
    deletebtn.addEventListener( "click", function(event) {
        //delete a line
        removeLineWindow(event)
    })

    deletebtn.setAttribute("objectid", objectid)

    // set the class css and the svg button graphic
    createLayerBtn(layerbtn, draggableList)

    /** End Dragging */


    // set aptions bar nodes
    lineoptionbar.append(
        lineoptionheader,
        minibtn,
        deletebtn,
        layerbtn
    )

    //  x2 input fields
    linex2input.setAttribute("objectid", objectid)
    linex2inputlabel.setAttribute("objectid", objectid)
    linex2inputlabel.innerHTML = "Line End-Point X: "
    linex2inputlabel.setAttribute("for", "linex2input")
    linex2input.setAttribute("min", "0")
    linex2input.setAttribute("type", "number")
    
    linex2input.setAttribute("name", "linex2input")

    linex2input.value = parseFloat(x2).toFixed(0)

    linex2input.addEventListener("change", function(event)
    {
        // x2 translate attribute
        document.getElementById( this.attributes.objectid.value).setAttribute("x2", this.value )
    })


    // input y2 fields
    liney2input.setAttribute("objectid", objectid)
    liney2inputlabel.setAttribute("objectid", objectid)
    liney2inputlabel.innerHTML = "Line End-Point Y"
    liney2inputlabel.setAttribute("for", "liney2input")

    liney2input.setAttribute("min", "0")
    liney2input.setAttribute("type", "number")

    liney2input.setAttribute("name", "liney2input")

    liney2input.value = parseFloat(y2).toFixed(0)

    liney2input.addEventListener("change", function(event)
    {
        // line y2 attribute
        
        document.getElementById( this.attributes.objectid.value).setAttribute("y2", this.value )
    })

    // input line ender select elements
    let optionarrow = document.createElement("option"),
        optionsquare = document.createElement("option"),
        optioncircle = document.createElement("option"),
        optionnone = document.createElement("option");

    lineheadinput.setAttribute("objectid", objectid)
    lineheadinputlabel.setAttribute("objectid", objectid)
    lineheadinputlabel.innerHTML = "Line End-Point Head: "

    lineheadinputlabel.setAttribute("for", "lineheadinput")
    lineheadinput.setAttribute("name", "lineheadinput")

    // set the options for the input
    optionarrow.innerHTML = "Headless"
    optionarrow.setAttribute("value", "none")

    optionarrow.innerHTML = "Arrow Head"
    optionarrow.setAttribute("value", "arrow")
    
    optionsquare.innerHTML = "Square Head"
    optionsquare.setAttribute("value", "square")
    
    optioncircle.innerHTML = "Circle Head"
    optioncircle.setAttribute("value", "circle")

    lineheadinput.append(
        optionnone,
        optionarrow,
        optioncircle,
        optionsquare
    )

    lineheadinput.addEventListener("change", function(event) {
        
        let object = document.getElementById(event.target.attributes.objectid.value)

        // if the object exists
        if( object )
        {
            let line = document.getElementById(lineheadinput.attributes.objectid.value)

            // switch on the option
            switch( event.target.value )
            {
                case "arrow":
                    createMarker(line.getAttributeNS(NS.svg, "marker-end"), line.id, "arrow", 0 )
                    break
                case "square":
                    createMarker(line.getAttributeNS(NS.svg, "marker-end"), line.id, "square", 0 )
                    break
                case "circle":
                    createMarker(line.getAttributeNS(NS.svg, "marker-end"), line.id, "circle", 0 )
                    break
                default:
                    object.setAttributeNS(NS.svg, "marker-end","");
                    document.getElementById("figdefs").removeChild(document.getElementById(`${line.id}-marker`))
            }
        }
        else
        {
            console.error("Error: Cannot find object with objectid" + event.target.attributes.objectid.value)
        }
    })


    let linetailheadinput = lineheadinput.cloneNode(true)
    let linetailheadinputlabel = lineheadinputlabel.cloneNode(true)

    linetailheadinputlabel.innerHTML = "Line Start-Point Head: "

    linetailheadinputlabel.setAttribute("for", "linetailinput")
    linetailheadinput.setAttribute("name", "linetailinput")

    linetailheadinput.addEventListener("change", function(event) {
        
        let object = document.getElementById(event.target.attributes.objectid.value)

        // if the object exists
        if( object )
        {
            let line = document.getElementById(linetailheadinput.attributes.objectid.value)

            // switch on the option
            switch( event.target.value )
            {

                case "arrow":
                    createMarker(line.getAttributeNS(NS.svg, "marker-start"), line.id, "arrow", 1 )
                    break
                case "square":
                    createMarker(line.getAttributeNS(NS.svg, "marker-start"), line.id, "square", 1 )
                    break
                case "circle":
                    createMarker(line.getAttributeNS(NS.svg, "marker-start"), line.id, "circle", 1 )
                    break
                default:
                    object.setAttributeNS(NS.svg, "marker-start", "");
                    document.getElementById("figdefs").removeChild(document.getElementById(line.id+"-markerEnd"))
            }
        }
        else
        {
            console.error("Error: Cannot find object with objectid" + event.target.attributes.objectid.value)
        }
    })

    // append the objects
    linetoolbox.append(
        colorlabel,
        document.createElement("br"),
        linecolorinput,
        document.createElement("br"),
        lineheadinputlabel,
        document.createElement("br"),
        lineheadinput,
        document.createElement("br"),
        linetailheadinputlabel,
        document.createElement("br"),
        linetailheadinput,
        document.createElement("br"),
        widthlabel,
        document.createElement("br"),
        linewidthinput,        
        document.createElement("br"),
        linex1inputlabel,
        document.createElement("br"),
        linex1input,
        document.createElement("br"),
        liney1inputlabel,
        document.createElement("br"),
        liney1input,
        document.createElement("br"),
        linex2inputlabel,
        document.createElement("br"),
        linex2input,
        document.createElement("br"),
        liney2inputlabel,
        document.createElement("br"),
        liney2input
    )

    // finish by appending the whole thing
    let holderbox = document.createElement("div")
    holderbox.setAttribute("class", "draggableToolbox")
    holderbox.setAttribute("objectid", objectid)
    holderbox.append(lineoptionbar, linetoolbox)

    draggableList.getContainerObject().insertAdjacentElement("afterbegin", holderbox)
}
 /** End Draw Functions */

/**
 * @function createMarker
 * @param {string} markerString - raw string from markerEnd
 * @param {string} lineid - the id of the line object
 * @param {string} headcode - string telling the type of head icon
 * @param {number} endCode - the code to tell what end of the line to place the marker
 * @description create and remove markers for customizing lines
 */
function createMarker( markerString, lineid, headcode, endCode )
{
    if( endCode == 0 )
    {
        // check if the current line already has a marker object
        if( markerString.indexOf(lineid) > -1)
        {
            // get the marker and line
            let marker = document.getElementById(lineid+"-marker")
            let line = document.getElementById(lineid)

            // if the marker exists
            if(marker)
            {
                // set the innerHTML of the line marker to the inner html of the new head icon using the skeletons
                marker.innerHTML = document.getElementById(headcode+"head").innerHTML
                // set the new color of the marker
                marker.firstElementChild.setAttribute("fill", line.getAttribute("stroke") )
            }
            else
            {
                console.error("Failed to find marker by id " + lineid)
            }
        }
        else
        {
            // create a new marker from the skeletons
            let marker = document.getElementById(headcode+"head")
            let line = document.getElementById(lineid)

            if( marker )
            {
                // shift marker variable to a new node
                let newmarker = marker.cloneNode(true)

                // set new attributes
                newmarker.setAttribute( "id", lineid + "-marker" )
                newmarker.firstElementChild.setAttribute("fill", line.getAttribute("stroke") )
                // append the new marker
                document.getElementById("figdefs").appendChild(newmarker)
                newmarker.setAttribute("data-cy", "markerhead")


                // set line marker end
                line.setAttribute("marker-end", `url(#${newmarker.id})`)
                // add style
                line.style.markerEnd = "url(#" + newmarker.id + ")"
            }
        }
    }
    else
    {
            // check if the current line already has a marker object
        if( markerString.indexOf(lineid+"-markerEnd") > -1)
        {
            // get the marker and line
            let marker = document.getElementById(lineid+"-markerEnd")
            let line = document.getElementById(lineid)

            // if the marker exists
            if(marker)
            {
                // set the innerHTML of the line marker to the inner html of the new head icon using the skeletons
                marker.innerHTML = document.getElementById(headcode+"head").innerHTML
                // set the new color of the marker
                marker.firstElementChild.setAttribute("fill", line.getAttribute("stroke") )
            }
            else
            {
                console.error("Failed to find marker by id " + lineid)
            }
        }
        else
        {
            // create a new marker from the skeletons
            let marker = document.getElementById(headcode+"head")
            let line = document.getElementById(lineid)

            if( marker )
            {
                // shift marker variable to a new node
                let newmarker = marker.cloneNode(true)

                // set new attributes
                newmarker.setAttribute( "id", lineid + "-markerEnd" )
                newmarker.firstElementChild.setAttribute("fill", line.getAttribute("stroke") )     
                
                // Removed until these issue is resolved https://github.com/lovell/sharp/issues/2459 
                // & https://github.com/ChaddFrasier/PIE/issues/180
                // newmarker.setAttribute( "orient", "auto-start-reverse")
                
                newmarker.setAttribute( "data-cy", "markertail")

                // append the new marker
                document.getElementById("figdefs").appendChild(newmarker)

                // set line marker end
                line.setAttribute( "marker-start", `url(#${newmarker.id})`)
                // style
                line.style.markerStart = "url(#" + newmarker.id + ")"

            }
        }
    }
}

/**
 * @function optionsAction
 * @param {Node} target - the target of the  click event 
 * @description click the second element in the node
 */
function optionsAction( target )
{
    let btn = target.firstChild.nextSibling

    if( btn && btn.nodeName == "BUTTON" ){
        btn.click()
    }
}

/**
 * @function leftClick
 * @param {number} buttonid 
 * @description return trun if the left mouse click happened false otherwise
 */
function leftClick ( buttonid )
{
    if( buttonid === 0)
    {
        return true;
    }
    else
    {
        return false;
    }
}

/**
 * @function drawBoxMouseDownListener
 * @param {_Event} event - the click event
 * @description drawing a box
 */
function drawBoxMouseDownListener( event )
{
    if( leftClick(event.button) )
    {
        event.preventDefault()
        
        let rect = document.createElementNS( NS.svg, "rect" ),
            rectId = randomId("rect"),
            startClickX, startClickY;

        // get transformed svg point where click occured
        let svgP = draggableSvg.svgAPI( event.clientX, event.clientY )

        startClickX = svgP.x
        startClickY = svgP.y

        // set rectangle attributes
        rect.setAttribute( "x", svgP.x )
        rect.setAttribute( "y", svgP.y )
        rect.setAttribute( "stroke", "#ffffff" )
        rect.setAttribute( "fill", "none" )
        rect.setAttribute( "id", rectId )
        rect.setAttribute( "stroke-width", "10" )
        rect.setAttribute( "height", 20 )
        rect.setAttribute( "width", 20 )

        // create the inner outline draw listener
        function endBoxDraw( )
        {
            if( document.getElementById(rectId) )
            {
                document.getElementById("outlinebtnopt").click()
                draggableSvg.getContainerObject().removeEventListener( "mousemove", updateBoxUI )
                draggableSvg.getContainerObject().removeEventListener( "mouseup", endBoxDraw )
                draggableSvg.getContainerObject().removeEventListener( "mouseleave", endBoxDraw )

                // create the toolbox when the rect finished being drawn by the user
                createOutlineToolbox( 
                    rectId, 
                    rect.getAttribute("x"),
                    rect.getAttribute("y"),
                    rect.getAttribute("width"),
                    rect.getAttribute("height"),
                    rect.getAttribute("stroke"))
                
                rect.classList.add("placed")
            }
        }

        // sets the end of the line to where the mouse is
        draggableSvg.getContainerObject().addEventListener( "mouseup", endBoxDraw , false)
        draggableSvg.getContainerObject().addEventListener( "mouseleave", endBoxDraw , false)

        // set the update function
        function updateBoxUI ( event )
        {
                let svgP = draggableSvg.svgAPI( event.clientX, event.clientY )

                // if newx is lt startclick X  + left 20px 
                if( svgP.x < startClickX - 20 )
                {
                    // newx = mouse location
                    rect.setAttribute("x", svgP.x)
                    // new width = startlocation - mouseX
                    rect.setAttribute("width", startClickX - svgP.x)
                }
                else if( svgP.x > startClickX + 20 )
                {
                    // calculate difference in x values to get width
                    rect.setAttribute("x", startClickX)
                    rect.setAttribute("width", svgP.x - Number(rect.getAttribute("x")) )
                }

                // check if the new y is less than the start point
                if( svgP.y < startClickY - 20)
                {
                    // update the new x location
                    rect.setAttribute("y", svgP.y)
                    rect.setAttribute("height", startClickY - svgP.y)
                }
                else if( svgP.y > startClickY + 20 )
                {
                    rect.setAttribute("y", startClickY)
                    rect.setAttribute("height", svgP.y - Number(rect.getAttribute("y")) )
                }
        }

        // event listener for mousemove
        draggableSvg.getContainerObject().addEventListener( "mousemove", updateBoxUI )

        // put the line on the svg image
        draggableSvg.getContainerObject().appendChild(rect)
    }
}

/**
 * @function createOutlineToolBox
 * @param {string} objectid - the id of the rectangle svg element
 * @param {number} rectX - the x of the rect 
 * @param {number} rectY - the y of the rect
 * @param {number} rectW - the width of the rect
 * @param {number} rectH - the height of the rect
 * @param {string} strokeColor - color code
 * @description draw and add the input fields to the document
 */
function createOutlineToolbox ( objectid, rectX, rectY, rectW, rectH, strokeColor )
{
    let rectxinput = document.createElement("input")
    let rectxinputlabel = document.createElement("label")
    let rectyinput = document.createElement("input")
    let rectyinputlabel = document.createElement("label")
    let strokewidthinput = document.createElement("input")
    let strokewidthinputlabel = document.createElement("label")
    let rectwidthlabel = document.createElement("label")
    let rectwidthinput = document.createElement("input")
    let rectheightlabel = document.createElement("label")
    let rectheightinput = document.createElement("input")
    let rectcolorlabel = document.createElement("label")
    let rectcolorinput = document.createElement("input")
    let recttoolbox = document.createElement("div")
    let rectoptionbar = document.createElement("div")
    let rectoptionheader = document.createElement("h4")
    let deletebtn = document.createElement("button")
    let minibtn = document.createElement("button")
    let layerbtn = document.createElement("button")

    // event listener for clicking options bar to close
    rectoptionbar.addEventListener("click", function( event ){
        optionsAction(event.target)
    })

    // input x field and label
    rectxinput.setAttribute( "objectid", objectid )
    rectxinputlabel.setAttribute( "objectid", objectid )
    rectxinput.setAttribute( "type", "number" )
    rectxinput.setAttribute( "min", "0" )
    rectxinputlabel.innerHTML = "Outline X: "
    rectxinput.value = parseFloat(rectX).toFixed(0)

    rectxinputlabel.setAttribute("for", "rectxinput")
    rectxinput.setAttribute("name", "rectxinput")

    rectxinput.addEventListener("change", function(event)
    {
        // perform line movements
        if( Number(this.getAttribute("min")) > Number(this.value) )
        {
            document.getElementById( this.attributes.objectid.value).setAttribute("x", Number(this.getAttribute("min")) )
            this.value = Number(this.getAttribute("min"))
        }
        else
        {
            document.getElementById( this.attributes.objectid.value).setAttribute("x", this.value )
        }
    })

    // input y node attributes
    rectyinput.setAttribute("objectid", objectid)
    rectyinputlabel.setAttribute("objectid", objectid)
    rectyinputlabel.innerHTML = "Outline Y: "
    rectyinput.setAttribute("type", "number")
    rectyinput.setAttribute("min", "0")
    rectyinput.value = parseFloat(rectY).toFixed(0)

    rectyinputlabel.setAttribute("for", "rectyinput")
    rectyinput.setAttribute("name", "rectyinput")

    rectyinput.addEventListener("change", function(event)
    {
        if( Number(this.getAttribute("min")) > Number(this.value) )
        {
            document.getElementById( this.attributes.objectid.value).setAttribute("y", Number(this.getAttribute("min")) )
            this.value = Number(this.getAttribute("min"))
        }
        else
        {
            document.getElementById( this.attributes.objectid.value).setAttribute("y", this.value )
        }

    })

    // input rect width
    rectwidthlabel.setAttribute("objectid", objectid)
    rectwidthinput.setAttribute("objectid", objectid)
    rectwidthlabel.innerHTML = "Outline Width: "
    rectwidthinput.setAttribute("type", "number")
    rectwidthinput.setAttribute("min", "20")
    rectwidthinput.value = parseFloat(rectW).toFixed(0)

    rectwidthlabel.setAttribute("for", "rectwidthinput")
    rectwidthinput.setAttribute("name", "rectwidthinput")

    rectwidthinput.addEventListener("change", function(event)
    {
        if( Number(this.getAttribute("min")) > Number(this.value) )
        {
            document.getElementById( this.attributes.objectid.value).setAttribute("width", Number(this.getAttribute("min")) )
            this.value = Number(this.getAttribute("min"))
        }
        else
        {
            document.getElementById( this.attributes.objectid.value).setAttribute("width", this.value )
        }
    })

    // input line height
    rectheightlabel.setAttribute("objectid", objectid)
    rectheightinput.setAttribute("objectid", objectid)
    rectheightlabel.innerHTML = "Outline Height: "
    rectheightinput.setAttribute("type", "number")
    rectheightinput.setAttribute("min", "20")
    rectheightinput.value = parseFloat(rectH).toFixed(0)

    rectheightlabel.setAttribute("for", "rectheightinput")
    rectheightinput.setAttribute("name", "rectheightinput")

    rectheightinput.addEventListener("change", function(event)
    {
        // line width setting
        if( Number(this.getAttribute("min")) > Number(this.value) )
        {
            document.getElementById( this.attributes.objectid.value).setAttribute("height", Number(this.getAttribute("min")) )
            this.value = Number(this.getAttribute("min"))
        }
        else
        {
            document.getElementById( this.attributes.objectid.value).setAttribute("height", this.value )
        }
    })


    // stroke width node attributes
    strokewidthinputlabel.setAttribute("objectid", objectid)
    strokewidthinput.setAttribute("objectid", objectid)
    strokewidthinputlabel.innerHTML = "Outline Thickness: "
    strokewidthinput.setAttribute("type", "number")
    strokewidthinput.setAttribute("min", "10")
    strokewidthinput.value = 10

    strokewidthinputlabel.setAttribute("for", "rectthicknessinput")
    strokewidthinput.setAttribute("name", "rectthicknessinput")

    strokewidthinput.addEventListener("change", function(event)
    {
        // line width setting
        if( Number(this.getAttribute("min")) > Number(this.value) )
        {
            document.getElementById( this.attributes.objectid.value).setAttribute("stroke-width", Number(this.getAttribute("min")) )
            this.value = Number(this.getAttribute("min"))
        }
        else
        {
            document.getElementById( this.attributes.objectid.value).setAttribute("stroke-width", this.value )
        }
    })

    // input outline color fields
    rectcolorlabel.setAttribute("objectid", objectid)
    rectcolorinput.setAttribute("objectid", objectid)
    rectcolorlabel.innerHTML = "Outline Color: "
    rectcolorinput.setAttribute("type", "color")
    rectcolorinput.value = strokeColor

    rectcolorlabel.setAttribute("for", "rectcolorinput")
    rectcolorinput.setAttribute("name", "rectcolorinput")

    rectcolorinput.addEventListener("change", function(event)
    {
        let rect = document.getElementById( this.attributes.objectid.value )
        // Update color when the color changes
        rect.setAttribute("stroke", this.value )
    })

    //  outer toolbox info
    recttoolbox.setAttribute("objectid", objectid)
    rectoptionbar.setAttribute("objectid", objectid)
    rectoptionheader.setAttribute("objectid", objectid)
    recttoolbox.classList.add("linetoolsbox")
    recttoolbox.setAttribute("id", "linetoolsbox-" + objectid)

    // options bar stuff
    rectoptionbar.setAttribute("class", 'windowoptionsbar')
    rectoptionbar.style.display = "flex"

    rectoptionheader.innerHTML = "Outline Icon"

    // same with the minimize button
    minibtn.classList.add("windowminimizebtn")
    minibtn.innerHTML = "▲"

    // cant forget the event handler for the minimize btn
    minibtn.addEventListener( "click", function(event) {
        minimizeToolsWindow(event)
    })

    // same for delete as minimize
    deletebtn.classList.add("windowremovebtn")
    deletebtn.setAttribute("objectid", objectid)
    deletebtn.innerHTML = "&times"

    // set event listener to remove north icon
    deletebtn.addEventListener( "click", function(event) {
        //delete a line
        removeLineWindow(event)
    })

    deletebtn.setAttribute("objectid", objectid)

    // set the class css and the svg button graphic
    createLayerBtn(layerbtn, draggableList)

    /** End Dragging */


    // set aptions bar nodes
    rectoptionbar.append( 
        rectoptionheader, 
        minibtn,
        deletebtn,
        layerbtn
    )

    // append the objects
    recttoolbox.append(
        rectcolorlabel,
        document.createElement("br"),
        rectcolorinput,
        document.createElement("br"),
        strokewidthinputlabel,
        document.createElement("br"),
        strokewidthinput,
        document.createElement("br"),
        rectwidthlabel,
        document.createElement("br"),
        rectwidthinput,
        document.createElement("br"),
        rectheightlabel,
        document.createElement("br"),
        rectheightinput,
        document.createElement("br"),
        rectxinputlabel,
        document.createElement("br"),
        rectxinput,
        document.createElement("br"),
        rectyinputlabel,
        document.createElement("br"),
        rectyinput
    )

    // finish by appending the whole thing
    let holderbox = document.createElement("div")
    holderbox.setAttribute("class", "draggableToolbox")
    holderbox.setAttribute("objectid", objectid)
    holderbox.append(rectoptionbar, recttoolbox)

    draggableList.getContainerObject().insertAdjacentElement("afterbegin", holderbox)
}

/**
 * @function updateImageLocation
 * @param {string} imageId the id of the image element
 * @param {number} x the new x coord of the image
 * @param {number} y the new y coord
 */
function updateImageLocation( imageId, x, y )
{
    if(imageId)
    {
        let image = document.getElementById(imageId)
        image.setAttribute("x",x)
        image.setAttribute("y",y)
    }
}

/**
 * @description distance
 * @param {number} x1 point 1 x coord
 * @param {number} y1 point 1 y coord
 * @param {number} x2 point 2 x coord
 * @param {number} y2 point 2 y coord
 * @description calculate the distance of the line
 */
function distance( x1, y1, x2, y2 )
{
    return Math.sqrt( 
        Math.pow( (Number(x2) - Number(x1)), 2 ) 
        + Math.pow( (Number(y2) - Number(y1)), 2 )
        )
}

/**
 * TODO: this should probably change
 */
function NewFigure()
{
    location.reload()
}

/**
 * @function navigateTo
 * @param {string} url the url to navigate the client to
 * @description changes page location
 */
function navigateTo( url )
{
    location.href = url
}

/**
 * @function countSpacesInString
 * @param {string} str the string to search within
 * @description count the number of spaces in a string
 */
function countSpacesInString( str )
{
    return (String(str).split(' ').length - 1)
}

/**
 * @function recurseFixedIndex
 * @param {number} unfixedIndex the current index that we are checking
 * @param {string} text the text we are searching within
 * @description recurse backward over the text until a space is found or the start is out-indexed
 */
function recurseFixedIndex( unfixedIndex, text )
{
    // index error will occur; space was not found in the recursion
    if( unfixedIndex === -1 )
    {
        // return an error because there is no index to fix the split on
        return -999
    }

    // return the index of the chracter is a space; otherwise recurse backward
    if( text.charAt(unfixedIndex) === ' ')
    {
        return unfixedIndex
    }
    else
    {
        return recurseFixedIndex( --unfixedIndex, text)
    }
}

/**
 * @function text2PieText
 * @param {string} text raw text that needs to be formated
 * @param {number} captionWidth width of the caption object
 * @param {number} fontsize size of the font in the caption
 * @description this function takes the text of the caption and formats it for the caption object in the svg element.
 */
function text2PieText( text, captionWidth, fontsize )
{
    // create return data and helper data
    let paragraphArr = [],
        pieText = "",
        paragraphStartY = 0,
        maxCharPerLine = getMaxCharacterPerLine( captionWidth, fontsize );

    // create the first paragraph of the caption
    var p1 = document.createElementNS(NS.svg, "tspan");
    // get an array of all the seperate paragraphs
    paragraphArr = text.split("\n");

    // iterate over each paragraph
    for (let pindex = 0; pindex < paragraphArr.length; pindex++)
    {
        // isolate the paragraph text from the array
        const paragraph = paragraphArr[pindex];
        /* 
         make the character estimation;
          tried-> `maxCharPerLine + numvberOfSpaces/2`{psuedo}
        */
        let characterEstimate = maxCharPerLine

        // check if the paragraph can fit on the single line based on the esimation
        if(characterEstimate >= String(paragraph).length + 1)
        {
            // if it can fit on 1 line then set the box position and text
            p1.innerHTML = paragraph
            p1.setAttribute("y", paragraphStartY*fontsize + fontsize);
            p1.setAttribute("x", fontsize)
            pieText += p1.outerHTML
        }
        else
        {   // else the paragraph requires multiple lines
            
            let firstLine = "",
                rest = "";

            // check if the character at the splitting location
            if( String(paragraph).charAt(characterEstimate) === ' ' )
            {
                // split the paragraph on that character
                firstLine = String(paragraph).substring(0, characterEstimate)
                rest = String(paragraph).substring(characterEstimate)    
            }
            else
            {
                // recurse over the paragraph and find a space character
                let fixedEstimate = recurseFixedIndex( characterEstimate, paragraph)

                // check for errors
                if ( fixedEstimate !== -999 )
                {
                    // split on the space character
                    firstLine = String(paragraph).substring(0, fixedEstimate)
                    rest = String(paragraph).substring(fixedEstimate)
                }
                else
                {
                    // cannot render very well. 
                    console.error("Cannot find a space character (' ') in the paragraph. ")
                }
            }
            
            // append the first line
            p1.innerHTML = firstLine
            p1.setAttribute("x", fontsize)
            p1.setAttribute("y", paragraphStartY*fontsize + fontsize)
            pieText += p1.outerHTML

            let numberOfLines = ((rest.length / maxCharPerLine) >= 1) ? Math.ceil((rest.length / maxCharPerLine)): 1;

            p1.setAttribute("dy", fontsize)
            p1.removeAttribute("y")

            if( numberOfLines === 1)
            {
                // put the rest on a single line and end
                p1.innerHTML = rest
                pieText += p1.outerHTML
            }
            else
            {
                // iterate over all the lines
                for (let lindex = 0; lindex < numberOfLines; lindex++)
                {
                    // otherwise use multiple lines
                    if( String(rest).charAt(characterEstimate*lindex + characterEstimate) === ' ' )
                    {
                        firstLine = String(rest).substring(0, characterEstimate*lindex + characterEstimate)
                        rest = String(rest).substring(characterEstimate*lindex + characterEstimate)    
                    }
                    else
                    {
                        // recurse over the paragraph and find a space character
                        let fixedEstimate = recurseFixedIndex( characterEstimate, rest)

                        // check for errors
                        if ( fixedEstimate !== -999 )
                        {
                            // split on the space character
                            firstLine = String(rest).substring(0, fixedEstimate)
                            rest = String(rest).substring(fixedEstimate)
                        }
                        else
                        {
                            // cannot render very well. 
                            console.error("Cannot find a space character (' ') in the paragraph. ")
                        }
                    }
                    
                    // if this is the last line on the loop append the first line and the rest
                    if(lindex === numberOfLines - 1)
                    {
                        p1.innerHTML = firstLine + rest
                        pieText += p1.outerHTML
                    }
                    else
                    {
                        // this is a middle line so just do the first part of the line
                        p1.innerHTML = firstLine
                        pieText += p1.outerHTML
                        paragraphStartY++;
                    }
                }
            }
        }
        // incriment the paragraph
        paragraphStartY++
    }
    // lastly return the HTML string that is the caption
    return pieText;
}

/**
 * @function getMaxCharacterPerLine
 * @param {number} width width of the caption box
 * @param {number} fontsize font size of the text
 */
function getMaxCharacterPerLine( width, fontsize )
{
    var captionPixelEstimatePerLine = (width/fontsize) * 2

    return captionPixelEstimatePerLine
}

/**
 * @function saveBlob
 * @param {Blob} blob the blob data of the file 
 * @param {string} fileName the filename that the blob should be saved as
 * @description save the file data as the filename to the client
 */
function saveBlob(blob, fileName)
{
    // create the anchor for downloading
    var a = document.createElement('a');

    // set the download link to the blob object URL
    a.href = window.URL.createObjectURL(blob);
    // set the download name
    a.download = fileName;
    // start the download
    a.dispatchEvent(new MouseEvent('click'));
}

/**
 * @function cleanSVG
 * @param {DOM Object} clone the clone of the svg element we want to prepair for export
 * @description this function cleans out un-needed parts of the svg as well as formating existing elements in a way that is efficent for other svg softwares.
 * With this function i want to go through the whole clone and remove 
 * the id and class of every element and nested child inside of the svg so that the server has an easier time handling it
 * 
 * @todo this may need d3 or something similar to format the whole thing properly.
 */
function cleanSVG( clone )
{
    removeAttributes(clone, "id", "class")

    // fixes errors when exporting as svg image
    clone.setAttribute("xmlns:rdf", NS.rdf)
    clone.setAttribute("xmlns", NS.svg)
    clone.setAttribute("xmlns:cc", NS.cc)
    clone.setAttribute("xmlns:dc", NS.dc)

    // recursivly remove all ids, classes, styles
    return clone
}

/**
 * @function removeAttribute
 * @param {DOM Object} object the object to manipulate 
 * @param  {...any} attrs a list of attributes to remove from the object
 */
function removeAttributes ( object, ...attrs )
{
    if( object.childNodes && object.nodeName != "defs" )
    {
        object.childNodes.forEach( child => {
            removeAttributes(child, "id", "class")
        })
    }

    attrs.forEach( attr => {
        try
        {
            object.removeAttribute(attr)
        }catch(err){}
    })
}

/**
 * @function validFileTypes
 * @param  {...any} arr array of true or false values
 * @description this function will iterate through the given argumet array and return true if any true value is found
 */
function validFileTypes( ...arr )
{
    for(let i = 0; i < arr.length; i++)
    {
        if( arr[i] )
        {
            return true;
        }
    }
    return false;
}

/**
 * @function createLayerBtn
 * @requires DraggableList
 * @param {Button} layerbtn the button object that we are creating
 * @param {DraggableList} draggableList the list to place the button inside
 */
function createLayerBtn(layerbtn, draggableList)
{
    layerbtn.classList.add("windoworderingbtn")
    layerbtn.innerHTML = "<svg viewBox='-10 -10 100 100' width='80%' height='80%' style='padding:1px' >"+
                        "<rect x='10' y='10' width='10' height='10' fill='black' rx='5'/>"+
                        "<rect x='30' y='10' width='50' height='10' fill='black' rx='5'/>"+
                        "<rect x='10' y='41' width='10' height='10' fill='black' rx='5'/>"+
                        "<rect x='30' y='41' width='50' height='10' fill='black' rx='5'/>" + 
                        "<rect x='10' y='70' width='10' height='10' fill='black' rx='5'/>"+
                        "<rect x='30' y='70' width='50' height='10' fill='black' rx='5'/></svg>"
    
    draggableList.addDraggable( layerbtn )
}