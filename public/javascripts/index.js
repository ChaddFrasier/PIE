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


/**
 * @function document.ready()
 * @description Function that runs when the page is done loading
 */
$( function() {

    // add the custom keys 
    document.addEventListener("keydown", customKeys);

    // contain the index homepage
    document.body.parentElement.setAttribute("class", "contained")

    // disable contextmenu listener for the figure
    document.getElementById('figurecontainer').setAttribute("oncontextmenu", "return false;")

    // local jquery variables
    var bgPicker = document.getElementById("backgroundcolor"),
        PencilFlag = false,
        selectedObject = null,
        OutlineFlag = false,
        shadowIcon = initShadowIcon(),
        activeEventManager = startActiveEM();

    // get the global figure element
    let svgContainer = document.getElementById("figurecontainer")
    // create the Draggable Object Container
    draggableSvg = DraggableArea( svgContainer )
    // create the DraggableList
    draggableList = DraggableList( document.getElementById("DraggableContainer") )
    // set background right away when page loads
    setSVGBackground("bgelement", bgPicker.value)

    function shiftKeyup( event )
    {
        event.preventDefault()
        if( event.key === "Shift" || event.key ==='shift' || event.key === 16 )
        {
            console.log("REMOVE THE SHIFT LISTENERS")

            // TODO: reverse

            // unpause the drag stuff from the DraggableArea Object
            draggableSvg.unpauseDraggables();
            changeButtonActivation("enable", 2)

            // remove the color the endpoints of the lines and the endpoints of the rectangles

            document.removeEventListener("keyup", shiftKeyup)

            // remove all dots
            document.querySelectorAll("circle.draggableDot").forEach( dot => {
                dot.removeEventListener("mousedown", dotMouseDownFunction)
                draggableSvg.getContainerObject().removeChild( dot )
            });
        }
        return true
    }

    var draggingDot = null,
        rectstartx = 0,
        rectstarty = 0;

    function dotMouseMoveFunction( event )
    {
        if( draggingDot !== null )
        {
            if( String(draggingDot.getAttribute("spyId")).indexOf('line') > -1 )
            {
                var svgP = draggableSvg.svgAPI(event.pageX, event.pageY)
                var svgObject = document.getElementById( draggingDot.getAttribute("spyId").split("-")[0] )
                var code = (draggingDot.getAttribute("spyId").split("-")[1] == 'start') ? 1 : 2

                draggingDot.setAttribute("cx", svgP.x)
                draggingDot.setAttribute("cy", svgP.y)
                svgObject.setAttribute(`x${code}`, svgP.x)
                svgObject.setAttribute(`y${code}`, svgP.y)
            }
            else if( String(draggingDot.getAttribute("spyId")).indexOf('rect') > -1 )
            {
                var svgP = draggableSvg.svgAPI(event.pageX, event.pageY)
                var svgObject = document.getElementById( draggingDot.getAttribute("spyId").split("-")[0] )
                var code = draggingDot.getAttribute("spyId").split("-")[1]
                var width = parseFloat(svgObject.getAttribute("width"))
                var height = parseFloat(svgObject.getAttribute("height"))
                var newwidth = 0
                var newheight = 0

                if( code === "ptl" )
                {
                    console.log("TOP LEFT POINT ADJUSTING NOW")

                    newwidth = width - (svgP.x - rectstartx),
                    newheight = height - (svgP.y - rectstarty)

                    if( newheight > 0 )
                    {
                        // update the dot location
                        draggingDot.setAttribute("cy", svgP.y)

                        svgObject.setAttribute("y", svgP.y)
                        svgObject.setAttribute( "height", newheight )

                        // move the opposite dot
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-ptr']`).setAttribute("cy", svgP.y )

                        rectstarty = svgP.y
                    }

                    if( newwidth > 0 )
                    {
                        draggingDot.setAttribute("cx", svgP.x)

                        svgObject.setAttribute("x", svgP.x)
                        svgObject.setAttribute( "width", newwidth )

                        // move the side dots
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-pbr']`).setAttribute("cy", svgP.y + newheight)
                        document.querySelector(`circle.draggableDot[spyId='${svgObject.getAttribute("id")}-pbl']`).setAttribute("cx", svgP.x )

                        rectstartx = svgP.x
                    }
                }
                else if( code === "ptr" )
                {
                    console.log("TOP RIGHT POINT ADJUSTING NOW")

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
                    console.log("BOTTOM RIGHT POINT ADJUSTING NOW")

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
                    console.log("BOTTOM LEFT POINT ADJUSTING NOW")

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

        // figure out what the mouse position is
    }

    function dotEndFunction( event )
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

    function dotMouseDownFunction( event )
    {
        draggingDot = event.target

        let svg = document.getElementById(draggingDot.getAttribute("spyId").split("-")[0])

        rectstartx = parseFloat(draggingDot.getAttribute("cx"))
        rectstarty = parseFloat(draggingDot.getAttribute("cy"))
        rectwidth = parseFloat(svg.getAttribute('width'))
        rectheight = parseFloat(svg.getAttribute('height'))

        draggableSvg.getContainerObject().addEventListener("mousemove", dotMouseMoveFunction)
        draggableSvg.getContainerObject().addEventListener("mouseup", dotEndFunction)
        draggableSvg.getContainerObject().addEventListener("mouseleave", dotEndFunction)
    }

    /**
     * 
     * @param {*} spyId 
     * @param {*} x 
     * @param {*} y 
     */
    function createDot( spyId, x, y)
    {
        // add a dot where one of the line points are
        var dot = document.createElementNS(NS.svg, "circle")

        dot.setAttribute("class", "draggableDot")
        dot.setAttribute("r", "20")
        // get the x and y of all the points of the rectangles and lines
        dot.setAttribute("cx", x)
        dot.setAttribute("cy", y)
        dot.setAttribute("fill", "red")

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
            let rmChild = children[children.length - 1]

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
                    $("button.drawing").trigger("click")
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
                    $("button.outlining").trigger("click")
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
                && (document.querySelectorAll("line.placed").length > 0 || document.querySelectorAll("rect.placed").length > 0 )
            )
        {

            // SHIFT MODE ACTIVATE
            console.log("ACTIVATE THE SHIFT MODE")

            // TODO:

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
                                // Example:   <circle spy="line345-start" ... /> 
                                //            <circle spy="line345-end" ... /> 

                            createDot(dotObjectName + 'start', obj.getAttribute("x1"), obj.getAttribute("y1"))
                            createDot(dotObjectName + 'end', obj.getAttribute("x2"), obj.getAttribute("y2"))
                            break;

                        case 'rect':
                            // create a new dot element that has an attribute for spy element attribute name
                                // Example:   <circle spy="rect123-ptl" ... /> top left 
                                //            <circle spy="rect123-ptr" ... /> top right
                                //            <circle spy="rect123-pbr" ... /> bottom right
                                //            <circle spy="rect123-pbl" ... /> bottom left
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
                // either add another layer to the html page that holds the endpoints



            // add the key listener specifically to cancel the shift function
            document.addEventListener("keyup", shiftKeyup);
        }

        // TODO: this is temporary
        console.log(`Key & Code: \n\n\tKey: '${event.key}' \n\tCode: ${event.keyCode}`)
        return true;
    }

    /**
     * @function .windowminimizebtn.click()
     * @description Show and hide contents of the tool windows works generically so we can add more later
     */
    $('button.windowminimizebtn').on( "click", function(event) {
        minimizeToolsWindow(event)
    });
    
    /**
     * @function #penciloptbtn.click()
     * @description this function activates the drawing listeners and handles multiple click instances.
     */
    $('#penciloptbtn').on("click", function( event ) {
        
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
    })

    /**
     * @function #outlinebtnopt.click()
     * @description activate and deactivate the drawing capability of the rectangles 
     */
    $('#outlinebtnopt').on("click", function( event ) {
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
    })
    
    /** 
     * @function .windowoptionsbar.click()
     * @description Hide and show the toolbox if the option bar is clicked
     */
    $(".windowoptionsbar").on("click", function(event) {
        optionsAction(event.target)
    })

    /**
     * @function exportbtn.mousedown()
     * @description drae the box that is used for inputing export information
     */
    $('#exportbtn').on("mousedown", function(event) {

        // TODO: format the output box better

        // if the exportbox exists cancel whole function
        if( document.querySelectorAll("div[class='exportmainbox']").length !== 0)
        {
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
        savebtn.type = "button"
        savebtn.classList.add("exportpanelbtn")
        savebtn.setAttribute("id", "savebtn")

        cancelbtn.innerHTML = "Cancel";
        cancelbtn.classList.add("exportpanelbtn")

        centerbox.style.width = "30%";

        leftbox.appendChild(cancelbtn)
        leftbox.style.textAlign = "center"
        leftbox.style.width = "30%"

        rightbox.appendChild(savebtn)
        rightbox.style.width = "30%"
        rightbox.style.textAlign = "center"

        fileinputname.setAttribute("name", "exportfilename")
        fileinputname.setAttribute("type", "text")
        fileinputnamelabel.innerHTML = "File Name:  "
        fileinputname.placeholder = "filename"
        
        fileinputtype.setAttribute("name", "exportfiletype-svg")
        fileinputtype.setAttribute("type", "checkbox")
        fileinputtypelabel.innerHTML = "Output Types:   "

        fileinputtypesvglabel.innerHTML = "SVG"
        fileinputtypesvglabel.style.margin = "0 auto 0 0"
        fileinputtypesvglabel.style.width = "3em"

        var fileinputtype1 = fileinputtype.cloneNode(true);

        let fileinputtypepnglabel = fileinputtypesvglabel.cloneNode(true)
        fileinputtypepnglabel.innerHTML = "PNG"

        var fileinputtype2 = fileinputtype.cloneNode(true);

        let fileinputtypetifflabel = fileinputtypesvglabel.cloneNode(true)
        fileinputtypetifflabel.innerHTML = "GeoTIFF"
        
        //TODO:  disabled this checkbox
        fileinputtype2.classList.add("disabled")

        var fileinputtype3 = fileinputtype.cloneNode(true);

        let fileinputtypejpeglabel = fileinputtypesvglabel.cloneNode(true)
        fileinputtypejpeglabel.innerHTML = "JPEG"

        form.setAttribute("method", "post")
        form.setAttribute("enctype", "multipart/form-data")
        form.setAttribute("runat", "server")
        form.setAttribute("action", "/export")

        let formlabelbox = document.createElement("div")
        let forminputbox = document.createElement("div")
        let forminputcheckboxholder = document.createElement("div")
        let dividericonbox = document.createElement("div")

        dividericonbox.innerHTML ="&rarr;"
        dividericonbox.style.margin ="0 auto 0 0"
        dividericonbox.style.width = "1em"

        formlabelbox.classList.add("formlabelbox")
        forminputbox.classList.add("forminputbox")
        forminputcheckboxholder.classList.add("forminputcheckboxholder")

        formlabelbox.append( fileinputnamelabel, document.createElement("br"),  document.createElement("br"), fileinputtypelabel )
        forminputbox.append( fileinputname, forminputcheckboxholder )

        let columnsvg = document.createElement("div")
        let columnpng = document.createElement("div")
        let columntiff = document.createElement("div")
        let columnjpg = document.createElement("div")

        columnsvg.classList.add("column")
        columnpng.classList.add("column")
        columntiff.classList.add("column")
        columnjpg.classList.add("column")

        columnsvg.append(fileinputtypesvglabel, dividericonbox , fileinputtype)
        columnpng.append(fileinputtypepnglabel, dividericonbox.cloneNode(true), fileinputtype1)
        columntiff.append(fileinputtypetifflabel, dividericonbox.cloneNode(true), fileinputtype2)
        columnjpg.append(fileinputtypejpeglabel,  dividericonbox.cloneNode(true), fileinputtype3)

        forminputcheckboxholder.append(columnsvg , columntiff, columnpng, columnjpg)

        form.append( formlabelbox, forminputbox )

        inputholder.appendChild(form)

        /**
         * @function onclick savebtn
         * @description send a post to the server to download an svg file of the svgcontainer
         * */
        savebtn.addEventListener("click", function ( event )
        {
            event.preventDefault();

            var regexp = new RegExp( /([A-Z]|[0-9])*(?:\.(png|jpg|svg|tiff|tif)|\s)$/i ),
                breakFlag = false;

            // change the color of the borde for bad filename
            if(  regexp.test(fileinputname.value) || fileinputname.value.length == 0 )
            {
                fileinputname.classList.add("invalid")
                breakFlag = true;
                alert("User Error: filename should not include any file extension.\n Example: 'test.png' should be 'test'.")
            }
            else
            {
                fileinputname.classList.remove("invalid")
            }

            // change color of the input box if needed
            if( validFileTypes( fileinputtype.checked, fileinputtype1.checked, fileinputtype2.checked, fileinputtype3.checked) && !breakFlag )
            {
                forminputcheckboxholder.classList.remove("invalid")
            }
            else if( !breakFlag )
            {
                forminputcheckboxholder.classList.add("invalid")
                breakFlag = true;
                alert("User Error: Must select an export type from the checkboxes.")
            }

            // send request if the filename input is not empty
            if( fileinputname.value.length !== 0 && !breakFlag )
            {
                // create the request data using the form
                var fd = new FormData(form)
                var xhr = new XMLHttpRequest();

                // set response type
                xhr.responseType = 'json'

                var temp = cleanSVG( document.getElementById("figurecontainer").cloneNode(true) )

                // append the xml header line to make an official svg file
                var data = 
                    '<?xml version="1.0" encoding="UTF-8"?>'
                    + (new XMLSerializer()).serializeToString( temp );

                // creates a blob from the encoded svg and sets the type of the blob to and image svg
                var svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });

                // append the svgBlob as a file with the name given the exportfile 
                fd.append("exportfile", svgBlob, fileinputname.value+"_tmp.svg" )
                fd.append("svg", fileinputtype.checked )
                fd.append("png", fileinputtype1.checked )
                fd.append("tiff",fileinputtype2.checked )
                fd.append("jpeg",fileinputtype3.checked )
                fd.append("dims",figsizeselect.value )

                // when the requests load handle the response
                xhr.onloadend = () => {
                    
                    // response has all the links for downloading images
                    Object.keys(xhr.response).forEach( filetype => {
                        const filename = xhr.response[filetype];

                        // download the filepath
                        console.log(`Download the ${filetype} file at ${filename}`)

                        // create new formdata to tell the server what to download
                        var postData = new FormData();
                        postData.append('fileName', filename);

                        // set up the XMLHttp request to the download link
                        var xhrd = new XMLHttpRequest();
                        xhrd.open('GET', '/download/'+filename, true);
                        xhrd.responseType = 'blob';

                        // download the blob as a file
                        xhrd.onload = function (event) {
                            var blob = this.response;
                            
                            saveBlob(blob, filename);
                        }
                        xhrd.send(postData);
                    });
                }

                // open the request and send the data
                xhr.open('POST', "/export", true)
                xhr.send(fd)

                // remove the UI download box
                cancelbtn.click();
                return false;
            }
            return false;
        })

        // cancel button listener
        cancelbtn.addEventListener("click", (event) => {
            document.getElementById("maincontent").removeChild(mainholder)
        })

        // append the main section boxes for the button holder
        buttonholder.append(leftbox, centerbox, rightbox);

        mainholder.append(titleholder, inputholder, document.createElement("br"), buttonholder);
        mainholder.classList.add("exportmainbox");
        // append the main content box
        document.getElementById("maincontent").appendChild(mainholder);
    })

    /** 
     * @function .toolboxminimizebtn.click() 
     * @description handler for the whole tool window mini button
     */
    $('.toolboxminimizebtn').on("click", function(event)
    {
        let toolbox = document.getElementById('toolbox'),
            imgbtn = document.getElementById('addimagebtn'),
            capbtn = document.getElementById('addcaptionbtn')

        // check if the box is already closed, if true, open it, otherwise close
        if( toolbox.classList.contains('closed') )
        {
            toolbox.classList.remove('closed')
            // reactivate the other buttons
            imgbtn.classList.remove("disabled")
            capbtn.classList.remove("disabled")
            event.target.innerHTML = "&larrb;"
        }
        else
        {
            toolbox.classList.add('closed')
            // disable the other buttons to help focus on editing image
            imgbtn.classList.add("disabled")
            capbtn.classList.add("disabled")
            event.target.innerHTML = "&rarrb;"
        }
    })

    /**
     * @function button.toolboxaddcaptionbtn.click()
     * @description adds all caption elements to the svg and menu
     */
    $('button.toolboxaddcaptionbtn').on("click", () =>
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

        /** Dyncamic layer buttoon requires more work*/
        // set the class css and the svg button graphic
        layerbtn.classList.add("windoworderingbtn")
        layerbtn.innerHTML = "<svg viewBox='-10 -10 100 100' width='80%' height='80%' style='padding:1px' >"+
                            "<rect x='10' y='10' width='10' height='10' fill='black' rx='5'/>"+
                            "<rect x='30' y='10' width='50' height='10' fill='black' rx='5'/>"+
                            "<rect x='10' y='41' width='10' height='10' fill='black' rx='5'/>"+
                            "<rect x='30' y='41' width='50' height='10' fill='black' rx='5'/>" + 
                            "<rect x='10' y='70' width='10' height='10' fill='black' rx='5'/>"+
                            "<rect x='30' y='70' width='50' height='10' fill='black' rx='5'/></svg>"
        
        draggableList.addDraggable( layerbtn )

        /** End Dragging */

        // this is all dynamic css for the caption tool box
        // the most important part is just the 'objectid' attribute
        let toolsarea = document.createElement("div"),
            textinput = document.createElement("textarea"),
            widthlabel = document.createElement("label"),
            widthinput = document.createElement("input"),
            heightlabel = document.createElement("label"),
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


            // updpate the text inside once found
            if(matchingCaption)
            {
                // TODO: dynamic font size; hard coded 30
                matchingCaption.innerHTML = text2PieText(this.value, parseFloat(matchingCaption.parentElement.getAttribute("width")), 30);
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
        widthinput.value = 1500
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

                matchingCaption.lastChild.innerHTML = text2PieText(textinput.value, parseFloat(matchingCaption.getAttribute("width")), 30)
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
        textholder.setAttribute("width", "1500")
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
    })
    
    /**
     * @function button.toolboxaddimagebtn.click()
     * @description add the image to the svg and the toolbox stuff
     */
    $('button.toolboxaddimagebtn').on("click", () =>
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

        /** Dyncamic layer buttoon */
        layerbtn.classList.add("windoworderingbtn")
        layerbtn.innerHTML = "<svg viewBox='-10 -10 100 100' width='80%' height='80%' style='padding:1px' >"+
                            "<rect x='10' y='10' width='10' height='10' fill='black' rx='5'/>"+
                            "<rect x='30' y='10' width='50' height='10' fill='black' rx='5'/>"+
                            "<rect x='10' y='41' width='10' height='10' fill='black' rx='5'/>"+
                            "<rect x='30' y='41' width='50' height='10' fill='black' rx='5'/>" + 
                            "<rect x='10' y='70' width='10' height='10' fill='black' rx='5'/>"+
                            "<rect x='30' y='70' width='50' height='10' fill='black' rx='5'/></svg>"
                            
        draggableList.addDraggable( layerbtn )

        /** End Dynamic button*/

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
                        $('#'+imageId).attr('href', e.target.result)
                        $('#'+imageId).attr('GEO', null)
                        $('#'+imageId).attr('filePath', null)

                        ButtonManager.addImage( imageId, [])

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
                    var responseObject = {}
                    if (xhr.status == 200)
                    {
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
                                $('#'+imageId).attr('href', e.target.result)
                                $('#'+imageId).attr('GEO', 'true')
                                $('#'+imageId).attr('filePath', getCookie("filepath"))
                                
                                // read in the data values into attribute values for the image
                                responseObject.pvlData.keys.forEach( key => {
                                    $('#'+imageId).parent().attr(key, responseObject.pvlData.data[key])
                                });

                                // test to see which data values where recieved and activate the buttons that need to be activated for each data value.
                                var btnArray = []
                                // test if the north arrow data is valid and activte the button
                                if ( responseObject.pvlData.data['NorthAzimuth'] )
                                {
                                    btnArray.push('north')
                                }
                                // test if the sun arrow data is valid and activte the button
                                if ( responseObject.pvlData.data['SubSolarAzimuth'] )
                                {
                                    btnArray.push('sun')
                                }
                                // test if the observer arrow data is valid and activte the button
                                if ( responseObject.pvlData.data['SubSpacecraftGroundAzimuth'] )
                                {
                                    btnArray.push('observer')
                                }
                                // test if the scalebar data is valid and activte the button
                                if ( responseObject.pvlData.data['PixelResolution'] )
                                {
                                    btnArray.push('scale');
                                }

                                ButtonManager.addImage(imageId, btnArray )
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
        widthlabel.innerHTML = "Image Width: "
        widthlabel.setAttribute("for", "widthinput")
        widthinput.setAttribute("type", "number")
        widthinput.setAttribute("min", '750')
        widthinput.value = 1500
        widthinput.setAttribute("name","widthinput")

        widthinput.addEventListener("change", function(){
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
            }
        })

        // height input field
        heightlabel.innerHTML = "Image Height: "
        heightlabel.setAttribute("for", "heightinput")
        heightinput.setAttribute("type", "number")
        heightinput.setAttribute("min", '450')
        heightinput.value = 1000
        heightinput.setAttribute("name","heightinput")

        heightinput.addEventListener("change", function(){
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
        holdergroup.classList.add("containingelement")

        draggableSvg.getContainerObject().appendChild(holdergroup)

        // add 1 to the totaly image count
        getObjectCount(1, "image")
    })

    /**
     * @function figsizeselect.onchange
     * @description changes the viewbox setting of the output figure
     */
    $('#figsizeselect').on("change", (event) =>
    {
        // update the svgContainer size
        let tmp = event.target.value.split("x")
        draggableSvg.getContainerObject().setAttribute("viewBox", "0 0 " + tmp[0] + ' ' + tmp[1])
        draggableSvg.getContainerObject().parentElement.setAttribute("viewBox", "-500 0 " + (Number(tmp[0])+1000) + ' ' + tmp[1])
        draggableSvg.getContainerObject().setAttribute("width", tmp[0])
        draggableSvg.getContainerObject().setAttribute("height", tmp[1])
    })

    /**
     * @function backgroundcolor.onchange
     * @description Changes the background color of the editing area.
     * will be visible when exported
     */
    $('#backgroundcolor').on("change", () => {
        setSVGBackground("bgelement", bgPicker.value)
    })

    /** Annotation buttons */
    /**
     * @function northarrowopt.onmousedown
     * @description this function starts the drag and drop logic for the north icon
     */
    $('#northarrowopt').on("mousedown", (event) =>
    {
        if( leftClick(event.button) )
        {
            event.preventDefault()

            let btn = event.target

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
                alert("There Must be an image in the figure to attach a North Arrow")
            }
        }
    })

    /**
     * @function scalebarbtnopt.onmousedown
     * @description this function starts the drag and drop logic for the north icon
     */
    $('#scalebarbtnopt').on("mousedown", (event) =>
    {
        if( leftClick(event.button) )
        {

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
                alert("There Must be an image in the figure to attach a Scalebar")
            }
        }
    })
    
    /**
     * @function sunarrowopt.onmousedown
     * @description this function starts the drag and drop logic for the sun icon
     */
    $('#sunarrowopt').on("mousedown", (event) =>
    {
        if( leftClick(event.button) )
        {
            event.preventDefault()

            let btn = event.target

            if( btn.classList.contains("disabled") )
            {
                return false;
            }
            // check if there is an image
            else if( getObjectCount(0,"image") != 0 )
            {
                // set selected and se selected UI
                if( selectedObject )
                {
                    selectedObject = null
                }
                else
                {
                    // make new shadow icon
                    shadowIcon.icon = shadowIcon.drawShadowIcon( event )
                    document.addEventListener("mousemove", shadowIcon.shadowAnimate);
                    document.getElementsByClassName("maincontent")[0].appendChild(shadowIcon.icon);

                    btn.classList.add("selected")
                    document.addEventListener("mouseup", setElement, true)
                }
            }
            else
            {
                alert("There Must be an image in the figure to attach a Sun Arrow")
            }
        }
    })
    
    /**
     * @function observerharrowopt.onmousedown
     * @description this function starts the drag and drop logic for observer icon
     */
    $('#observerarrowopt').on("mousedown", (event) =>
    {
        if( leftClick(event.button) )
        {
            event.preventDefault()

            let btn = event.target

            if( btn.classList.contains("disabled") )
            {
                return false;
            }
            // if there is no image fail and alert
            else if( getObjectCount(0,"image") != 0 )
            {
                // if the selected object is not null set it to null
                if( selectedObject )
                {
                    selectedObject = null
                }
                else
                {
                    // make new shadow icon
                    shadowIcon.icon = shadowIcon.drawShadowIcon( event )
                    document.addEventListener("mousemove", shadowIcon.shadowAnimate);
                    document.getElementsByClassName("maincontent")[0].appendChild(shadowIcon.icon);
                    
                    // set the selected UI for the observer
                    btn.classList.add("selected")
                    document.addEventListener("mouseup", setElement, true)
                }
            }
            else
            {
                alert("There Must be an image in the figure to attach an Observer Arrow")
            }
        }
    })

    
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
            else
            {
                console.log("Unknown Object ID = " + btn.id)
                console.log(btn)
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
     * @description this function draws the svg icons over the svg figure image where the mouse drop occured
     * 
     * @TODO: the svgIcons should check for the rotation values  of the image and set the rotation of the icons accordingly: ( 0deg = arrow of icon to right )
     *          Must finish ISIS backend first.
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
                    //icongroup.setAttribute( "transform", "rotate(180)")
                }
                else
                {
                    console.error("Translate Values Failed")
                }
                // append the icon to the svg object
                document.getElementById(image.id+"-hg").appendChild(icongroup)
                break
        
            case "sun":
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
                }
                else
                {
                    console.log("Translate Values Failed")
                }

                // append the icon
                document.getElementById(image.id+"-hg").appendChild(icongroup)
                break
        
            case "observer":
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
                }
                else
                {
                    console.error("Translate Values Failed")
                }
            
                // append the icon
                document.getElementById(image.id+"-hg").appendChild(icongroup)
                break

            case "scalebar":
                // TODO: not done at all needs ISIS and much more work.
                // get svg transformed point
                svgP = draggableSvg.svgAPI(event.clientX, event.clientY)
    
                // set group attributes for svg
                icongroup = document.getElementById("scalebargroup").cloneNode(true)
                icongroup.setAttribute("objectid", image.id)
                icongroup.setAttribute("id", "scalebarIcon-" + image.id)
                

                // set the translate location of the icon to where the mouse was released
                newX = getScaledPoint( svgP.x, 1, 1 )
                newY = getScaledPoint( svgP.y, 1, 1 )

                // test valid input and set the transform for all browsers
                if( !isNaN(newX) && !isNaN(newY))
                {

                    // TODO: calculate how big the scalebar needs to be


                    // TODO: this needed to change because sharp cannot process it
                    // set translate
                    icongroup.setAttribute("x", newX)
                    icongroup.setAttribute("y", newY)
                    icongroup.setAttribute("width", 4500*.25)
                    icongroup.setAttribute("height", 700*.25)
                }
                else
                {
                    console.error("Translate Values Failed")
                }
            
                // append the icon
                document.getElementById(image.id+"-hg").appendChild(icongroup)
                
                break
        }

        // find proper tool box
        let imagetoolbox = findImageToolbox( selectedObject.id, document.getElementsByClassName("imagetoolsbox") )

        // draw the tool box based on the icon type
        drawToolbox( imagetoolbox, icontype, icongroup.id, newX, newY )
    }
}) // end of jquery functions

