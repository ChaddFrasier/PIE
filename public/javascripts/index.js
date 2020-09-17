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

    svgContainer.addEventListener("DOMMouseScroll", zoomHandler )
    svgContainer.addEventListener("mousedown", dragHandler )
    
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
            svgContainer.removeEventListener("mousedown", drawBoxMouseDownListener )
        }
        else
        {
            // start the drawing functionality
            document.getElementById("editbox").classList.add("outlining")
            event.target.classList.add("outlining")


            changeButtonActivation("disable", 1)

            // add event listener for click on svg
            svgContainer.addEventListener("mousedown", drawBoxMouseDownListener )
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
            toggleLayerUI("add")

            layerbtn.addEventListener("mouseup", documentMouseUpListener)
            document.addEventListener("mousemove", getMouseDirection, false)
           
            // objects that need to shift
            try {
                shiftObjects = event.target.parentElement.parentElement
            
                // the element to put things below
                lowerObject = shiftObjects.nextElementSibling
                
                // the element to put things above
                upperObject = shiftObjects.previousElementSibling
                
                // put dragging stuff here
                document.addEventListener("mousemove", docucmentMouseOverHandler)

                // set shiftObjects css
                shiftObjects.classList.add("selectedBox")
            }catch(err)
            {
                console.log(err)
                upperObject, lowerObject, shiftObjects = null
            }
        })

        // add the window lister to remove active dragging
        window.addEventListener("mousedown", () => {
            window.addEventListener("mouseup", documentMouseUpListener)
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
                matchingCaption.innerHTML = this.value
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

        dividerObject.insertAdjacentElement("afterend", holderbox)

        /** Add a caption box in the svg area */
        const textholder = document.createElementNS(NS.svg, "foreignObject")
        textholder.setAttribute("id", captionId)
        textholder.setAttribute("x", "0")
        textholder.setAttribute("y", "0")
        textholder.setAttribute("width", "1500")
        textholder.setAttribute("height", "100")
        textholder.setAttribute("class", "captionObject")

        const text = document.createElement("textarea")
        text.classList.add('captions')
        text.setAttribute("id", captionId + "text")
        text.style.fontFamily =  "'Times New Roman', Times, serif"
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

            toggleLayerUI( "add" )

            layerbtn.addEventListener("mouseup", documentMouseUpListener, false)
            document.addEventListener("mousemove", getMouseDirection, false)
           
            // objects that need to shift
            try {
                shiftObjects = event.target.parentElement.parentElement
            
                // the element to put things below
                lowerObject = shiftObjects.nextElementSibling
                
                // the element to put things above
                upperObject = shiftObjects.previousElementSibling
                
                // put dragging stuff here
                document.addEventListener("mousemove", docucmentMouseOverHandler)

                // set shiftObjects css
                shiftObjects.classList.add("selectedBox")
            }catch(err)
            {
                console.log(err)
                upperObject, lowerObject, shiftObjects = null
            }
        })

        // add mouse liseners
        window.addEventListener("mousedown", () => {
            window.addEventListener("mouseup", documentMouseUpListener, false)
        })
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

        // TODO: create a loading icon for when the user uploads an image

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

                xhr.responseType = 'blob'
                
                // when the requests load handle the response
                xhr.onloadend = (blob) => {
                    // this is an effective way of recieving the response return
                    document.getElementById(event.target.parentElement.attributes.objectid.value).setAttribute("href", URL.createObjectURL(xhr.response) )
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
        holderbox.setAttribute("objectid", imageId)
        holderbox.append(newoptionsbar, toolsarea)

        dividerObject.insertAdjacentElement("afterend", holderbox)

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

                // make new shadow icon
                shadowIcon = drawShadowIcon( event )

                document.addEventListener("mousemove", shadowAnimate)
                document.getElementsByClassName("maincontent")[0].appendChild(shadowIcon)

                btn.classList.add("selected")
                document.addEventListener("mouseup", setElement)
            }
        }
        else{
            alert("There Must be an image in the figure to attach a North Arrow")
        }
    })

    /**
     * @function scalebarbtnopt.onmousedown
     * @description this function starts the drag and drop logic for the north icon
     */
    $('#scalebarbtnopt').on("mousedown", (event) => {
        let btn = event.target

        if( getObjectCount(0,"image") != 0)
        {
            if(selectedObject){
                selectedObject = null
            }
            else {
                // make new shadow icon
                shadowIcon = drawShadowIcon( event )

                document.addEventListener("mousemove", shadowAnimate)
                document.getElementsByClassName("maincontent")[0].appendChild(shadowIcon)

                btn.classList.add("selected")
                document.addEventListener("mouseup", setElement)
            }
        }
        else{
            alert("There Must be an image in the figure to attach a Scalebar")
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
                // make new shadow icon
                shadowIcon = drawShadowIcon( event )

                document.addEventListener("mousemove", shadowAnimate)
                document.getElementsByClassName("maincontent")[0].appendChild(shadowIcon)

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
                // make new shadow icon
                shadowIcon = drawShadowIcon( event )

                document.addEventListener("mousemove", shadowAnimate)
                document.getElementsByClassName("maincontent")[0].appendChild(shadowIcon)
                
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
        let parentBox = event.target.parentElement.parentElement
        let svgObject = document.getElementById(event.target.parentElement.attributes.objectid.value)
        
        let toolcontainer = document.getElementById('toolcontainer')
        let svgcontainer = document.getElementById('figurecontainer')

        // remove the options and other things for image
        toolcontainer.removeChild(parentBox) 
        svgcontainer.removeChild(svgObject)

        // remove all icons using image remove btn
        if( document.getElementById("northIcon-" + svgObject.id) )
        {
            do{
                svgcontainer.removeChild(document.getElementById("northIcon-" + svgObject.id))
            }while( document.getElementById("northIcon-" + svgObject.id) )
        }
       

        if( document.getElementById("sunIcon-" + svgObject.id) )
        {
            do{
                svgcontainer.removeChild(document.getElementById("sunIcon-" + svgObject.id))
            }while( document.getElementById("sunIcon-" + svgObject.id) )    
        }
        
        if( document.getElementById("observerIcon-" + svgObject.id) )
        {
            do{
                svgcontainer.removeChild(document.getElementById("observerIcon-" + svgObject.id))
            }while(document.getElementById("observerIcon-" + svgObject.id))    
        }
        
        if( document.getElementById("scalebarIcon-" + svgObject.id) )
        {
            do{
                svgcontainer.removeChild(document.getElementById("scalebarIcon-" + svgObject.id))
            }while(document.getElementById("scalebarIcon-" + svgObject.id))    
        }
        
        // update the count
        getObjectCount(-1 , typeofObject(svgObject.id))
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
 * @function docucmentMouseOverHandler
 * @description handler for when the user wants to drag an element up or down calls the shift functions respectivly
 */
function docucmentMouseOverHandler ( event )
{
    if(yDirection == "up")
    {
        // shift up of both objects are there
        if(shiftObjects && upperObject)
        {
            shiftUp( event.pageY )
        }
    }
    else if(yDirection == "down")
    {
        // shift down of both objects are there
        if(shiftObjects && lowerObject)
        {
            shiftDown( event.pageY )
        }
    }
}
 
/** Setup a function to track the mouse movement of the user */
var xDirection = "",
    yDirection = "",
    oldX = 0,
    oldY = 0,
    sensitivity = 55;
 
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
    // try to set the mouse events for the dragging
    try{
        document.getElementById("toolbox").removeEventListener("mousemove", docucmentMouseOverHandler)
        toggleLayerUI("remove")
        window.removeEventListener("mouseup", documentMouseUpListener)
        document.removeEventListener("mousemove", getMouseDirection)
    }
    catch(err)
    {
        console.log("document listener remove failed")
    }

    
    if( shiftObjects ){ shiftObjects.classList.remove("selectedBox") }
    
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
function shiftUp( pageY )
{
    // check for a none outer object as the upper element
    if( upperObject.getAttribute("objectid") )
    {
        // insert the element above the sifting elements
        document.getElementById("toolcontainer").insertBefore(shiftObjects, upperObject)
        
        // move up one layer
        moveSvgUp(document.getElementById(shiftObjects.attributes.objectid.value))

        // clear elements
        lowerObject = upperObject
        upperObject = shiftObjects.previousElementSibling
        yDirection = ""
        oldY = pageY
    }
}

/**
 * @function shiftDown
 * @description shift the object down one slot in the tools location
 */
function shiftDown( pageY )
{
    // check for an object below
    if( lowerObject )
    {
        lowerObject.insertAdjacentElement("afterend", shiftObjects)

        // move up one layer
        moveSvgDown(document.getElementById(shiftObjects.attributes.objectid.value))

        // clear elements
        upperObject = lowerObject
        lowerObject = shiftObjects.nextElementSibling
        oldY = pageY
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
 * @function moveSvgDown
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

    document.getElementsByClassName("maincontent")[0].removeChild(shadowIcon)
    document.removeEventListener("mousemove", shadowAnimate)

    shadowIcon = null

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
        else if( btn.id.indexOf( "scalebar" ) > -1 )
        {
            iconType = "scalebar"
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
            icongroup.style.scale = "5"

            // set the location of the icon to where the mouse was released
            newX = getScaledPoint( svgP.x, Number(icongroup.style.scale), 24 )
            newY = getScaledPoint( svgP.y, Number(icongroup.style.scale), 24 )
    
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
            icongroup.style.scale = "5"

            // set the location of the icon to where the mouse was released
            newX = getScaledPoint( svgP.x, Number(icongroup.style.scale), 24 )
            newY = getScaledPoint( svgP.y, Number(icongroup.style.scale), 24 )
        
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

            case "scalebar":
                // get svg transformed point
                svgP = createSVGPoint(event.clientX, event.clientY)
    
                // set group attributes for svg
                icongroup = document.getElementById("scalebargroup").cloneNode(true)
                icongroup.setAttribute("objectid", image.id)
                icongroup.setAttribute("id", "scalebarIcon-" + image.id)
                icongroup.style.scale = "0.5"
    
                // set the location of the icon to where the mouse was released
                newX = getScaledPoint( svgP.x, Number(icongroup.style.scale), 2000 )
                newY = getScaledPoint( svgP.y, Number(icongroup.style.scale), 500 )
            
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
            northicontranslatex.value = (transX*iconscaleinput.value).toFixed(0)
            northicontranslatey.value = (transY*iconscaleinput.value).toFixed(0)

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
            sunicontranslatex.value = (transX*suniconscaleinput.value).toFixed(0)
            sunicontranslatex.setAttribute("name", "iconxcoordinput")

            sunicontranslatey.value = (transY*suniconscaleinput.value).toFixed(0)
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
            suniconscaleinput.addEventListener("change", updateIconScale)
            suniconmaincolorinput.addEventListener("change", function(event){updateIconColor(event, 0)})
            suniconaccentcolorinput.addEventListener("change", function(event){updateIconColor(event, 1)})
            sunicontranslatex.addEventListener("change", function(event){updateIconPosition(event, 0)})
            sunicontranslatey.addEventListener("change", function(event){updateIconPosition(event, 1)})

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

            obsicontranslatex.value = (transX*obsiconscaleinput.value).toFixed(0)
            obsicontranslatey.value = (transY*obsiconscaleinput.value).toFixed(0)

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
            scalemaincolorinput.addEventListener("change", function(event){updateIconColor(event, 0)})
            scaleaccentcolorinput.addEventListener("change", function(event){updateIconColor(event, 1)})
            scaleicontranslatex.addEventListener("change", function(event){updateIconPosition(event, 0)})
            scaleicontranslatey.addEventListener("change", function(event){updateIconPosition(event, 1)})

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

    x = x * oldscale / scale 
    y = y * oldscale / scale 

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
    if( event.target.parentElement.parentElement.attributes.objectid.value )
    {
        // remove the current options bar, its next child and the caption matching the same id
        let holderbox = event.target.parentElement.parentElement
        
        let linesvg = document.getElementById( holderbox.attributes.objectid.value )

        // remove all elements
        holderbox.parentElement.removeChild( holderbox )
        svgContainer.removeChild( linesvg )

        // remove marker if there is one
        if( linesvg.style.markerEnd != "" )
        {
            removeMarker(linesvg.style.markerEnd)
        }

        if( linesvg.style.markerStart != "" )
        {
            removeMarker(linesvg.style.markerStart)
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
                changeColorsOfChildren( icon.childNodes, colorval, "stroke", "stroke", "stroke fill" )
            }
            else if( icon.id.indexOf( "sun" ) > -1 )
            {
                // change the primary of the sun icon
                changeColorsOfChildren( icon.childNodes, colorval, "stroke", "stroke", "fill" )
            }
            else if( icon.id.indexOf( "observer" ) > -1 )
            {
                // change the primary of the observer icon
                changeColorsOfChildren( icon.childNodes, colorval, "stroke", "stroke", "stroke", "fill stroke", "", "stroke fill" )
            }
            else if( icon.id.indexOf( "scalebar" ) > -1 )
            {
                // change the primary of the observer icon
                console.log(icon.childNodes.length)
                changeColorsOfChildren( icon.childNodes, colorval, "stroke", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill", "fill" )
            }
            break
        case 1:
            // change secondary color
            if( icon.id.indexOf( "north" ) > -1 )
            {
                // change the secondary of the north icon
                changeColorsOfChildren( icon.childNodes, colorval, "fill", "fill", "" )
            }
            else if( icon.id.indexOf( "sun" ) > -1 )
            {
                // change the secondary of the sun icon
                changeColorsOfChildren( icon.childNodes, colorval, "fill", "fill", "stroke" )
            }
            else if( icon.id.indexOf( "observer" ) > -1 )
            {
                // change the secondary of the observer icon
                changeColorsOfChildren( icon.childNodes, colorval, "fill", "fill", "fill", "", "fill stroke", "")
            }
            else if( icon.id.indexOf( "scalebar" ) > -1 )
            {
                // change the primary of the observer icon
                changeColorsOfChildren( icon.childNodes, colorval, "fill", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "" )
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
            svgContainer.removeChild(line)
            // no need to add tool box
            alert("Your line was too short please draw a larger line")
        }

        document.getElementById("penciloptbtn").click()
        svgContainer.removeEventListener( "mousemove", updateUI )
        svgContainer.removeEventListener( "mouseup", endDraw )

        line.classList.add("placed")
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
            let markerEndid = lineelement.style.markerEnd.split('#')[1].replace('")','')
            let markerStartid = lineelement.style.markerStart.split('#')[1].replace('")','')

            if( markerEndid )
            {
                let newEndMarker = document.getElementById( markerEndid )
                // set attributes for new marker
                newEndMarker.setAttribute("id", objectid + "-marker")
                newEndMarker.firstChild.setAttribute("fill", this.value)
                lineelement.style.markerEnd = `url("#${newEndMarker.getAttribute("id")}")`

                // add the new marker
                document.getElementById("figdefs").appendChild(newEndMarker)
            }

            if( markerStartid )
            {
                let newStartMarker = document.getElementById( markerStartid )
                // set attributes for new marker
                newStartMarker.setAttribute("id", objectid + "-markerEnd")
                newStartMarker.firstChild.setAttribute("fill", this.value)
                lineelement.style.markerStart = `url("#${newStartMarker.getAttribute("id")}")`

                // add the new marker
                document.getElementById("figdefs").appendChild(newStartMarker)
            }
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

        toggleLayerUI("add")

        layerbtn.addEventListener("mouseup", documentMouseUpListener, false)
        document.addEventListener("mousemove", getMouseDirection, false)
       
        // objects that need to shift
        try {
            shiftObjects = event.target.parentElement.parentElement
        
            // the element to put things below
            lowerObject = shiftObjects.nextElementSibling
            
            // the element to put things above
            upperObject = shiftObjects.previousElementSibling
            
            // put dragging stuff here
            document.getElementById("toolbox").addEventListener("mousemove", docucmentMouseOverHandler)
            
            // set shiftObjects css
            shiftObjects.classList.add("selectedBox")
        }catch(err)
        {
            console.log(err)
            upperObject, lowerObject, shiftObjects = null
        }
    })

    // add the window lister to remove active dragging
    window.addEventListener("mousedown", () => {
        window.addEventListener("mouseup", documentMouseUpListener, false)
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
                    createMarker(line.style.markerEnd, line.id, "arrow", 0 )
                    break
                case "square":
                    createMarker(object.style.markerEnd, line.id, "square", 0 )
                    break
                case "circle":
                    createMarker(object.style.markerEnd, line.id, "circle", 0 )
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
                    createMarker(line.style.markerStart, line.id, "arrow", 1 )
                    break
                case "square":
                    createMarker(object.style.markerStart, line.id, "square", 1 )
                    break
                case "circle":
                    createMarker(object.style.markerStart, line.id, "circle", 1 )
                    break
                default:
                    object.style.markerStart = "";
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

    document.getElementById("tooldivider").insertAdjacentElement("afterend", holderbox)
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

                // set line marker end
                line.style.markerEnd = `url(#${newmarker.id})`
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
                newmarker.setAttribute("orient", "auto-start-reverse")

                // append the new marker
                document.getElementById("figdefs").appendChild(newmarker)

                // set line marker end
                line.style.markerStart = `url(#${newmarker.id})`
            }
        }
    }
}

/**
 * @function zoomHandler
 * @param {_Event} event - the event of the scroll wheel
 * @description change the main size of whatever element the target it
 */
function zoomHandler( event ) {
    let direction = detectMouseWheelDirection( event )

//    console.log(event.target.nodeName)

    if( event.target.nodeName == "image")
    {
        switch( direction )
        {
            case "up":
                event.target.setAttribute("width", Number(event.target.getAttribute("width"))+50)
                event.target.setAttribute("height", Number(event.target.getAttribute("height"))+50)

                // TODO: zoom handler input changes

                break

            case "down":
                event.target.setAttribute("width", Number(event.target.getAttribute("width"))-50)
                event.target.setAttribute("height", Number(event.target.getAttribute("height"))-50)

                // TODO: zoom handler input changes

                break
        }
    }
    else if( event.target.nodeName == "TEXTAREA" )
    {
        switch( direction )
        {
            case "up":
                event.target.parentElement.setAttribute("width", Number(event.target.parentElement.getAttribute("width"))+50)
                event.target.parentElement.setAttribute("height", Number(event.target.parentElement.getAttribute("height"))+50)

                // TODO: zoom handler input changes

                break

            case "down":
                event.target.parentElement.setAttribute("width", Number(event.target.parentElement.getAttribute("width"))-50)
                event.target.parentElement.setAttribute("height", Number(event.target.parentElement.getAttribute("height"))-50)

                // TODO: zoom handler input changes

                break
        }
    }
    else if( event.target.nodeName == "line" || event.target.nodeName == "rect" )
    {
        let strokeWidth = 0
        switch( direction )
        {
            case "up":
                strokeWidth = Number(event.target.getAttribute("stroke-width"))+5
                event.target.setAttribute("stroke-width", strokeWidth)

                updateObjectUI( event.target.getAttribute("id"), strokeWidth )
                break

            case "down":
                strokeWidth = Number(event.target.getAttribute("stroke-width"))-5

                event.target.setAttribute("stroke-width", strokeWidth)

                updateObjectUI( event.target.getAttribute("id"), strokeWidth )
                break
        }
    }
    else if( event.target.parentElement.nodeName == "group")
    {
        switch( direction )
        {
            case "up":
                console.log("THIS IS AN ICON")
                // TODO: zoom handler input changes

                break

            case "down":
                console.log("THIS IS AN ICON")
                // TODO: zoom handler input changes

                break
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
 * @function drawBoxMouseDownListener
 * @param {_Event} event - the click event
 * @description drawing a box
 */
function drawBoxMouseDownListener( event )
{
    // prevent defaults to stop dragging
    event.preventDefault()

    let rect = document.createElementNS( NS.svg, "rect" ),
        rectId = randomId("rect"),
        startClickX, startClickY;

    // get transformed svg point where click occured
    let svgP = createSVGPoint( event.clientX, event.clientY )

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
            document.getElementById("outlinebtnopt").click()
            svgContainer.removeEventListener( "mousemove", updateBoxUI )
            svgContainer.removeEventListener( "mouseup", endBoxDraw )

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

    // sets the end of the line to where the mouse is
    svgContainer.addEventListener( "mouseup", endBoxDraw )

    // set the update function
    function updateBoxUI ( event )
    {
            let svgP = createSVGPoint( event.clientX, event.clientY )

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
    svgContainer.addEventListener( "mousemove", updateBoxUI )

    // put the line on the svg image
    svgContainer.appendChild(rect)
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

        toggleLayerUI("add")

        layerbtn.addEventListener("mouseup", documentMouseUpListener, false)
        document.addEventListener("mousemove", getMouseDirection, false)
       
        // objects that need to shift
        try {
            shiftObjects = event.target.parentElement.parentElement
        
            // the element to put things below
            lowerObject = shiftObjects.nextElementSibling
            
            // the element to put things above
            upperObject = shiftObjects.previousElementSibling
            
            // put dragging stuff here
            document.getElementById("toolbox").addEventListener("mousemove", docucmentMouseOverHandler)
            
            // set shiftObjects css
            shiftObjects.classList.add("selectedBox")
        }catch(err)
        {
            console.log(err)
            upperObject, lowerObject, shiftObjects = null
        }
    })

    // add the window lister to remove active dragging
    window.addEventListener("mousedown", () => {
        window.addEventListener("mouseup", documentMouseUpListener)
    })
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

    document.getElementById("tooldivider").insertAdjacentElement("afterend", holderbox)
}

var shadowIcon = null

function shadowAnimate( event )
{
    shadowIcon.style.left = event.pageX
    shadowIcon.style.top = event.pageY
}

function drawShadowIcon( event )
{
    // create a mini symbol that follows the mouse
    let shadowdiv = document.createElement("div")
    shadowdiv.setAttribute("width", "50px")
    shadowdiv.setAttribute("height", "50px")
    shadowdiv.innerHTML = event.target.innerHTML

    shadowdiv.style.opacity = .5
    shadowdiv.style.position = "absolute"
    shadowdiv.style.left = event.pageX
    shadowdiv.style.top = event.pageY

    return shadowdiv
}

var draggingIcon = null,
    oldX = null,
    oldY = null,
    currentX = null,
    currentY = null;

function dragHandler( event )
{
    let svgcontainer = document.getElementById("figurecontainer")
    if(event.target.nodeName != "image")
    {
        draggingIcon = getIconParentContainer( event.target )

        console.log("The dragging object is: ")
        console.log(draggingIcon)

        if( draggingIcon != null )
        {
            let svgP = createSVGPoint( event.clientX, event.clientY )
            oldX = svgP.x
            oldY = svgP.y
    
            
            svgcontainer.addEventListener("mousemove", dragObject )
            svgcontainer.addEventListener("mouseleave", endDrag )
            svgcontainer.addEventListener("mouseup", endDrag )

            draggingIcon.classList.add('dragging')
            svgcontainer.classList.add('dragging')

        }
    }
}

function endDrag( event )
{
    let svgcontainer = document.getElementById("figurecontainer")

    try{
        svgcontainer.removeEventListener("mousemove", dragObject )
        svgcontainer.removeEventListener("mouseleave", endDrag )
        svgcontainer.removeEventListener("mouseup", endDrag )
    }catch( err )
    {
        console.log(err)
    }

    draggingIcon.classList.remove('dragging')
    svgcontainer.classList.remove('dragging')

    draggingIcon = null
    oldX = null
    oldY = null
    currentX = null
    currentY = null
}

function dragObject ( event )
{
    let svgP = createSVGPoint(event.clientX, event.clientY)

    if( draggingIcon.nodeName == "g" )
    {
        let scaledX = getScaledPoint(svgP.x, Number(draggingIcon.style.scale), 25)
        let scaledY = getScaledPoint(svgP.y, Number(draggingIcon.style.scale), 25)

        updateInputField(draggingIcon.getAttribute("id"), scaledX, scaledY)

        draggingIcon.style.transform = translateString(scaledX, scaledY)
    }
    else if( draggingIcon.nodeName == "rect" )
    {
        currentX = getScaledPoint(svgP.x, 1, 1)
        currentY = getScaledPoint(svgP.y, 1, 1)

        y = Number(draggingIcon.getAttribute("y")) + (currentY - oldY)
        x = Number(draggingIcon.getAttribute("x")) + (currentX - oldX)

        draggingIcon.setAttribute("x", x)
        draggingIcon.setAttribute("y", y)

        updateInputField(draggingIcon.getAttribute("id"), x, y)

    }
    else if( draggingIcon.nodeName == "line" )
    {

        // get first mouse position
        currentX = getScaledPoint(svgP.x, 1, 1)
        currentY = getScaledPoint(svgP.y, 1, 1)

        x1 = Number(draggingIcon.getAttribute("x1")) + (currentX - oldX)
        y1 = Number(draggingIcon.getAttribute("y1")) + (currentY - oldY)
        x2 = Number(draggingIcon.getAttribute("x2")) + (currentX - oldX)
        y2 = Number(draggingIcon.getAttribute("y2")) + (currentY - oldY)
        
        draggingIcon.setAttribute("x1", x1)
        draggingIcon.setAttribute("y1", y1)
        draggingIcon.setAttribute("x2", x2)
        draggingIcon.setAttribute("y2", y2)

        updateInputField(draggingIcon.getAttribute("id"), x1, y1, x2, y2)
    }

    oldX = currentX
    oldY = currentY
}

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
    else if( objectid.indexOf("g") > -1)
    {
        var objectArr = document.getElementsByClassName("draggableToolbox") 
        
        // more than 1 toolbox present
        for(let i = 0; i < objectArr.length; i++ ){
            if( objectArr[i].getAttribute("objectid") == objectid )
            {
                // set the ui input boxes
                var xinput = objectArr[i].children[1].querySelector("input[name='iconxcoordinput']")
                xinput.value = Number(args[0]).toFixed(0)

                var yinput = objectArr[i].children[1].querySelector("input[name='iconycoordinput']")
                yinput.value = Number(args[1]).toFixed(0)
            }
        }
    }
}

function getIconParentContainer( target )
{
    try {
        while( !( target == null )
        && target.nodeName != 'g' 
        && target.nodeName != "line" 
        && target.nodeName != "rect" )
        {
            target = target.parentElement
        }
    }catch(err)
    {
        console.log(err)
    }

    return target
}

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

function navigateTo( url )
{
    location.href = url
}

function LastFigure()
{
    // TODO: undo the figure if possible
}

function updateObjectUI( objectid, ...args )
{
    if(objectid.indexOf("line") > -1)
    {
        let objectArr = document.getElementsByClassName("draggableToolbox")
    
        // more than 1 toolbox present
        for(let i = 0; i < objectArr.length; i++ ){
            if( objectArr[i].getAttribute("objectid") == objectid )
            { 
                // set the ui input boxes
                let thickness = objectArr[i].children[1].querySelector("input[name='linethicknessinput']")
                thickness.value = Number(args[0]).toFixed(0)
            }
        }
    }
    else if(objectid.indexOf("rect") > -1)
    {
        let objectArr = document.getElementsByClassName("draggableToolbox")
    
        // more than 1 toolbox present
        for(let i = 0; i < objectArr.length; i++ ){
            if( objectArr[i].getAttribute("objectid") == objectid )
            { 
                // set the ui input boxes
                let thickness = objectArr[i].children[1].querySelector("input[name='rectthicknessinput']")
                thickness.value = Number(args[0]).toFixed(0)
            }
        }
    }

    // TODO: change icon scale when the zoom hanler runs
}