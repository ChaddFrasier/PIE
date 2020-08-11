// GLOABALS
// only used to track which menu item is being moved and where it should move to
var shiftObjects,
    lowerObject, 
    upperObject, 
    selectedObject, 
    svgContainer = null;

// Namespaces for svg
var NS = {xhtml:"http://www.w3.org/1999/xhtml",
            svg: "http://www.w3.org/2000/svg"};

/**
 * @function document.ready()
 * @description Function that runs when the page is done loading
 */
$(document).ready(()=>{
    // local jquery variables
    var bgPicker = document.getElementById("backgroundcolor"),
        dividerObject = document.getElementById("tooldivider"),
        PencilFlag = false,
        OutlineFlag = false;

    // get the global figure element
    svgContainer = document.getElementById("figurecontainer")
    
    // set background right away when page loads
    setSVGBackground(svgContainer, bgPicker.value)

    /** 
     * @function .windowminimizebtn.click()
     * @description Show and hide contents of the tool windows works generically so we can add more later
     */
    $('button.windowminimizebtn').click(function(event) {
        minimizeToolsWindow(event)
    })

    $('#penciloptbtn').click( function( event ) {
        if(PencilFlag)
        {
            // cancel the drawing functionality
            event.target.classList.remove("drawing")
            document.getElementById("editbox").classList.remove("drawing")

            changeButtonActivation("enable", 0)

            // remove draw listeners
            svgContainer.removeEventListener("mousedown", drawMouseDownListener)
        }
        else
        {
            // start the draeing functionality
            event.target.classList.add("drawing")
            document.getElementById("editbox").classList.add("drawing")

            changeButtonActivation("disable", 0)

            // add event listener for click on svg
            svgContainer.addEventListener("mousedown", drawMouseDownListener )
        }
        PencilFlag = !(PencilFlag)
    })

    $('#outlinebtnopt').click( function( event ) {
        if(OutlineFlag)
        {
            // cancel the drawing functionality
            document.getElementById("editbox").classList.remove("outlining")
            event.target.classList.remove("outlining")

            changeButtonActivation("enable", 1)

            // remove draw listeners
            svgContainer.removeEventListener("mousedown", console.log("RUN LISTENER"))
        }
        else
        {
            // start the drawing functionality
            document.getElementById("editbox").classList.add("outlining")
            event.target.classList.add("outlining")


            changeButtonActivation("disable", 1)

            // add event listener for click on svg
            svgContainer.addEventListener("mousedown", console.log("TURN ON") )
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
     * @function .toolboxminimizebtn.click() 
     * @description handler for the whole tool window mini button
     */
    $('.toolboxminimizebtn').click(function(event) {
        let toolbox = document.getElementById('toolbox'),
            imgbtn = document.getElementById('addimagebtn'),
            capbtn = document.getElementById('addcaptionbtn')

        // check if the box is already closed if true open otherwise close
        if( toolbox.classList.contains('closed') ){
            toolbox.classList.remove('closed')
            // reactivate the other buttons
            imgbtn.classList.remove("disabled")
            capbtn.classList.remove("disabled")
            event.target.innerHTML = "◄"
        }
        else{
            toolbox.classList.add('closed')
            // disable the other buttons to help focus on editing image
            imgbtn.classList.add("disabled")
            capbtn.classList.add("disabled")
            event.target.innerHTML = "►"
        }
    })

    /**
     * @function button.toolboxaddcaptionbtn.click()
     * @description adds all caption elements to the svg and menu
     */
    $('button.toolboxaddcaptionbtn').click(() => {

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
        deletebtn.addEventListener( "click", function(event) {
            removeToolsWindow(event)
        })

        /** Dyncamic layer buttoon requires more work*/
        // set the class css and the svg button graphic
        layerbtn.classList.add("windoworderingbtn")
        layerbtn.innerHTML = "<svg viewBox='0 0 100 100' width='100%' height='100%' style='padding:1px' >"+
                            "<rect x='10' y='10' width='10' height='10' fill='black' rx='5'/>"+
                            "<rect x='30' y='10' width='50' height='10' fill='black' rx='5'/>"+
                            "<rect x='10' y='41' width='10' height='10' fill='black' rx='5'/>"+
                            "<rect x='30' y='41' width='50' height='10' fill='black' rx='5'/>" + 
                            "<rect x='10' y='70' width='10' height='10' fill='black' rx='5'/>"+
                            "<rect x='30' y='70' width='50' height='10' fill='black' rx='5'/></svg>"
        
        // main handler for the dragging functionality
        layerbtn.addEventListener("mousedown", function(event) {
            // capture the start y when the click happens
            oldY = event.pageY

            // add the listeners for removing the drag functions
            layerbtn.addEventListener("mouseup", documentMouseUpListener, layerbtn)
            document.addEventListener("mousemove", getMouseDirection, false)
            document.getElementById("toolcontainer").classList.add("hand")
            

            // try to find the element to put things above
            try{
                // ** I know to look for this because the structure of the layer browser. ** could be simplified in the future
                upperObject = (event.target.parentElement.parentElement.previousSibling.previousSibling) ?
                event.target.parentElement.parentElement.previousElementSibling.previousSibling :
                null; 
            }catch{
                upperObject = null
            }
            // the element to put things below
            try{
                lowerObject = event.target.parentElement.parentElement.nextSibling.nextSibling.nextSibling
            }
            catch{
                lowerObject = null
            }
            // objects that need to shift
            try{
                // get current targets parentElement for shifting
                shiftObjects = [event.target.parentElement.parentElement, event.target.parentElement.parentElement.nextSibling]
            }catch{
                shiftObjects = null
            }

            // drag function
            document.addEventListener("mousemove", docucmentMouseOverHandler)
        })

        // add the window lister to remove active dragging
        window.addEventListener("mousedown", () => {
            window.addEventListener("mouseup", documentMouseUpListener, layerbtn)
        })
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
        captiontextcolorlabel.innerHTML = "Font Color"
        captiontextcolorinput.value ="#000"

        captionbackgroundcolorlabel.setAttribute("objectid", captionId)
        captionbackgroundcolorinput.setAttribute("objectid", captionId)
        captionbackgroundcolorinput.setAttribute("type", "color")
        captionbackgroundcolorinput.value = "#d3d3d3"

        captionbackgroundcolorlabel.innerHTML = "Box Color"

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
                matchingCaption.innerHTML = this.value
            }
        })

        /**
         * Do the same general idea for the text input on all the input to follow here
         */
        widthlabel.innerHTML = "Width of Caption: "
        widthlabel.setAttribute("for", "widthinput")
        widthinput.setAttribute("type", "number")
        widthinput.setAttribute("min", '500')
        widthinput.setAttribute("max", 'none')
        widthinput.value = 1500
        widthinput.setAttribute("name","widthlabelinput")

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
            }
        })

        heightlabel.innerHTML = "Height of Caption: "
        heightlabel.setAttribute("for", "widthinput")

        heightinput.setAttribute("type", "number")
        heightinput.setAttribute("min", '100')
        heightinput.value = 100
        heightinput.setAttribute("name","heightlabelinput")
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

        xcoordlabel.innerHTML = "X Coordinate: "
        xcoordlabel.setAttribute("for", "widthinput")
        xcoordinput.setAttribute("type", "number")
        xcoordinput.setAttribute("min", '0')
        xcoordinput.value = 0
        xcoordinput.setAttribute("name","xcoordlabelinput")

        xcoordinput.addEventListener("change", function() {
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value )
            // updpate the text inside once found
            if(matchingCaption && !isNaN(Number(this.value)))
            {
                if( Number(this.value) < Number(this.getAttribute("min")) )
                {
                    matchingCaption.setAttribute("x", Number(this.getAttribute("min")))
                    this.value = Number(this.getAttribute("min"))
                }
                else
                {
                    matchingCaption.setAttribute("x", Number(this.value))
                }
            }
        })
        
        ycoordlabel.innerHTML = "Y Coordinate: "
        ycoordlabel.setAttribute("for", "ycoordinput")
        ycoordinput.setAttribute("type", "number")
        ycoordinput.setAttribute("min", '0')
        ycoordinput.value = '0'
        ycoordinput.setAttribute("name","ycoordlabelinput")
        
        ycoordinput.addEventListener("change", function() {
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value )
            // updpate the text inside once found
            if(matchingCaption && !isNaN(Number(this.value)))
            {
                if( Number(this.value) < Number(this.getAttribute("min")) )
                {
                    matchingCaption.setAttribute("y", Number(this.getAttribute("min")))
                    this.value = Number(this.getAttribute("min"))
                }
                else
                {
                    matchingCaption.setAttribute("y", Number(this.value))
                }
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
        dividerObject.insertAdjacentElement("afterend", toolsarea)
        dividerObject.insertAdjacentElement("afterend", newoptionsbar)

        /** Add a caption box in the svg area */
        const textholder = document.createElementNS(NS.svg, "foreignObject")
        textholder.setAttribute("id", captionId)
        textholder.setAttribute("x", "0")
        textholder.setAttribute("y", "0")
        textholder.setAttribute("width", "1500")
        textholder.setAttribute("height", "100")
        textholder.setAttribute("class", "captionObject")

        const text = document.createElement("div")
        text.classList.add('captions')
        text.setAttribute("id", captionId + "text")
        text.setAttribute("x", "0")
        text.setAttribute("y", "0")
        text.setAttribute("width", "100%")
        text.setAttribute("height", "100%")
        
        text.innerHTML = "This is the caption"

        // finish by adding them to the document
        textholder.appendChild(text)
        svgContainer.appendChild(textholder)

        getObjectCount(1, "caption")
    })
    
    /**
     * @function button.toolboxaddimagebtn.click()
     * @description add the image to the svg and the toolbox stuff
     */
    $('button.toolboxaddimagebtn').click(() => {

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
        deletebtn.addEventListener( "click", function(event) {
            removeToolsWindow(event)
        })

        /** Dyncamic layer buttoon */
        layerbtn.classList.add("windoworderingbtn")
        layerbtn.innerHTML = "<svg viewBox='0 0 100 100' width='100%' height='100%' style='padding:1px' >"+
                            "<rect x='10' y='10' width='10' height='10' fill='black' rx='5'/>"+
                            "<rect x='30' y='10' width='50' height='10' fill='black' rx='5'/>"+
                            "<rect x='10' y='41' width='10' height='10' fill='black' rx='5'/>"+
                            "<rect x='30' y='41' width='50' height='10' fill='black' rx='5'/>" + 
                            "<rect x='10' y='70' width='10' height='10' fill='black' rx='5'/>"+
                            "<rect x='30' y='70' width='50' height='10' fill='black' rx='5'/></svg>"
                            
        layerbtn.addEventListener("mousedown", function(event) {  
            // capture the start y when the click happens
            oldY = event.pageY

            layerbtn.addEventListener("mouseup", documentMouseUpListener, layerbtn)
            document.addEventListener("mousemove", getMouseDirection, false)
            // the element to put things above
            try{
                upperObject = (event.target.parentElement.parentElement.previousSibling.previousSibling) ?
                event.target.parentElement.parentElement.previousElementSibling.previousSibling :
                null;   
            }catch{
                upperObject = null
            }
            // the element to put things below
            try{
                lowerObject = event.target.parentElement.parentElement.nextSibling.nextSibling.nextSibling
            }
            catch{
                lowerObject = null
            }
            // objects that need to shift
            try{
                shiftObjects = [ event.target.parentElement.parentElement, event.target.parentElement.parentElement.nextSibling ]
            }catch{
                shiftObjects = null
            }

            // put dragging stuff here
            document.addEventListener("mousemove", docucmentMouseOverHandler)
        })
        // add mouse liseners
        window.addEventListener("mousedown", function(){
            window.addEventListener("mouseup", documentMouseUpListener, layerbtn)
        })
        /** End Dynamic button*/

        // toolbox attributes
        toolsarea.classList.add("imagetoolsbox")
        toolsarea.setAttribute("id", "imagetoolsbox-"+imageId)
        toolsarea.setAttribute("objectid", imageId)
       
        // file input attributes
        filelabel.innerHTML = "Choose a file: "
        filelabel.setAttribute("for", "imageinput")
        fileinput.setAttribute("type", "file")
        fileinput.setAttribute("name", "uploadfile")
        fileinput.setAttribute("id","input"+imageId)
        fileinput.classList.add('fileinputfield')

        // main form section for file input
        let form = document.createElement("form")
        form.setAttribute("runat", "server")
        form.setAttribute("class", "imageform")
        form.setAttribute("method", "post")
        form.setAttribute("enctype", "multipart/form-data")
        form.setAttribute("action", "/api/isis")
        form.appendChild(fileinput)

        // listener for when the user changes the image of the input field
        fileinput.onchange = function(event){
            // use regexp to test the acceptable file types and handle either way
            let imgregexp = new RegExp("^.*\.(png|PNG|jpg|JPG|SVG|svg)")
            let isisregexp = new RegExp("^.*\.(CUB|cub|tif|TIF)")

            if(imgregexp.test(this.value))
            {
                // read a simple image file and display
                if(this.files && this.files[0])
                {
                    var reader = new FileReader()

                    // occurs after readAsDataURL
                    reader.onload = function(e) {
                        // use jquery to update the image source
                        $('#'+imageId).attr('href', e.target.result)
                    }

                    // convert to base64 string
                    reader.readAsDataURL(this.files[0])
                }
            }
            else if( isisregexp.test(this.value))
            {
                // prevent page default submit
                event.preventDefault()
                // create a form data and request object to call the server
                var fd = new FormData(form)
                var xhr = new XMLHttpRequest()
                
                // when the requests load handle the response
                xhr.onloadend = function(event) {
                    // this is an effective way of recieving the response return
                    console.log(xhr.responseText)
                }

                // open the request and send the data
                xhr.open('POST', "/api/isis", true)
                xhr.send(fd)

                // prevent propigation with non-true return
                return false
            }
            else{
                alert("File Type Not Supported")
            }
        }

        // width input field
        widthlabel.innerHTML = "Width of Image: "
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
        heightlabel.innerHTML = "Height of Image: "
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
        xcoordlabel.innerHTML = "X Coordinate: "
        xcoordlabel.setAttribute("for", "xcoordinput")
        xcoordinput.setAttribute("type", "number")
        xcoordinput.setAttribute("min", '0')
        xcoordinput.value = 0
        xcoordinput.setAttribute("name","xcoordinput")

        xcoordinput.addEventListener("change", function(){
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value )
            // updpate the text inside once found
            if(matchingCaption && !isNaN(Number(this.value)))
            {
                if( Number(this.value) < Number(this.getAttribute("min")) )
                {
                    matchingCaption.setAttribute("x", Number(this.getAttribute("min")))
                    this.value = Number(this.getAttribute("min"))
                }
                else
                {
                    matchingCaption.setAttribute("x", Number(this.value))
                }
            }
        })
        
        // y coordinate input strings
        ycoordlabel.innerHTML = "Y Coordinate: "
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
                if( Number(this.value) < Number(this.getAttribute("min")) )
                {
                    matchingCaption.setAttribute("y", Number(this.getAttribute("min")))
                    this.value = Number(this.getAttribute("min"))
                }
                else
                {
                    matchingCaption.setAttribute("y", Number(this.value))
                }
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
        dividerObject.insertAdjacentElement("afterend", toolsarea)
        dividerObject.insertAdjacentElement("afterend", newoptionsbar)

        // set image initial attributes
        imagesvg.setAttribute("x", "0")
        imagesvg.setAttribute("y", "0")
        imagesvg.setAttribute("width", "1500")
        imagesvg.setAttribute("height", "1000")
        imagesvg.setAttribute("id", imageId)
        imagesvg.setAttribute("href", "test/moonphasestest.jpg")

        svgContainer.appendChild(imagesvg)

        // add 1 to the totaly image count
        getObjectCount(1, "image")
    })

    /**
     * @function figsizeselect.onchange
     * @description changes the viewbox setting of the output figure
     */
    $('#figsizeselect').on("change", (event) => {
        // update the svgContainer size
        let tmp = event.target.value.split("x")
        svgContainer.setAttribute("viewBox", "0 0 " + tmp[0] + ' ' + tmp[1])

        updateUILimits( tmp[0], tmp[1] )
    })

    /**
     * @function backgroundcolor.onchange
     * @description Changes the background color of the editing area.
     * will be visible when exported
     */
    $('#backgroundcolor').on("change", () => {
        setSVGBackground(svgContainer, bgPicker.value)
    })

    /** Annotation buttons */

    /**
     * @function northarrowopt.onmousedown
     * @description this function starts the drag and drop logic for the north icon
     */
    $('#northarrowopt').on("mousedown", (event) => {
        let btn = event.target

        if( getObjectCount(0,"image") != 0)
        {
            if(selectedObject){
                selectedObject = null
            }
            else {
                btn.classList.add("selected")
                document.addEventListener("mouseup", setElement)
            }
        }
        else{
            alert("There Must be an image in the figure to attach a North Arrow")
        }
    })
    
    /**
     * @function sunarrowopt.onmousedown
     * @description this function starts the drag and drop logic for the sun icon
     */
    $('#sunarrowopt').on("mousedown", (event) => {
        let btn = event.target

        // check if there is an image
        if( getObjectCount(0,"image") != 0 )
        {
            // set selected and se selected UI
            if( selectedObject )
            {
                selectedObject = null
            }
            else
            {
                btn.classList.add("selected")
                document.addEventListener("mouseup", setElement)
            }
        }
        else
        {
            alert("There Must be an image in the figure to attach a Sun Arrow")
        }
    })
    
    /**
     * @function observerharrowopt.onmousedown
     * @description this function starts the drag and drop logic for observer icon
     */
    $('#observerarrowopt').on("mousedown", (event) => {
        let btn = event.target

        // if there is no image fail and alert
        if( getObjectCount(0,"image") != 0)
        {
            // if the selected object is not null set it to null
            if( selectedObject )
            {
                selectedObject = null
            }
            else
            {
                // set the selected UI for the observer
                btn.classList.add("selected")
                document.addEventListener("mouseup", setElement)
            }
        }
        else
        {
            alert("There Must be an image in the figure to attach an Observer Arrow")
        }
    })

}) // end of jquery functions