/* Helper functions */

/**
 * @function startButtonManager
 */
var startButtonManager = function() {

    var MemoryObject = {};

    return {
        refresh: function()
        {

            // deactivate all the buttons
            document.getElementById("northarrowopt").classList.add("disabled")
            document.getElementById("sunarrowopt").classList.add("disabled")
            document.getElementById("observerarrowopt").classList.add("disabled")
            document.getElementById("scalebarbtnopt").classList.add("disabled")

            // activate only the ones that are needed
            Object.keys(MemoryObject).forEach( imageId => {

                if( MemoryObject[imageId].indexOf("north") > -1 )
                {
                    // activate the north button
                    document.getElementById("northarrowopt").classList.remove("disabled")
                }
                if( MemoryObject[imageId].indexOf("sun") > -1 )
                {
                    // activate the north button
                    document.getElementById("sunarrowopt").classList.remove("disabled")
                }
                if( MemoryObject[imageId].indexOf("observer") > -1 )
                {
                    // activate the north button
                    document.getElementById("observerarrowopt").classList.remove("disabled")
                }
                if( MemoryObject[imageId].indexOf("scale") > -1 )
                {
                    // activate the north button
                    document.getElementById("scalebarbtnopt").classList.remove("disabled")
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
            }
            this.refresh()
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
 * @description tells which way the scroll wheel is going
 */
function detectMouseWheelDirection( e )
{
    var delta = null,
        direction = false
    ;
    if ( !e ) { // if the event is not provided, we get it from the window object
        e = window.event;
    }
    if ( e.wheelDelta ) { // will work in most cases
        delta = e.wheelDelta / 60;
    } else if ( e.detail ) { // fallback for Firefox
        delta = -e.detail / 2;
    }
    if ( delta !== null ) {
        direction = delta > 0 ? 'up' : 'down';
    }

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
 */
function drawToolbox( toolbox, icontype, iconId, transX, transY )
{
    switch ( icontype )
    {
        case "north":
            let iconscaleinput = document.createElement("input")
            let iconmaincolorinput = document.createElement("input")
            let iconaccentcolorinput = document.createElement("input")
            let scalelabel = document.createElement("label")
            let maincolorlabel = document.createElement("label")
            let accentcolorlabel = document.createElement("label")
            let icontoolbox = document.createElement("div")
            let iconoptionbar = document.createElement("div")
            let iconoptionheader = document.createElement("h4")
            let deletebtn = document.createElement("button")
            let northicontranslatex = document.createElement("input")
            let northicontranslatexlabel = document.createElement("label")
            let northicontranslatey = document.createElement("input")
            let northicontranslateylabel = document.createElement("label")

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

            let suniconscaleinput = document.createElement("input")
            let suniconmaincolorinput = document.createElement("input")
            let suniconaccentcolorinput = document.createElement("input")
            let sunscalelabel = document.createElement("label")
            let sunmaincolorlabel = document.createElement("label")
            let sunaccentcolorlabel = document.createElement("label")
            let sunicontoolbox = document.createElement("div")
            let sunoptionbar = document.createElement("div")
            let sunoptionheader = document.createElement("h4")
            let deletebtn1 = document.createElement("button")
            let sunicontranslatex = document.createElement("input")
            let sunicontranslatexlabel = document.createElement("label")
            let sunicontranslatey = document.createElement("input")
            let sunicontranslateylabel = document.createElement("label")

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

            let obsiconscaleinput = document.createElement("input")
            let obsiconmaincolorinput = document.createElement("input")
            let obsiconaccentcolorinput = document.createElement("input")
            let obsscalelabel = document.createElement("label")
            let obsmaincolorlabel = document.createElement("label")
            let obsaccentcolorlabel = document.createElement("label")
            let obsicontoolbox = document.createElement("div")
            let obsoptionbar = document.createElement("div")
            let obsoptionheader = document.createElement("h4")
            let deletebtn2 = document.createElement("button")
            let obsicontranslatex = document.createElement("input")
            let obsicontranslatexlabel = document.createElement("label")
            let obsicontranslatey = document.createElement("input")
            let obsicontranslateylabel = document.createElement("label")

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
            //TODO: Do the same thing to fix the scalebar and I did the north icon
           
            let scalemaincolorinput = document.createElement("input")
            let scaleaccentcolorinput = document.createElement("input")
            let scaleaccentcolorlabel = document.createElement("label")
            let scalemaincolorlabel = document.createElement("label")
            let scaleicontoolbox = document.createElement("div")
            let scaleoptionbar = document.createElement("div")
            let scaleoptionheader = document.createElement("h4")
            let deletebtn3 = document.createElement("button")
            let scaleicontranslatex = document.createElement("input")
            let scaleicontranslatexlabel = document.createElement("label")
            let scaleicontranslatey = document.createElement("input")
            let scaleicontranslateylabel = document.createElement("label")

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
 * 
 */
function findImageToolbox( id, array )
{
    for( index in array )
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
function removeMarker( markerString )
{
    document.getElementById("figdefs").removeChild( 
        document.getElementById( markerString.split('url("#')[1].replace('")',"") )
        )
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

        // remove marker if there is one
        if( linesvg.getAttribute("marker-end") != "" )
        {
            removeMarker(linesvg.getAttribute("marker-end") )
        }

        if( linesvg.getAttribute("marker-start")  != "" )
        {
            removeMarker(linesvg.getAttribute("marker-start") )
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
                changeColorsOfChildren( icon.firstElementChild.childNodes, colorval, "stroke", "stroke", "fill" )
            }
            else if( icon.id.indexOf( "observer" ) > -1 )
            {
                // change the primary of the observer icon
                changeColorsOfChildren( icon.firstElementChild.childNodes, colorval, "stroke", "stroke", "stroke", "fill stroke", "", "stroke fill" )
            }
            else if( icon.id.indexOf( "scalebar" ) > -1 )
            {
                // change the primary of the observer icon
                changeColorsOfChildren( icon.firstElementChild.childNodes, colorval, "stroke", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "stroke")
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
                changeColorsOfChildren( icon.firstElementChild.childNodes, colorval, "fill", "fill", "stroke" )
            }
            else if( icon.id.indexOf( "observer" ) > -1 )
            {
                // change the secondary of the observer icon
                changeColorsOfChildren( icon.firstElementChild.childNodes, colorval, "fill", "fill", "fill", "", "fill stroke", "")
            }
            else if( icon.id.indexOf( "scalebar" ) > -1 )
            {
                // change the primary of the observer icon
                changeColorsOfChildren( icon.firstElementChild.childNodes, colorval, "fill", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" )
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
            case 0:
                // enable or disable buttons depending on code
                if( ActivationCode == "enable" )
                {
                    document.getElementById( "northarrowopt" ).classList.remove( "disabled" )
                    document.getElementById( "observerarrowopt" ).classList.remove( "disabled" )
                    document.getElementById( "sunarrowopt" ).classList.remove( "disabled" )
                    document.getElementById( "scalebarbtnopt" ).classList.remove( "disabled" )
                    document.getElementById( "outlinebtnopt" ).classList.remove( "disabled" )
                }
                else if( ActivationCode == "disable" )
                {
                    document.getElementById( "northarrowopt" ).classList.add( "disabled" )
                    document.getElementById( "observerarrowopt" ).classList.add( "disabled" )
                    document.getElementById( "scalebarbtnopt" ).classList.add( "disabled" )
                    document.getElementById( "sunarrowopt" ).classList.add( "disabled" )
                    document.getElementById( "outlinebtnopt" ).classList.add( "disabled" )
                }
                break
            
            case 1:
                // enable or disable buttons depending on code
                if( ActivationCode == "enable" )
                {
                    document.getElementById( "northarrowopt" ).classList.remove( "disabled" )
                    document.getElementById( "observerarrowopt" ).classList.remove( "disabled" )
                    document.getElementById( "scalebarbtnopt" ).classList.remove( "disabled" )
                    document.getElementById( "sunarrowopt" ).classList.remove( "disabled" )
                    document.getElementById( "penciloptbtn" ).classList.remove( "disabled" )
                }
                else if( ActivationCode == "disable" )
                {
                    document.getElementById( "northarrowopt" ).classList.add( "disabled" )
                    document.getElementById( "observerarrowopt" ).classList.add( "disabled" )
                    document.getElementById( "scalebarbtnopt" ).classList.add( "disabled" )
                    document.getElementById( "sunarrowopt" ).classList.add( "disabled" )
                    document.getElementById( "penciloptbtn" ).classList.add( "disabled" )
                }
                break
            
            case 2:
                // enable or disable buttons depending on code
                if( ActivationCode == "enable" )
                {
                    document.getElementById( "northarrowopt" ).classList.remove( "disabled" )
                    document.getElementById( "observerarrowopt" ).classList.remove( "disabled" )
                    document.getElementById( "scalebarbtnopt" ).classList.remove( "disabled" )
                    document.getElementById( "sunarrowopt" ).classList.remove( "disabled" )
                    document.getElementById( "penciloptbtn" ).classList.remove( "disabled" )
                    document.getElementById( "outlinebtnopt" ).classList.remove( "disabled" )
                }
                else if( ActivationCode == "disable" )
                {
                    document.getElementById( "northarrowopt" ).classList.add( "disabled" )
                    document.getElementById( "observerarrowopt" ).classList.add( "disabled" )
                    document.getElementById( "scalebarbtnopt" ).classList.add( "disabled" )
                    document.getElementById( "sunarrowopt" ).classList.add( "disabled" )
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
    let linex1input = document.createElement("input")
    let linex1inputlabel = document.createElement("label")
    let liney1input = document.createElement("input")
    let liney1inputlabel = document.createElement("label")
    let widthlabel = document.createElement("label")
    let linewidthinput = document.createElement("input")
    let colorlabel = document.createElement("label")
    let linecolorinput = document.createElement("input")
    let linetoolbox = document.createElement("div")
    let lineoptionbar = document.createElement("div")
    let lineoptionheader = document.createElement("h4")
    let deletebtn = document.createElement("button")
    let minibtn = document.createElement("button")
    let layerbtn = document.createElement("button")
    let linex2input = document.createElement("input")
    let linex2inputlabel = document.createElement("label")
    let liney2input = document.createElement("input")
    let liney2inputlabel = document.createElement("label")
    let lineheadinput = document.createElement("select")
    let lineheadinputlabel = document.createElement("label")

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

    /** Dyncamic layer buttoon requires more work*/
    // set the class css and the svg button graphic
    layerbtn.classList.add("windoworderingbtn")
    layerbtn.innerHTML = "<svg viewBox='-10 -10 100 100' width='80%' height='80%' style='padding:1px' >"+
                        "<rect x='10' y='10' width='10' height='10' fill='black' rx='5'/>"+
                        "<rect x='30' y='10' width='50' height='10' fill='black' rx='5'/>"+
                        "<rect x='10' y='41' width='10' height='10' fill='black' rx='5'/>"+
                        "<rect x='30' y='41' width='50' height='10' fill='black' rx='5'/>" + 
                        "<rect x='10' y='70' width='10' height='10' fill='black' rx='5'/>"+
                        "<rect x='30' y='70' width='50' height='10' fill='black' rx='5'/></svg>"
    
    // main handler for the dragging functionality
    draggableList.addDraggable( layerbtn )
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
                    console.log(line.getAttributeNS(NS.svg, "marker-start"))
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
                
                // Removed until this issue is resolved https://github.com/lovell/sharp/issues/2459 & https://github.com/ChaddFrasier/PIE/issues/180
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
 * 
 * @param {*} buttonid 
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
    // prevent defaults to stop dragging
    console.log(event.button)

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

    /** Dyncamic layer buttoon requires more work*/
    // set the class css and the svg button graphic
    layerbtn.classList.add("windoworderingbtn")
    layerbtn.innerHTML = "<svg viewBox='-10 -10 100 100' width='80%' height='80%' style='padding:1px' >"+
                        "<rect x='10' y='10' width='10' height='10' fill='black' rx='5'/>"+
                        "<rect x='30' y='10' width='50' height='10' fill='black' rx='5'/>"+
                        "<rect x='10' y='41' width='10' height='10' fill='black' rx='5'/>"+
                        "<rect x='30' y='41' width='50' height='10' fill='black' rx='5'/>" + 
                        "<rect x='10' y='70' width='10' height='10' fill='black' rx='5'/>"+
                        "<rect x='30' y='70' width='50' height='10' fill='black' rx='5'/></svg>"
    
    // add all listeners to the btn and the parent element to start dragging in an orderly fashion confined by draggableList.getContainerObject()
    draggableList.addDraggable( layerbtn )

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
        for(let i = 0; i < objectArr.length; i++ ){
            if( objectArr[i].getAttribute("objectid") == objectid )
            { 
                // set the ui input boxes
                var x1input = objectArr[i].children[1].querySelector("input[name='linex1input']")
                x1input.value = Number(args[0]).toFixed(0)

                var y1input = objectArr[i].children[1].querySelector("input[name='liney1input']")
                y1input.value = Number(args[1]).toFixed(0)

                var x2input = objectArr[i].children[1].querySelector("input[name='linex2input']")
                x2input.value = Number(args[2]).toFixed(0)

                var y2input = objectArr[i].children[1].querySelector("input[name='liney2input']")
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
                var xinput = objectArr[i].children[1].querySelector("input[name='rectxinput']")
                xinput.value = Number(args[0]).toFixed(0)

                var yinput = objectArr[i].children[1].querySelector("input[name='rectyinput']")
                yinput.value = Number(args[1]).toFixed(0)
            }
        }
    }
    else if( objectid.indexOf("Icon") > -1 )
    {
    
        var objectArr = document.getElementsByClassName("draggableToolbox") 
 
        if( objectArr.length > 0)
        {
            console.log(objectid)
         
            // more than 1 toolbox present
            for(let i = 0; i < objectArr.length; i++ ){
                if( objectArr[i].getAttribute("objectid").indexOf(objectid.split("-")[1]) > -1 )
                {
                    // set the ui input boxes
                    var xinput = objectArr[i].children[1].querySelectorAll("input[name='iconxcoordinput']")
                    var yinput = objectArr[i].children[1].querySelectorAll("input[name='iconycoordinput']")


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
                    var xinput = objectArr[i].children[1].querySelector("input[name='xcoordinput']")
                    xinput.value = Number(args[0]).toFixed(0)

                    var yinput = objectArr[i].children[1].querySelector("input[name='ycoordinput']")
                    yinput.value = Number(args[1]).toFixed(0)
                }
            }
        }
        else
        {
            console.log("Something went wrong")
        }
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

function LastFigure()
{
    // TODO: undo the figure if possible
}

/**
 * @function text2PieText
 * @param {string} text raw text that needs to be formated
 * @param {number} captionWidth width of the caption object
 * @param {number} fontsize size of the font in the caption
 * 
 * @description this function takes the text of the caption and formats it for the caption object in the svg element.
 */
function text2PieText( text, captionWidth, fontsize )
{
    // create return data and helper data
    let paragraphArr = [],
        paragraphStart = 0,
        constructorArray = [],
        paragraphText = "",
        pieText = "",
        usedPixels = 0;

    // create the first paragraph of the caption
    var p1 = document.createElementNS(NS.svg, "tspan");

    // set the x and y so that the text displays the whole word
    p1.setAttribute("x", fontsize);

    // get an array of all the seperate paragraphs
    paragraphArr = text.split("\n");

    // iterate over each paragraph
    paragraphArr.forEach(ptextwhole => 
    {
        // create a line element to use for adding lines quicker
        var lineObject = document.createElementNS(NS.svg, "tspan")

        // set the init location of the inner line
        lineObject.setAttribute("x", fontsize)
        lineObject.setAttribute("dy", 0)

        // split paragragh into seperate words
        let wordArr = ptextwhole.split(" ");
            
        // iterate over each word
        for (let i = 0; i < wordArr.length; i++)
        {
            const word = wordArr[i];
            // estimate the word length in pixels
            var wordPixels = word.length * fontsize/2

            // check to see of this word goes over the limit of the line
            if( (wordPixels + usedPixels) >= captionWidth - fontsize*2)
            {
                // The limit was reached on the last word
                // reset the used pixel count
                usedPixels = 70

                // append the current line to the lineObject and start a new line
                lineObject.innerHTML = constructorArray.join(' ');

                // append the new line to the paragraphText holder object
                paragraphText += lineObject.outerHTML;
                // set the new dy for the next line
                lineObject.setAttribute("dy", fontsize)
                // cpture the 1 word that did not fit on this line and set it to the next line
                constructorArray = [word];
            }
            else
            {
                // add the word to the line
                constructorArray.push(word)
                // update the curret line pixel count
                usedPixels += wordPixels
            }
        }
        
        // as soon as the paragraph finishes clear the used pixels
        usedPixels = 0

        // check for word overflow. 
        if( constructorArray.length !== 0 )
        {
            // append the overflow line to the lineObject to start a new line
            lineObject.innerHTML = constructorArray.join(' ');
            
            // if the length of the paragraphText is 0 then this is the only line
            if( paragraphText.length === 0 )
            {
                // set 0 if this is the only line
                lineObject.setAttribute("dy", 0)
            }
            else
            {
                // move fontsize down from the last sibling
                lineObject.setAttribute("dy", fontsize)
            }
            // append the overflow line to the paragraph string
            paragraphText += lineObject.outerHTML;

            // clear data from next run
            constructorArray = [];
        }

        // set the innerHTML of the paragraph to the string we created
        p1.innerHTML = paragraphText;

        // we need to set the new y for the paragraph based on the height if the last paragraph
        p1.setAttribute("y", fontsize + paragraphStart);

        // clear strings and objects used for creating the innerHTML
        paragraphText = ""
        lineObject.innerHTML = ""

        // append the paragraph HTML to the pieText string object
        pieText += p1.outerHTML;

        // calculate the new y for the next paragraph
        paragraphStart = parseInt(p1.getAttribute("y")) + (fontsize * p1.childElementCount-1);

        // reset the paragraph element
        p1.innerHTML = paragraphText
    });

    // lastly return the HTML string that is the caption
    return pieText;
}

/**
 * @function getCookie
 * @param {string} cname the name of the cookie
 * @description return a cookie from the users cookie object 
 */
function getCookie(cname)
{
    // atach the '=' to the name
    var name = cname + "=";
    // get the string version of the object
    var decodedCookie = decodeURIComponent(document.cookie);
    // get array of every cookie found
    var cookieArr = decodedCookie.split(';');
    // loop through the cookies and match the name
    for(var i = 0; i < cookieArr.length; i++){
        var cookie = cookieArr[i];
        // if the first character is a space, find the start of the cookie name
        while (cookie.charAt(0) == ' '){
            // get a substring of the cookie with the ' ' removed
            cookie = cookie.substring(1);
        }
        // if the cookie string contains the cname+'='
        if (cookie.indexOf(name) == 0){
            // return that cookie
            return cookie.substring(name.length, cookie.length);
        }
    }
    // not found
    return "";
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
 * @todo this may need d3 or something similar to format the whole thing properly.
 */
function cleanSVG( clone )
{

    /**
     * TODO: 
     * 
     * With this function i want to do through the whole clone and remove 
     * the id and class of every element and nested child inside of the svg so that the server has an easier time handling it
     */

    console.log( clone )

    removeAttributes(clone, "id", "class")

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
 * @description this function will iterate trough the given argumnet array and return true if any true value is found
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