/* Helper functions */
/**
 * @function setSVGBackground
 * @param {Node} svg 
 * @param {string} color 
 * @description just changes the background of the specified element
 */
function setSVGBackground( svg, color )
{
    svg.style.background = color
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
 * @function removeToolsWindow
 * @param {_Event} event
 * @description This function is used to delete the tools window and options bar from the tool box area
 */
function removeToolsWindow( event )
{
    if(event.target.parentElement.attributes.objectid.value)
    {
        // remove the current options bar, its next child and the caption matching the same id
        let captiontoolsbar = event.target.parentElement
        let toolsbox = captiontoolsbar.nextElementSibling
        let captionsvg = document.getElementById(event.target.parentElement.attributes.objectid.value)
        let toolcontainer = document.getElementById('toolcontainer')
        let svgcontainer = document.getElementById('figurecontainer')

        // remove the options and other things for image
        toolcontainer.removeChild(captiontoolsbar) 
        toolcontainer.removeChild(toolsbox)
        svgcontainer.removeChild(captionsvg)

        // try removing each icon seperatly
        try{
            svgcontainer.removeChild(document.getElementById("northIcon-" + captionsvg.id))
        }catch(err){}
        try{
            svgcontainer.removeChild(document.getElementById("sunIcon-" + captionsvg.id))
        }catch(err){}
        try{
            svgcontainer.removeChild(document.getElementById("observerIcon-" + captionsvg.id))
        }catch(err){}

        // update the count
        getObjectCount(-1 , typeofObject(captionsvg.id))
    }
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
 * @function docucmentMouseOverHandler
 * @description handler for when the user wants to drag an element up or down calls the shift functions respectivly
 */
function docucmentMouseOverHandler ()
{
    if(yDirection == "up")
    {
        // shift up of both objects are there
        if(shiftObjects && upperObject)
        {
            shiftUp(shiftObjects, upperObject)
        }
    }
    else if(yDirection == "down")
    {
        // shift down of both objects are there
        if(shiftObjects && lowerObject)
        {
            shiftDown(shiftObjects, lowerObject)
        }
    }
}
 
/** Setup a function to track the mouse movement of the user */
var xDirection = "",
    yDirection = "",
    oldX = 0,
    oldY = 0,
    sensitivity = 50;
 
/**
 * @function getMouseDirection
 * @param {_MouseEvent} e
 * @description get the mouse direction as a string relative to the sensitivity level set globally
 */
function getMouseDirection( e )
{
    //deal with the horizontal case
    if ( oldX + sensitivity < e.pageX )
    {
        // update right
        update = true
        xDirection = "right"

        // new anchor point
        oldX = e.pageX
    } 
    else if( oldX - sensitivity > e.pageX )
    {
        // set update left
        update = true
        xDirection = "left"

        // set new anchor point
        oldX = e.pageX
    }
 
    //deal with the vertical case
    if ( oldY + sensitivity < e.pageY )
    {
        // set update down
        yDirection = "down"
        update = true

        // set new anchor point
        oldY = e.pageY
    }
    else if ( oldY - sensitivity > e.pageY )
    {
        // update the page and set direction up
        update = true
        yDirection = "up"

        // set new anchor point
        oldY = e.pageY
    }
    else
    {
        // direction not determined
        yDirection = ""
    }
}

/**
 * @function documentMouseUpListener
 * @description when the mouse is released remove the listeners
 * 
 * TODO: this couold be manipulated to let the user drag the box up and down contantly until the mouse is lifted
 */
function documentMouseUpListener()
{
    document.getElementById("toolcontainer").classList.remove("hand")

    // try to set the mouse events for the dragging
    try{
        document.removeEventListener("mousemove", docucmentMouseOverHandler)
        window.removeEventListener("mouseup", documentMouseUpListener)
        document.removeEventListener("mousemove", getMouseDirection)
    }
    catch(err)
    {
        console.log("document listener remove failed")
    }

    // remove element markers
    lowerObject = null
    upperObject = null
    shiftObjects = null
    oldX = 0
    oldY = 0
    yDirection = ""
}

/**
 * @function shiftUp
 * @description shift the object up one slot in the tools location
 */
function shiftUp()
{
    // check for a none outer object as the upper element
    if( upperObject.getAttribute("objectid") )
    {
        // insert the element above the sifting elements
        shiftObjects.forEach(domElement => {
            document.getElementById("toolcontainer").insertBefore(domElement, upperObject)
        })
        
        // move up one layer
        moveSvgUp(document.getElementById(shiftObjects[0].attributes.objectid.value))

        // clear elements
        lowerObject = null
        upperObject = null
        shiftObjects = null
        yDirection = ""
    }
}

/**
 * @function shiftDown
 * @description shift the object down one slot in the tools location
 */
function shiftDown()
{
    // check for an object below
    if( lowerObject )
    {
        // Reset the order of the edit box elemets
        shiftObjects.reverse().forEach(domElement => {
            lowerObject.insertAdjacentElement("afterend", domElement)
        })
        // move up one layer
        moveSvgDown(document.getElementById(shiftObjects[0].attributes.objectid.value))

        // clear elements
        lowerObject = null
        upperObject = null
        shiftObjects = null
        yDirection = ""
    }
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
 * @function moveSvgUp
 * @param {Node} element
 * @description move the svg element down to the top of the layers of the svg
 */
function moveSvgDown( element )
{
    document.getElementById("figurecontainer").insertBefore(element, element.previousSibling)
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
        return "image"
    }

    // test string for caption
    if( captionreexp.test( testString ) )
    {
        return "caption"
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
    if(typeofObject(event.target.id) == "image")
    {
        // set element
        selectedObject = event.target
    }
    else if(btn != event.target)
    {
        alert("CANNOT ADD ICON TO THIS ELEMENT")
    }

    // remove the current listener
    this.removeEventListener("mouseup", setElement)
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
        else
        {
            console.log("Unknown Object ID" + btn.id)
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
 */
function drawSvgIcon( image, icontype, event )
{
    let icongroup = null,
        svgP = null,
        newX = 0,
        newY = 0;

    switch (icontype)
    {
        case "north":
            // get svg transformed point
            svgP = createSVGPoint( event.clientX, event.clientY)

            // set group attributes for svg
            icongroup = document.getElementById("northgroup").cloneNode(true)
            icongroup.setAttribute("objectid", image.id)
            icongroup.setAttribute("id", "northIcon-" + image.id)
            icongroup.style.scale = "5"

            // set the location of the icon to where the mouse was released
            newX = getScaledPoint( svgP.x, Number(icongroup.style.scale), 25 )
            newY = getScaledPoint( svgP.y, Number(icongroup.style.scale), 25 )

            // set translate
            icongroup.style.transform = translateString( newX, newY)

            // append the icon
            svgContainer.appendChild(icongroup)
            break
    
        case "sun":
            // get svg transformed point
            svgP = createSVGPoint(event.clientX, event.clientY)

            // set group attributes for svg
            icongroup = document.getElementById("sungroup").cloneNode(true)
            icongroup.setAttribute("objectid", image.id)
            icongroup.setAttribute("id", "sunIcon-" + image.id)
            icongroup.style.scale = "0.5"

            // set the location of the icon to where the mouse was released
            newX = getScaledPoint( svgP.x, Number(icongroup.style.scale), 512 )
            newY = getScaledPoint( svgP.y, Number(icongroup.style.scale), 512 )
    
            // set translate
            icongroup.style.transform = translateString( newX, newY )

            // append the icon
            svgContainer.appendChild(icongroup)
            break
    
        case "observer":
            // get svg transformed point
            svgP = createSVGPoint(event.clientX, event.clientY)

            // set group attributes for svg
            icongroup = document.getElementById("observergroup").cloneNode(true)
            icongroup.setAttribute("objectid", image.id)
            icongroup.setAttribute("id", "observerIcon-" + image.id)
            icongroup.style.scale = "0.5"

            // set the location of the icon to where the mouse was released
            newX = getScaledPoint( svgP.x, Number(icongroup.style.scale), 512 )
            newY = getScaledPoint( svgP.y, Number(icongroup.style.scale), 512 )
        
            if( !isNaN(newX) && !isNaN(newY))
            {
                // set translate
                icongroup.style.transform = translateString( newX, newY )
            }
            else
            {
                console.error("Translate Values Failed")
            }
           
            // append the icon
            svgContainer.appendChild(icongroup)
            break
    }

    // find proper tool box
    let imagetoolbox = findImageToolbox( selectedObject.id, document.getElementsByClassName("imagetoolsbox") )

    // draw the tool box based on the icon type
    drawToolbox( imagetoolbox, icontype, icongroup.id, newX, newY )
}

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
            icontoolbox.setAttribute("objectid", iconId)
            iconscaleinput.setAttribute("step", ".25")
            iconscaleinput.value = 5

            // labels for north
            maincolorlabel.innerHTML = "Main Color"
            accentcolorlabel.innerHTML = "Secondary Color"
            scalelabel.innerHTML = "North Scale"

            // both color input fields
            iconmaincolorinput.setAttribute("type", "color")
            iconmaincolorinput.setAttribute("objectid", iconId)
            iconmaincolorinput.value = "#ffffff"
            iconaccentcolorinput.setAttribute("type", "color")
            iconaccentcolorinput.setAttribute("objectid", iconId)
            iconaccentcolorinput.value = "#000000"

            // set translate x and y element attributes
            northicontranslatex.setAttribute("type", "number")
            northicontranslatex.setAttribute("objectid", iconId)
            northicontranslatex.setAttribute("min", "0")
            northicontranslatey.setAttribute("type", "number")
            northicontranslatey.setAttribute("objectid", iconId)
            northicontranslatey.setAttribute("min", "1")

            // set translate value based on icon scale and fix to integer
            northicontranslatex.value = (transX*5).toFixed(0)
            northicontranslatey.value = (transY*5).toFixed(0)

            // set translate labels
            northicontranslateylabel.innerHTML = "Translate Y Position"
            northicontranslatexlabel.innerHTML = "Translate X Position"

            // set event listeners
            iconscaleinput.addEventListener("change", updateIconScale)
            iconmaincolorinput.addEventListener("change", function(event){updateIconColor(event, 0)})
            iconaccentcolorinput.addEventListener("change", function(event){updateIconColor(event, 1)})
            northicontranslatex.addEventListener("change", function(event){updateIconPosition(event, 0)})
            northicontranslatey.addEventListener("change", function(event){updateIconPosition(event, 1)})

            icontoolbox.classList.add("icontoolbox")

            // append elements to page
            icontoolbox.append(
                scalelabel,
                document.createElement("br"),
                iconscaleinput,
                document.createElement("br"),
                maincolorlabel,
                document.createElement("br"),
                iconmaincolorinput,
                document.createElement("br"),
                accentcolorlabel,
                document.createElement("br"),
                iconaccentcolorinput,
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
            sunicontranslatey.setAttribute("type", "number")
            sunicontranslatey.setAttribute("objectid", iconId)
            sunicontranslatey.setAttribute("min", "1")

            // set label input
            sunicontranslateylabel.innerHTML = "Translate Y Position"
            sunicontranslatexlabel.innerHTML = "Translate X Position"

            // append optionsbar stuff
            sunoptionbar.append(sunoptionheader, document.createElement("br"), deletebtn1)
            sunoptionbar.setAttribute("objectid", iconId)

            // scale input fields
            suniconscaleinput.setAttribute("type", "number")
            suniconscaleinput.setAttribute( "objectid", iconId )
            suniconscaleinput.value = "0.5"
            suniconscaleinput.setAttribute("step", "0.01")

            // labels for input fields
            sunmaincolorlabel.innerHTML = "Sun Main Color"
            sunaccentcolorlabel.innerHTML = "Sun Secondary Color"
            sunscalelabel.innerHTML = "Sun Scale"

            // set translate value
            sunicontranslatex.value = (transX*0.5).toFixed(0)
            sunicontranslatey.value = (transY*0.5).toFixed(0)

            // main color input
            suniconmaincolorinput.setAttribute("type", "color")
            suniconmaincolorinput.setAttribute( "objectid", iconId )
            suniconmaincolorinput.value = "#ffffff"

            // color accent input
            suniconaccentcolorinput.setAttribute("type", "color")
            suniconaccentcolorinput.setAttribute( "objectid", iconId )
            suniconaccentcolorinput.value = "#000000"

            // set event listeners
            suniconscaleinput.addEventListener("change", updateIconScale)
            suniconmaincolorinput.addEventListener("change", function(event){updateIconColor(event, 0)})
            suniconaccentcolorinput.addEventListener("change", function(event){updateIconColor(event, 1)})
            sunicontranslatex.addEventListener("change", function(event){updateIconPosition(event, 0)})
            sunicontranslatey.addEventListener("change", function(event){updateIconPosition(event, 1)})

            sunicontoolbox.classList.add("icontoolbox")

            // append all elements to page
            sunicontoolbox.append(
                sunscalelabel, 
                document.createElement("br"),
                suniconscaleinput,
                document.createElement("br"),
                sunmaincolorlabel,
                document.createElement("br"),
                suniconmaincolorinput,
                document.createElement("br"),
                sunaccentcolorlabel,
                document.createElement("br"),
                suniconaccentcolorinput,
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
            obsicontranslatey.setAttribute("type", "number")
            obsicontranslatey.setAttribute("objectid", iconId)
            obsicontranslatey.setAttribute("min", "1")

            // set start values for label and value of translate
            obsicontranslateylabel.innerHTML = "Translate Y Position"
            obsicontranslatexlabel.innerHTML = "Translate X Position"
            obsicontranslatex.value = (transX*0.5).toFixed(0)
            obsicontranslatey.value = (transY*0.5).toFixed(0)

            // scale input field
            obsiconscaleinput.setAttribute("type", "number")
            obsiconscaleinput.setAttribute("objectid", iconId)
            obsiconscaleinput.setAttribute("step", "0.01")
            obsiconscaleinput.setAttribute("value", "0.5")
            obsiconscaleinput.setAttribute("min", "0.25")

            // create labels
            obsmaincolorlabel.innerHTML = "Observer Main Color"
            obsaccentcolorlabel.innerHTML = "Observer Secondary Color"
            obsscalelabel.innerHTML = "Observer Scale"

            // primary color input
            obsiconmaincolorinput.setAttribute("type", "color")
            obsiconmaincolorinput.setAttribute("objectid", iconId)
            obsiconmaincolorinput.value = "#000000"

            // color input secondary
            obsiconaccentcolorinput.setAttribute("type", "color")
            obsiconaccentcolorinput.setAttribute("objectid", iconId)
            obsiconaccentcolorinput.value = "#ffffff"

            // add events
            obsiconscaleinput.addEventListener("change", updateIconScale)
            obsiconmaincolorinput.addEventListener("change", function(event){updateIconColor(event, 0)})
            obsiconaccentcolorinput.addEventListener("change", function(event){updateIconColor(event, 1)})
            obsicontranslatex.addEventListener("change", function(event){updateIconPosition(event, 0)})
            obsicontranslatey.addEventListener("change", function(event){updateIconPosition(event, 1)})

            obsicontoolbox.classList.add("icontoolbox")

            // append aspect to options bar
            obsoptionbar.append( obsoptionheader, document.createElement("br"), deletebtn2 )
            obsoptionbar.setAttribute( "objectid", iconId )

            // append rest of options
            obsicontoolbox.append( 
                obsscalelabel, 
                document.createElement("br"), 
                obsiconscaleinput, 
                document.createElement("br"),
                obsmaincolorlabel,
                document.createElement("br"),
                obsiconmaincolorinput,
                document.createElement("br"),
                obsaccentcolorlabel,
                document.createElement("br"),
                obsiconaccentcolorinput,
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
        object.style.transform = updateTranslate( object.style.transform, "x", Number( event.target.value ), object.style.scale )
    }
    else if( attrId == 1 )
    {
        object.style.transform = updateTranslate( object.style.transform, "y", Number( event.target.value ), object.style.scale )
    }
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

/**
 * @function findImageToolbox
 * @param {string} id 
 * @param {NodeList} array 
 * @description find the element with the id in the array
 * 
 * //TODO: this could be simplified
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
    let icon = document.getElementById( event.target.attributes.objectid.value )
    let inputvalue = parseFloat( event.target.value )

    if( !isNaN( inputvalue ) )
    {
        let oldscale = icon.style.scale
        icon.style.scale = inputvalue

        // reset the location of the image
        icon.style.transform = rescaleIcon( oldscale, icon.style.scale, icon.style.transform )
    }
}

/**
 * @function rescaleIcon
 * @param {number} oldscale - old scale (used to unscale the icon before setting new scale)
 * @param {number} scale - new scale 
 * @param {string} translate - the transform string that only has translate
 * @description unscale the current translate and then rescale with the new value
 */
function rescaleIcon ( oldscale, scale, translate )
{
    let x = parseInt( translate.split(',')[0].split( "translate(" )[1] )
    let y = parseInt( translate.split(',')[1] )

    x = x * oldscale  / scale 
    y = y * oldscale  / scale 

    return translateString( x, y )
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
        svgContainer.removeChild( iconsvg )
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
    if( event.target.parentElement.attributes.objectid.value )
    {
        // remove the current options bar, its next child and the caption matching the same id
        let toolsbar = event.target.parentElement
        let toolsbox = toolsbar.nextElementSibling
        let linesvg = document.getElementById( toolsbar.attributes.objectid.value )

        // remove all elements
        toolsbox.parentElement.removeChild( toolsbar )
        toolsbox.parentElement.removeChild( toolsbox )
        svgContainer.removeChild( linesvg )

        // remove marker if there is one
        if( linesvg.style.markerEnd != "" )
        {
            removeMarker(linesvg.style.markerEnd)
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
                changeColorsOfChildren( icon.childNodes, colorval, "stroke", "fill", "stroke" )
            }
            else if( icon.id.indexOf( "sun" ) > -1 )
            {
                // change the primary of the sun icon
                changeColorsOfChildren( icon.childNodes, colorval, "stroke", "fill" )
            }
            else if( icon.id.indexOf( "observer" ) > -1 )
            {
                // change the primary of the observer icon
                changeColorsOfChildren( icon.childNodes, colorval, "fill", "fill", "fill", "fill", "fill", "fill" )
            }
            break
        case 1:
            // change secondary color
            if( icon.id.indexOf( "north" ) > -1 )
            {
                // change the secondary of the north icon
                changeColorsOfChildren( icon.childNodes, colorval, "fill", "stroke", "fill" )
            }
            else if( icon.id.indexOf( "sun" ) > -1 )
            {
                // change the secondary of the sun icon
                changeColorsOfChildren( icon.childNodes, colorval, "fill", "stroke" )
            }
            else if( icon.id.indexOf( "observer" ) > -1 )
            {
                // change the secondary of the observer icon
                changeColorsOfChildren( icon.childNodes, colorval, "stroke", "stroke", "stroke", "stroke", "stroke", "stroke" )
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
    switch( code ) 
    {
        case 0:
            // enable or disable buttons depending on code
            if( ActivationCode == "enable" )
            {
                document.getElementById( "northarrowopt" ).classList.remove( "disabled" )
                document.getElementById( "observerarrowopt" ).classList.remove( "disabled" )
                document.getElementById( "sunarrowopt" ).classList.remove( "disabled" )
                document.getElementById( "outlinebtnopt" ).classList.remove( "disabled" )
            }
            else if( ActivationCode == "disable" )
            {
                document.getElementById( "northarrowopt" ).classList.add( "disabled" )
                document.getElementById( "observerarrowopt" ).classList.add( "disabled" )
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
                document.getElementById( "sunarrowopt" ).classList.remove( "disabled" )
                document.getElementById( "penciloptbtn" ).classList.remove( "disabled" )
            }
            else if( ActivationCode == "disable" )
            {
                document.getElementById( "northarrowopt" ).classList.add( "disabled" )
                document.getElementById( "observerarrowopt" ).classList.add( "disabled" )
                document.getElementById( "sunarrowopt" ).classList.add( "disabled" )
                document.getElementById( "penciloptbtn" ).classList.add( "disabled" )
            }
            break
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
        obj.firstChild.style.color = color
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
    let obj = document.getElementById( objectid )

    //change color if its valid throw error otherwise
    if ( obj )
    {
        obj.firstChild.style.background = color
    }
    else
    {
        console.error( "Error: Cannot Find Id for object in function updateCaptionBoxColor" )
    }
}

/**
 * Draw Function 
 */
function drawMouseDownListener( event )
{
    // prevent defaults to stop dragging
    event.preventDefault()

    let line = document.createElementNS( NS.svg, "line" ),
        lineId = randomId("line");

    // get transformed svg point where click occured
    let svgP = createSVGPoint( event.clientX, event.clientY )

    // set line attributes
    line.setAttribute( "x1", svgP.x )
    line.setAttribute( "y1", svgP.y )
    line.setAttribute( "stroke", "white" )
    line.setAttribute( "id", lineId )
    line.setAttribute( "stroke-width", "10" )
    line.setAttribute( "x2", svgP.x )
    line.setAttribute( "y2", svgP.y )

    // create the inner draw listener
    function endDraw( event )
    {
        let svgP = createSVGPoint( event.clientX, event.clientY )
        // calculate distance or length of the line
        let linedist = Math.sqrt( 
                Math.pow( svgP.x - Number(line.getAttribute("x1")), 2 ) 
                + Math.pow( svgP.y - Number(line.getAttribute("y1")), 2 )
                )
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
            svgContainer.removeChild(line)
            // no need to add tool box
            alert("Your line was too short please draw a larger line")
        }

        document.getElementById("penciloptbtn").click()
        svgContainer.removeEventListener( "mousemove", updateUI )
        svgContainer.removeEventListener( "mouseup", endDraw )
    }

    // sets the end of the line to where the mouse is
    svgContainer.addEventListener( "mouseup", endDraw )

    // set the update function
    function updateUI ( event )
    {
        let svgP = createSVGPoint( event.clientX, event.clientY )

        line.setAttribute( "x2", svgP.x )
        line.setAttribute( "y2", svgP.y )
    }

    // event listener for mousemove
    svgContainer.addEventListener( "mousemove", updateUI )

    // put the line on the svg image
    svgContainer.appendChild(line)
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
    linex1input.setAttribute( "min", "0" )
    linex1inputlabel.innerHTML = "Line Head X Coordinate"
    linex1input.value = parseFloat(x1).toFixed(0)

    linex1input.addEventListener("change", function(event)
    {
        // perform line movements
        if( Number(this.getAttribute("min")) > Number(this.value) )
        {
            document.getElementById( this.attributes.objectid.value).setAttribute("x1", Number(this.getAttribute("min")) )
            this.value = Number(this.getAttribute("min"))
        }
        else
        {
            document.getElementById( this.attributes.objectid.value).setAttribute("x1", this.value )
        }
    })

    // input y1 fields
    liney1input.setAttribute("objectid", objectid)
    liney1inputlabel.setAttribute("objectid", objectid)
    liney1inputlabel.innerHTML = "Line Head Y Coordinate"
    liney1input.setAttribute("type", "number")
    liney1input.setAttribute("min", "0")
    liney1input.value = parseFloat(y1).toFixed(0)

    liney1input.addEventListener("change", function(event)
    {
        // y1 translate input
        // perform line movements
        if( Number(this.getAttribute("min")) > Number(this.value) )
        {
            document.getElementById( this.attributes.objectid.value).setAttribute("y1", Number(this.getAttribute("min")) )
            this.value = Number(this.getAttribute("min"))
        }
        else
        {
            document.getElementById( this.attributes.objectid.value).setAttribute("y1", this.value )
        }

    })

    // input line width fields
    widthlabel.setAttribute("objectid", objectid)
    linewidthinput.setAttribute("objectid", objectid)
    widthlabel.innerHTML = "Line Thickness"
    linewidthinput.setAttribute("type", "number")
    linewidthinput.setAttribute("min", "10")
    linewidthinput.value = strokeWidth

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
    colorlabel.innerHTML = "Line Color"
    linecolorinput.setAttribute("type", "color")
    linecolorinput.value = "#ffffff"

    linecolorinput.addEventListener("change", function(event)
    {
        let lineelement = document.getElementById( this.attributes.objectid.value )
        // Update color when the color changes
        lineelement.setAttribute("stroke", this.value )

        try{
            let markerid = lineelement.style.markerEnd.split('#')[1].replace('")','')

            let newMarker = document.getElementById( markerid )
    
            // set attributes for new marker
            newMarker.setAttribute("id", objectid + "-marker")
            newMarker.firstChild.setAttribute("fill", this.value)
            newMarker.setAttribute("markerWidth", lineelement.getAttribute("stroke-width")/2)
            newMarker.setAttribute("markerHeight", lineelement.getAttribute("stroke-width")/2)
            lineelement.style.markerEnd = `url("#${newMarker.getAttribute("id")}")`
    
            // add the new marker
            document.getElementById("figdefs").appendChild(newMarker)
        
        }catch(err){
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
    layerbtn.innerHTML = "<svg viewBox='0 0 100 100' width='100%' height='100%' style='padding:1px' >"+
                        "<rect x='10' y='10' width='10' height='10' fill='black' rx='5'/>"+
                        "<rect x='30' y='10' width='50' height='10' fill='black' rx='5'/>"+
                        "<rect x='10' y='41' width='10' height='10' fill='black' rx='5'/>"+
                        "<rect x='30' y='41' width='50' height='10' fill='black' rx='5'/>" + 
                        "<rect x='10' y='70' width='10' height='10' fill='black' rx='5'/>"+
                        "<rect x='30' y='70' width='50' height='10' fill='black' rx='5'/></svg>"
    
    // main handler for the dragging functionality
    layerbtn.addEventListener("mousedown", function(event) {
        // capture the start y when the click happens
        oldY = event.pageY

        // add the listeners for removing the drag functions
        layerbtn.addEventListener("mouseup", documentMouseUpListener, layerbtn)
        document.addEventListener("mousemove", getMouseDirection, false)

        // try to find the element to put things above
        try{
            // ** I know to look for this because the structure of the layer browser. ** could be simplified in the future
            upperObject = (event.target.parentElement.parentElement.previousSibling.previousSibling) ?
            event.target.parentElement.parentElement.previousElementSibling.previousSibling :
            null; 
        }catch{
            upperObject = null
        }
        // the element to put things below
        try{
            lowerObject = event.target.parentElement.parentElement.nextSibling.nextSibling.nextSibling
        }
        catch{
            lowerObject = null
        }
        // objects that need to shift
        try{
            // get current targets parentElement for shifting
            shiftObjects = [event.target.parentElement.parentElement, event.target.parentElement.parentElement.nextSibling]
        }catch{
            shiftObjects = null
        }

        // drag function
        document.addEventListener("mousemove", docucmentMouseOverHandler)
    })

    // add the window lister to remove active dragging
    window.addEventListener("mousedown", () => {
        window.addEventListener("mouseup", documentMouseUpListener, layerbtn)
    })
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
    linex2inputlabel.innerHTML = "Line Tail X Coordinate"
    linex2input.setAttribute("min", "0")
    linex2input.setAttribute("type", "number")

    linex2input.value = parseFloat(x2).toFixed(0)

    linex2input.addEventListener("change", function(event)
    {
        // x2 translate attribute
        if( Number(this.getAttribute("min")) > Number(this.value) )
        {
            document.getElementById( this.attributes.objectid.value).setAttribute("x2", Number(this.getAttribute("min")) )
            this.value = Number(this.getAttribute("min"))
        }
        else
        {
            document.getElementById( this.attributes.objectid.value).setAttribute("x2", this.value )
        }
    })


    // input y2 fields
    liney2input.setAttribute("objectid", objectid)
    liney2inputlabel.setAttribute("objectid", objectid)
    liney2inputlabel.innerHTML = "Line Tail Y Coordinate"
    liney2input.setAttribute("min", "0")
    liney2input.setAttribute("type", "number")

    liney2input.value = parseFloat(y2).toFixed(0)

    liney2input.addEventListener("change", function(event)
    {
        // line y2 attribute
        if( Number(this.getAttribute("min")) > Number(this.value) )
        {
            document.getElementById( this.attributes.objectid.value).setAttribute("y2", Number(this.getAttribute("min")) )
            this.value = Number(this.getAttribute("min"))
        }
        else
        {
            document.getElementById( this.attributes.objectid.value).setAttribute("y2", this.value )
        }
    })

    // input line ender select elements
    let optionarrow = document.createElement("option"),
        optionsquare = document.createElement("option"),
        optioncircle = document.createElement("option"),
        optionnone = document.createElement("option");

    lineheadinput.setAttribute("objectid", objectid)
    lineheadinputlabel.setAttribute("objectid", objectid)
    lineheadinputlabel.innerHTML = "Line Head"

    // set the options for the input
    optionarrow.innerHTML = "None"
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
                    createMarker(line.style.markerEnd, line.id, "arrow")
                    break
                case "square":
                    createMarker(object.style.markerEnd, line.id, "square" )
                    break
                case "circle":
                    createMarker(object.style.markerEnd, line.id, "circle" )
                    break
                default:
                    object.style.markerEnd = "";
                    document.getElementById("figdefs").removeChild(document.getElementById(line.id+"-marker"))
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

    document.getElementById("toolcontainer").append(lineoptionbar, linetoolbox)
}
 /** End Draw Functions */

function updateUILimits ( newW, newH )
{
    console.log(`The new figure width is ${newW} and the new figure height is ${newH}`)
}

/**
 * @function createMarker
 * @param {string} markerString - raw string from markerEnd
 * @param {string} lineid - the id of the line object
 * @param {string} headcode - string telling the type of head icon
 * @description create and remove markers for customizing lines
 */
function createMarker( markerString, lineid, headcode )
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
            newmarker.setAttribute("markerWidth", line.getAttribute("stroke-width")/2)
            newmarker.setAttribute("markerHeight", line.getAttribute("stroke-width")/2)

            // append the new marker
            document.getElementById("figdefs").appendChild(newmarker)

            // set line marker end
            line.style.markerEnd = `url(#${newmarker.id})`
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
