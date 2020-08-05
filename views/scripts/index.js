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
        PencilFlag = false;

    // get the global figure element
    svgContainer = document.getElementById("figurecontainer");
    
    // set background right away when page loads
    setSVGBackground(svgContainer, bgPicker.value);

    /** 
     * @function .windowminimizebtn.click()
     * @description Show and hide contents of the tool windows works generically so we can add more later
     */
    $('button.windowminimizebtn').click(function(event) {
        minimizeToolsWindow(event);
    });

    $('#penciloptbtn').click( function( event ) {
        if(PencilFlag)
        {
            // cancel the drawing functionality
            console.log("TURN OFF DRAWING");
            event.target.classList.remove("drawing");
            document.getElementById("editbox").classList.remove("drawing");

            changeButtonActivation("enable");

        }
        else
        {
            // start the draeing functionality
            console.log("TURN ON DRAWING");
            event.target.classList.add("drawing");
            document.getElementById("editbox").classList.add("drawing");

            changeButtonActivation("disable");
            
        }

        PencilFlag = !(PencilFlag)
    });
    
    /** 
     * @function .windowoptionsbar.click()
     * @description Hide and show the toolbox if the option bar is clicked
     */
    $(".windowoptionsbar").on("click", function(event) {
        let btn = event.target.lastElementChild;
        if( btn ){
            btn.click();
        }
    });

    /** 
     * @function .toolboxminimizebtn.click() 
     * @description handler for the whole tool window mini button
     */
    $('.toolboxminimizebtn').click(function(event) {
        let toolbox = document.getElementById('toolbox'),
            imgbtn = document.getElementById('addimagebtn'),
            capbtn = document.getElementById('addcaptionbtn');

        // check if the box is already closed if true open otherwise close
        if( toolbox.classList.contains('closed') ){
            toolbox.classList.remove('closed');
            // reactivate the other buttons
            imgbtn.classList.remove("disabled");
            capbtn.classList.remove("disabled");
            event.target.innerHTML = "◄";
        }
        else{
            toolbox.classList.add('closed');
            // disable the other buttons to help focus on editing image
            imgbtn.classList.add("disabled");
            capbtn.classList.add("disabled");
            event.target.innerHTML = "►";
        }
    });

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
            layerbtn = document.createElement("button");

        // set required styles
        newoptionsbar.classList.add("windowoptionsbar");
        newoptionsbar.style.display = "flex";

        // setup the header of the optionsbar
        header.innerHTML = "Caption Layer";

        // same with the minimize button
        minibtn.classList.add("windowminimizebtn");
        minibtn.innerHTML = "▲";

        // cant forget the event handler for the minimize btn
        minibtn.addEventListener( "click", function(event) {
            minimizeToolsWindow(event);
        });

        // same for delete as minimize
        deletebtn.classList.add("windowremovebtn");
        deletebtn.innerHTML = "&times";
        deletebtn.addEventListener( "click", function(event) {
            removeToolsWindow(event);
        });

        /** Dyncamic layer buttoon requires more work*/
        // set the class css and the svg button graphic
        layerbtn.classList.add("windoworderingbtn");
        layerbtn.innerHTML = "<svg viewBox='0 0 100 100' width='100%' height='100%' style='padding:1px' >"+
                            "<rect x='10' y='10' width='10' height='10' fill='black' rx='5'/>"+
                            "<rect x='30' y='10' width='50' height='10' fill='black' rx='5'/>"+
                            "<rect x='10' y='41' width='10' height='10' fill='black' rx='5'/>"+
                            "<rect x='30' y='41' width='50' height='10' fill='black' rx='5'/>" + 
                            "<rect x='10' y='70' width='10' height='10' fill='black' rx='5'/>"+
                            "<rect x='30' y='70' width='50' height='10' fill='black' rx='5'/></svg>";
        
        // main handler for the dragging functionality
        layerbtn.addEventListener("mousedown", function(event) {
            // capture the start y when the click happens
            oldY = event.pageY;

            // add the listeners for removing the drag functions
            layerbtn.addEventListener("mouseup", documentMouseUpListener, layerbtn)
            document.addEventListener("mousemove", getMouseDirection, false);

            // try to find the element to put things above
            try{
                // ** I know to look for this because the structure of the layer browser. ** could be simplified in the future
                upperObject = (event.target.parentElement.parentElement.previousSibling.previousSibling) ?
                event.target.parentElement.parentElement.previousElementSibling.previousSibling :
                null; 
            }catch{
                upperObject = null;
            }
            // the element to put things below
            try{
                lowerObject = event.target.parentElement.parentElement.nextSibling.nextSibling.nextSibling
            }
            catch{
                lowerObject = null;
            }
            // objects that need to shift
            try{
                // get current targets parentElement for shifting
                shiftObjects = [event.target.parentElement.parentElement, event.target.parentElement.parentElement.nextSibling];
            }catch{
                shiftObjects = null;
            }

            // drag function
            document.addEventListener("mousemove", docucmentMouseOverHandler);
        });

        // add the window lister to remove active dragging
        window.addEventListener("mousedown", () => {
            window.addEventListener("mouseup", documentMouseUpListener, layerbtn)
        });
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

        captiontextcolorlabel.setAttribute("objectid", captionId);
        captiontextcolorinput.setAttribute("objectid", captionId);

        captiontextcolorinput.setAttribute("type", "color");

        captiontextcolorlabel.innerHTML = "Font Color"

        captionbackgroundcolorlabel.setAttribute("objectid", captionId);
        captionbackgroundcolorinput.setAttribute("objectid", captionId);

        captionbackgroundcolorinput.setAttribute("type", "color");

        captionbackgroundcolorlabel.innerHTML = "Box Color"

        // set attributes and classes
        toolsarea.classList.add("captiontoolsbox");
        toolsarea.setAttribute("id", "captiontoolsbox-"+captionId);
        toolsarea.setAttribute("objectid", captionId);
        textlabel.innerHTML = "Caption Text: ";
        textlabel.setAttribute("for", "captiontextinput");
        textinput.setAttribute("name","captiontextinput");
        textinput.setAttribute("placeholder", "Type your caption here")
        textinput.classList.add('textareainputfield')

        // ass the keyup listener to update the text input
        textinput.addEventListener("keyup", function(){
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value+"text" );
            // updpate the text inside once found
            if(matchingCaption)
            {
                matchingCaption.innerHTML = this.value;
            }
        });


        /**
         * Do the same general idea for the text input on all the input to follow here
         */
        widthlabel.innerHTML = "Width of Caption: ";
        widthlabel.setAttribute("for", "widthinput");
        widthinput.setAttribute("type", "number");
        widthinput.setAttribute("min", '100');
        widthinput.setAttribute("placeholder", '100');
        widthinput.setAttribute("name","widthlabelinput");

        widthinput.addEventListener("change", function() {
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value );
            // updpate the text inside once found
            if(matchingCaption && !isNaN(Number(this.value)))
            {
                matchingCaption.setAttribute("width", Number(this.value));
            }
        });

        heightlabel.innerHTML = "Height of Caption: ";
        heightlabel.setAttribute("for", "widthinput");

        heightinput.setAttribute("type", "number");
        heightinput.setAttribute("min", '150');
        heightinput.setAttribute("placeholder", '150');
        heightinput.setAttribute("name","heightlabelinput");
        heightinput.addEventListener("change", function() {
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value );
            // updpate the text inside once found
            if(matchingCaption && !isNaN(Number(this.value)))
            {
                matchingCaption.setAttribute("height", Number(this.value));
            }
        });

        xcoordlabel.innerHTML = "X Coordinate: ";
        xcoordlabel.setAttribute("for", "widthinput");
        xcoordinput.setAttribute("type", "number");
        xcoordinput.setAttribute("min", '0');
        xcoordinput.setAttribute("placeholder", '0');
        xcoordinput.setAttribute("name","xcoordlabelinput");

        xcoordinput.addEventListener("change", function() {
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value );
            // updpate the text inside once found
            if(matchingCaption && !isNaN(Number(this.value)))
            {
                matchingCaption.setAttribute("x", Number(this.value));
            }
        });
        
        ycoordlabel.innerHTML = "Y Coordinate: ";
        ycoordlabel.setAttribute("for", "ycoordinput");
        ycoordinput.setAttribute("type", "number");
        ycoordinput.setAttribute("min", '0');
        ycoordinput.setAttribute("placeholder", '0');
        ycoordinput.setAttribute("name","ycoordlabelinput");
        
        ycoordinput.addEventListener("change", function() {
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value );
            // updpate the text inside once found
            if(matchingCaption && !isNaN(Number(this.value)))
            {
                matchingCaption.setAttribute("y", Number(this.value));
            }
        });

        captiontextcolorinput.addEventListener("change", function(event){
            updateCaptionTextColor( event.target.value , event.target.attributes.objectid.value);
        });

        captionbackgroundcolorinput.addEventListener("change", function(event){
            updateCaptionBoxColor( event.target.value , event.target.attributes.objectid.value);
        });

        // append all the elements to the tool box
        toolsarea.append( 
            textlabel, document.createElement("br"), textinput,
            document.createElement("br"), widthlabel, document.createElement("br"),
            widthinput, document.createElement("br"), heightlabel, 
            document.createElement("br"), heightinput, document.createElement("br"),
            xcoordlabel, document.createElement("br"), xcoordinput, document.createElement("br"),
            ycoordlabel, document.createElement("br"), ycoordinput, document.createElement("br"), captiontextcolorlabel,
            document.createElement("br"), captiontextcolorinput, document.createElement("br"), captionbackgroundcolorlabel,
            document.createElement("br"), captionbackgroundcolorinput
        );

        // set caption id on all input elements
        toolsarea.childNodes.forEach(element => {
            element.setAttribute("objectid", captionId);
        });

        // append all elements together
        newoptionsbar.append(header, minibtn, deletebtn, layerbtn, toolsarea);
        newoptionsbar.setAttribute("objectid", captionId );

        // finish by appending the whole thing
        dividerObject.insertAdjacentElement("afterend", toolsarea);
        dividerObject.insertAdjacentElement("afterend", newoptionsbar);

        /** Add a caption box in the svg area */
        const textholder = document.createElementNS(NS.svg, "foreignObject");
        textholder.setAttribute("id", captionId);
        textholder.setAttribute("x", "0");
        textholder.setAttribute("y", "0");
        textholder.setAttribute("width", "1500");
        textholder.setAttribute("height", "250");
        textholder.setAttribute("class", "captionObject");

        const text = document.createElement("div");
        text.classList.add('captions')
        text.setAttribute("id", captionId + "text");
        text.setAttribute("x", "0");
        text.setAttribute("y", "0");
        text.setAttribute("width","auto");
        text.setAttribute("height","auto");
        text.setAttribute("fill","red");
        
        text.innerHTML = "This is the caption";

        // finish by adding them to the document
        textholder.appendChild(text)
        svgContainer.appendChild(textholder);

        getObjectCount(1, "caption");
    });
    
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
        newoptionsbar.classList.add("windowoptionsbar");
        newoptionsbar.style.display = "flex";

        header.innerHTML = "Image Layer";

        minibtn.classList.add("windowminimizebtn");
        minibtn.innerHTML = "▲";
        minibtn.addEventListener( "click", function(event) {
            minimizeToolsWindow(event);
        });

        deletebtn.classList.add("windowremovebtn");
        deletebtn.innerHTML = "&times";
        deletebtn.addEventListener( "click", function(event) {
            removeToolsWindow(event);
        });

       /** Dyncamic layer buttoon */
       layerbtn.classList.add("windoworderingbtn");
       layerbtn.innerHTML = "<svg viewBox='0 0 100 100' width='100%' height='100%' style='padding:1px' >"+
                           "<rect x='10' y='10' width='10' height='10' fill='black' rx='5'/>"+
                           "<rect x='30' y='10' width='50' height='10' fill='black' rx='5'/>"+
                           "<rect x='10' y='41' width='10' height='10' fill='black' rx='5'/>"+
                           "<rect x='30' y='41' width='50' height='10' fill='black' rx='5'/>" + 
                           "<rect x='10' y='70' width='10' height='10' fill='black' rx='5'/>"+
                           "<rect x='30' y='70' width='50' height='10' fill='black' rx='5'/></svg>"
                           
       layerbtn.addEventListener("mousedown", function(event) {  
           // capture the start y when the click happens
           oldY = event.pageY;

           layerbtn.addEventListener("mouseup", documentMouseUpListener, layerbtn)
           document.addEventListener("mousemove", getMouseDirection, false);
           // the element to put things above
           try{
               upperObject = (event.target.parentElement.parentElement.previousSibling.previousSibling) ?
               event.target.parentElement.parentElement.previousElementSibling.previousSibling :
               null;    
           }catch{
               upperObject = null;
           }
           // the element to put things below
           try{
               lowerObject = event.target.parentElement.parentElement.nextSibling.nextSibling.nextSibling
           }
           catch{
               lowerObject = null;
           }
           // objects that need to shift
           try{
               shiftObjects = [event.target.parentElement.parentElement, event.target.parentElement.parentElement.nextSibling];
           }catch{
               shiftObjects = null;
           }

           // put dragging stuff here
           document.addEventListener("mousemove", docucmentMouseOverHandler);
       });

       window.addEventListener("mousedown", function(){
           window.addEventListener("mouseup", documentMouseUpListener, layerbtn)
       });
       
       /** End */

        toolsarea.classList.add("imagetoolsbox");
        toolsarea.setAttribute("id", "imagetoolsbox-"+imageId);
        toolsarea.setAttribute("objectid", imageId);
        filelabel.innerHTML = "Choose a file: ";
        filelabel.setAttribute("for", "imageinput");

        fileinput.setAttribute("type", "file");
        fileinput.setAttribute("name", "uploadfile");
        fileinput.setAttribute("id","input"+imageId);
        fileinput.classList.add('fileinputfield')

        let form = document.createElement("form");
        form.setAttribute("runat", "server");
        form.setAttribute("class", "imageform");
        form.setAttribute("method", "post");
        form.setAttribute("enctype", "multipart/form-data");
        form.setAttribute("action", "/api/isis");
        form.appendChild(fileinput);

        // listener for when the user changes the image of the input field
        fileinput.onchange = function(event){
            // use regexp to test the acceptable file types and handle either way
            let imgregexp = new RegExp("^.*\.(png|PNG|jpg|JPG|SVG|svg)");
            let isisregexp = new RegExp("^.*\.(CUB|cub|tif|TIF)");

            if(imgregexp.test(this.value))
            {
                // read a simple image file and display
                if(this.files && this.files[0])
                {
                    var reader = new FileReader();

                    // occurs after readAsDataURL
                    reader.onload = function(e) {
                        // use jquery to update the image source
                        $('#'+imageId).attr('href', e.target.result);
                    }

                    // convert to base64 string
                    reader.readAsDataURL(this.files[0]);
                }
            }
            else if( isisregexp.test(this.value))
            {
                // prevent page default submit
                event.preventDefault();
                // create a form data and request object to call the server
                var fd = new FormData(form);
                var xhr = new XMLHttpRequest();
                
                // when the requests load handle the response
                xhr.onloadend = function(event) {
                    // this is an effective way of recieving the response return
                    console.log(xhr.responseText)
                }

                // open the request and send the data
                xhr.open('POST', "/api/isis", true);
                xhr.send(fd);

                // prevent propigation with non-true return
                return false;
            }
            else{
                alert("File Type Not Supported");
            }
        };

        widthlabel.innerHTML = "Width of Image: ";
        widthlabel.setAttribute("for", "widthinput");
        widthinput.setAttribute("type", "number");
        widthinput.setAttribute("min", '1500');
        widthinput.setAttribute("placeholder", '1500');
        widthinput.setAttribute("name","widthinput");

        widthinput.addEventListener("change", function(){
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value );
            // updpate the text inside once found
            if(matchingCaption && !isNaN(Number(this.value)))
            {
                matchingCaption.setAttribute("width", Number(this.value));
            }
        });

        heightlabel.innerHTML = "Height of Image: ";
        heightlabel.setAttribute("for", "widthinput");

        heightinput.setAttribute("type", "number");
        heightinput.setAttribute("min", '1500');
        heightinput.setAttribute("placeholder", '1500');
        heightinput.setAttribute("name","heightinput");

        heightinput.addEventListener("change", function(){
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value );
            // updpate the text inside once found
            if(matchingCaption && !isNaN(Number(this.value)))
            {
                matchingCaption.setAttribute("height", Number(this.value));
            }
        });
        
        xcoordlabel.innerHTML = "X Coordinate: ";
        xcoordlabel.setAttribute("for", "widthinput");
        xcoordinput.setAttribute("type", "number");
        xcoordinput.setAttribute("min", '0');
        xcoordinput.setAttribute("placeholder", '0');
        xcoordinput.setAttribute("name","xcoordinput");

        xcoordinput.addEventListener("change", function(){
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value );
            // updpate the text inside once found
            if(matchingCaption && !isNaN(Number(this.value)))
            {
                matchingCaption.setAttribute("x", Number(this.value));
            }
        });
        
        ycoordlabel.innerHTML = "Y Coordinate: ";
        ycoordlabel.setAttribute("for", "ycoordinput");

        ycoordinput.setAttribute("type", "number");
        ycoordinput.setAttribute("min", '0');
        ycoordinput.setAttribute("placeholder", '0');
        ycoordinput.setAttribute("name","ycoordinput");

        ycoordinput.addEventListener("change", function(){
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value );
            // updpate the text inside once found
            if(matchingCaption && !isNaN(Number(this.value)))
            {
                matchingCaption.setAttribute("y", Number(this.value));
            }
        });

        let divider2 = document.createElement("h3");
        divider2.classList.add("dividerline");
        divider2.setAttribute("id", "innerdivider");
        divider2.innerHTML = "Icon Tools";
    
        toolsarea.append( 
            filelabel, document.createElement("br"),
            form, document.createElement("br"), widthlabel, document.createElement("br"), 
            widthinput, document.createElement("br"), heightlabel, document.createElement("br"), 
            heightinput, document.createElement("br"), xcoordlabel, document.createElement("br"),
            xcoordinput, document.createElement("br"), ycoordlabel, 
            document.createElement("br"), ycoordinput, document.createElement("br"), divider2
        );

        // set caption id on all input elements
        toolsarea.childNodes.forEach(element => {
            element.setAttribute("objectid", imageId);
        });

        // append all elements together
        newoptionsbar.append(header, minibtn, deletebtn, layerbtn, toolsarea);
        newoptionsbar.setAttribute("objectid", imageId);
    
        // finish by appending the whole thing
        dividerObject.insertAdjacentElement("afterend", toolsarea);
        dividerObject.insertAdjacentElement("afterend", newoptionsbar);

        imagesvg.setAttribute("x", "0");
        imagesvg.setAttribute("y", "0");
        imagesvg.setAttribute("width", "1500");
        imagesvg.setAttribute("height", "1000");
        imagesvg.setAttribute("id", imageId);
        imagesvg.setAttribute("href", "test/moonphasestest.jpg")

        svgContainer.appendChild(imagesvg);

        getObjectCount(1, "image");
    });

    /**
     * @function figsizeselect.onchange
     * @description changes the viewbox setting of the output figure
     */
    $('#figsizeselect').on("change", (event) => {
        let tmp = event.target.value.split("x");
        svgContainer.setAttribute("viewBox", "0 0 " + tmp[0] + ' ' + tmp[1]);
    });

    /**
     * @function backgroundcolor.onchange
     * @description Changes the background color of the editing area.
     * will be visible when exported
     */
    $('#backgroundcolor').on("change", () => {
        setSVGBackground(svgContainer, bgPicker.value)
    });

    /** Annotation buttons */

    /**
     * @function northarrowopt.onmousedown
     * @description this function starts the drag and drop logic for the north icon
     */
    $('#northarrowopt').on("mousedown", (event) => {
        let btn = event.target;

        if( getObjectCount(0,"image") != 0)
        {
            if(selectedObject){
                selectedObject = null;
            }
            else {
                btn.classList.add("selected");
                document.addEventListener("mouseup", setElement);
            }
        }
        else{
            alert("There Must be an image in the figure to attach a North Arrow");
        }
    });
    
    /**
     * @function sunarrowopt.onmousedown
     * @description this function starts the drag and drop logic for the sun icon
     */
    $('#sunarrowopt').on("mousedown", (event) => {
        let btn = event.target;

        if( getObjectCount(0,"image") != 0)
        {
            if(selectedObject){
                selectedObject = null;
            }
            else {
                btn.classList.add("selected");
                document.addEventListener("mouseup", setElement);
            }
        }
        else{
            alert("There Must be an image in the figure to attach a Sun Arrow");
        }
    });
    
    /**
     * @function observerharrowopt.onmousedown
     * @description this function starts the drag and drop logic for observer icon
     */
    $('#observerarrowopt').on("mousedown", (event) => {
        let btn = event.target;

        if( getObjectCount(0,"image") != 0)
        {
            if(selectedObject){
                selectedObject = null;
             }
             else {
                btn.classList.add("selected");
                document.addEventListener("mouseup", setElement);
             }
        }
        else{
            alert("There Must be an image in the figure to attach an Observer Arrow");
        }
    });

}); // end of jquery functions

/* Helper functions */
/**
 * @function setSVGBackground
 * @param {Node} svg 
 * @param {string} color 
 * @description just changes the background of the specified element
 */
function setSVGBackground(svg, color){
    svg.style.background = color;
}

/**
 * @function minimizeToolsWindow
 * @param {_Event} event
 * @description this is used to close and open the tool boxes using the close btn in the optionsbar
 *      this is a general function so if the html of the tool box area changes so does this
 */
function minimizeToolsWindow(event) {
    if(event.target.parentElement.nextElementSibling.classList.contains("closed")){
        event.target.innerHTML = '▲';
        event.target.parentElement.nextElementSibling.classList.remove("closed");
    }
    else{
        event.target.innerHTML = '▼';
        event.target.parentElement.nextElementSibling.classList.add("closed");
    }
}

/**
 * @function: removeToolsWindow
 * @param {_Event} event
 * @desc: This function is used to delete the tools window and options bar from the tool box area
 */
function removeToolsWindow( event )
{
    if(event.target.parentElement.attributes.objectid.value)
    {
        // remove the current options bar, its next child and the caption matching the same id
        let captiontoolsbar = event.target.parentElement;
        let toolsbox = captiontoolsbar.nextElementSibling;
        let captionsvg = document.getElementById(event.target.parentElement.attributes.objectid.value);

        let toolcontainer = document.getElementById('toolcontainer');
        let svgcontainer = document.getElementById('figurecontainer');
        toolcontainer.removeChild(captiontoolsbar); 
        toolcontainer.removeChild(toolsbox); 
        svgcontainer.removeChild(captionsvg);

        try{
            svgcontainer.removeChild(document.getElementById("northIcon-" + captionsvg.id));
        }catch(err){}

        try{
            svgcontainer.removeChild(document.getElementById("sunIcon-" + captionsvg.id));
        }catch(err){}
        
        try{
            svgcontainer.removeChild(document.getElementById("observerIcon-" + captionsvg.id));
        }catch(err){}
        getObjectCount(-1 , typeofObject(captionsvg.id));
    }
}

/**
 * @function randomId
 * @param {string} textareaprefix
 * @description generate a random number and return with prefix
 */
function randomId( textareaprefix )
{
    return textareaprefix + String( Math.floor((Math.random() * 1000) + 1) );
}

/**
 * @function docucmentMouseOverHandler
 * @description handler for when the user wants to drag an element up or down calls the shift functions respectivly
 */
function docucmentMouseOverHandler () {
        if(yDirection == "up") {
            if(shiftObjects && upperObject)
            {
                shiftUp(shiftObjects, upperObject);
            }
        }
        else if(yDirection == "down"){
            if(shiftObjects && lowerObject)
            {
                shiftDown(shiftObjects, lowerObject);
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
function getMouseDirection(e) {

    //deal with the horizontal case
    if (oldX + sensitivity < e.pageX) {
        update = true;
        xDirection = "right";
        oldX = e.pageX;

    } else if(oldX - sensitivity > e.pageX) {
        update = true;
        xDirection = "left";
        oldX = e.pageX;
    }
 
    //deal with the vertical case
    if (oldY + sensitivity < e.pageY) {
        yDirection = "down";
        update = true;
        oldY = e.pageY;

    } else if (oldY - sensitivity > e.pageY) {
        update = true;
        yDirection = "up";
        oldY = e.pageY;
    }
    else{
        yDirection = "";
    }
}

/**
 * @function documentMouseUpListener
 * @description when the mouse is released remove the listeners
 */
function documentMouseUpListener(){
    try{
        document.removeEventListener("mousemove", docucmentMouseOverHandler);
        window.removeEventListener("mouseup", documentMouseUpListener);
        document.removeEventListener("mousemove", getMouseDirection);
    }catch(err)
    {
        console.log("document listener remove failed");
    }

    lowerObject = null;
    upperObject = null;
    shiftObjects = null;
    oldX = 0;
    oldY = 0;
}

/**
 * @function shiftUp
 * @description shift the object up one slot in the tools location
 */
function shiftUp(){
    if(upperObject.getAttribute("objectid") )
    {
        shiftObjects.forEach(domElement => {
            document.getElementById("toolcontainer").insertBefore(domElement, upperObject);
        });
        
        // move up one layer
        moveSvgUp(document.getElementById(shiftObjects[0].attributes.objectid.value));

        lowerObject = null;
        upperObject = null;
        shiftObjects = null;
        yDirection = "";
    }
}

/**
 * @function shiftDown
 * @description shift the object down one slot in the tools location
 */
function shiftDown()
{
    if(lowerObject)
    {
        shiftObjects.reverse().forEach(domElement => {
            lowerObject.insertAdjacentElement("afterend", domElement);
        });

        // move up one layer
        moveSvgDown(document.getElementById(shiftObjects[0].attributes.objectid.value));

        lowerObject = null;
        upperObject = null;
        shiftObjects = null;
        yDirection = "";
    }

}

/**
 * @function moveSvgUp
 * @param {Node} element
 * @description move the svg element up to the top of the layers of the svg
 */
function moveSvgUp( element )
{
    element.nextSibling.insertAdjacentElement("afterend", element);
}

/**
 * @function moveSvgUp
 * @param {Node} element
 * @description move the svg element down to the top of the layers of the svg
 */
function moveSvgDown( element )
{
    document.getElementById("figurecontainer").insertBefore(element, element.previousSibling);
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
    switch(objecttype){
        case "image":
            switch( inc ) {
                case 1: 
                    return ++imageCount;
                case -1:
                    return --imageCount;
                default:
                    return imageCount;
            }
        case "caption":
            switch( inc ) {
                case 1: 
                    return ++captionCount;
                case -1:
                    return --captionCount;
                default:
                    return captionCount;
        
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
    let imagereexp = new RegExp('^image[0-9]*')
    let captionreexp = new RegExp('^caption[0-9]*')

    if(imagereexp.test(testString)){
        return "image";
    }

    if(captionreexp.test(testString)){
        return "caption";
    }
}

/**
 * @function setElement
 * @param {_Event} event 
 * @description set the current element that the mouse dropped over
 */
function setElement( event ) 
{
    let btn = document.getElementsByClassName("selected")[0];
    if(typeofObject(event.target.id) == "image")
    {
        // set element
        selectedObject = event.target;
    }
    else if(btn != event.target)
    {
        alert("CANNOT ADD ICON TO THIS ELEMENT");
    }

    // remove the current listener
    this.removeEventListener("mouseup", setElement)
    btn.classList.remove("selected")

    /* call the drawing function with the type of image that can
     be found fron the btn and on the selectedObject*/
    if(selectedObject){
        let iconType;
        if( btn.id.indexOf("north") > -1)
        {
            iconType = "north";    
        }
        else if(btn.id.indexOf("sun") > -1)
        {
            iconType = "sun";
        }
        else if( btn.id.indexOf("observer") > -1)
        {
            iconType = "observer";
        }
        else
        {
            console.log("Unknown Object ID" + btn.id);
        }
        
        // draw the icon
        drawSvgIcon( selectedObject, iconType, event );

        // after drawing svg icon is finished remove the object
        selectedObject = null;
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
    switch (icontype) {
        case "north":

            svgP = getSVGPoint( event.clientX, event.clientY)

            icongroup = document.getElementById("northgroup").cloneNode(true);
            icongroup.setAttribute("objectid", image.id);
            icongroup.setAttribute("id", "northIcon-" + image.id);
            icongroup.style.scale = "0.5";

            // set the location of the icon to where the mouse was released
            newX = getScaledPoint( svgP.x, Number(icongroup.style.scale), 480 );
            newY = getScaledPoint( svgP.y, Number(icongroup.style.scale), 480 );
    
            icongroup.style.transform = translateString( newX, newY);
            svgContainer.appendChild(icongroup);

            break;
    
        case "sun":
            
            svgP = getSVGPoint(event.clientX, event.clientY)

            icongroup = document.getElementById("sungroup").cloneNode(true);
            icongroup.setAttribute("objectid", image.id);
            icongroup.setAttribute("id", "sunIcon-" + image.id);
            icongroup.style.scale = "0.5";

            newX = getScaledPoint( svgP.x, Number(icongroup.style.scale), 512 );
            newY = getScaledPoint( svgP.y, Number(icongroup.style.scale), 512 );
    
            icongroup.style.transform = translateString( newX, newY);
            svgContainer.appendChild(icongroup);
            break;
    
        case "observer":

            svgP = getSVGPoint(event.clientX, event.clientY)

            icongroup = document.getElementById("observergroup").cloneNode(true);
            icongroup.setAttribute("objectid", image.id);
            icongroup.setAttribute("id", "observerIcon-" + image.id);
            icongroup.style.scale = "0.5";

            svgContainer.appendChild(icongroup);

            newX = getScaledPoint( svgP.x, Number(icongroup.style.scale), 512 );
            newY = getScaledPoint( svgP.y, Number(icongroup.style.scale), 512 );
    
            icongroup.style.transform = translateString( newX, newY);
            break;

        default:
            console.log("UHHH OHH this is wrong")
            break;
    }

    let imagetoolbox = findImageToolbox(selectedObject.id, document.getElementsByClassName("imagetoolsbox"));
    // draw the tool box based on the icon type
    drawToolbox(imagetoolbox, icontype, icongroup.id, newX.toFixed(0), newY.toFixed(0));
}

function getSVGPoint( x, y )
{
    pt = svgContainer.createSVGPoint();

    pt.x = Number(x);
    pt.y = Number(y);

    return pt.matrixTransform(svgContainer.getScreenCTM().inverse());
}

/**
 * @function drawToolbox
 * @param {Node} toolbox 
 * @param {string} icontype 
 * @param {string} iconId
 * @param {string} transX 
 * @param {string} transY
 * @description draws tool boxes for each icon, this method allows for more than 1 of each icon
 */
function drawToolbox(toolbox, icontype, iconId, transX, transY)
{
    switch (icontype) {
        case "north":
            let iconscaleinput = document.createElement("input");
            let iconmaincolorinput = document.createElement("input");
            let iconaccentcolorinput = document.createElement("input");
            let scalelabel = document.createElement("label");
            let maincolorlabel = document.createElement("label");
            let accentcolorlabel = document.createElement("label");
            let icontoolbox = document.createElement("div");
            let iconoptionbar = document.createElement("div");
            let iconoptionheader = document.createElement("h4");
            let deletebtn = document.createElement("button");
            let northicontranslatex = document.createElement("input");
            let northicontranslatexlabel = document.createElement("label");
            let northicontranslatey = document.createElement("input");
            let northicontranslateylabel = document.createElement("label");

            iconoptionbar.setAttribute("class", 'windowoptionsbar');
            iconoptionbar.style.display = "flex";

            iconoptionheader.innerHTML = "North Icon";

            // same for delete as minimize
            deletebtn.classList.add("windowremovebtn");
                deletebtn.innerHTML = "&times";
                deletebtn.addEventListener( "click", function(event) {
                removeIconWindow(event);
            });

            iconoptionbar.append(iconoptionheader, document.createElement("br"), deletebtn);
            iconoptionbar.setAttribute("objectid", iconId);

            iconscaleinput.setAttribute("type", "number");
            iconscaleinput.setAttribute( "objectid", iconId );
            icontoolbox.setAttribute( "objectid", iconId );
            iconscaleinput.setAttribute("step", "0.01");
            iconscaleinput.value = 0.5

            maincolorlabel.innerHTML = "Main Color";
            accentcolorlabel.innerHTML = "Secondary Color";
            scalelabel.innerHTML = "North Scale";

            iconmaincolorinput.setAttribute("type", "color");
            iconmaincolorinput.setAttribute( "objectid", iconId );
            iconmaincolorinput.value = "#ffffff";

            iconaccentcolorinput.setAttribute("type", "color");
            iconaccentcolorinput.setAttribute( "objectid", iconId );
            iconaccentcolorinput.value = "#000000"

            northicontranslatex.setAttribute("type", "number");
            northicontranslatex.setAttribute( "objectid", iconId );
            northicontranslatex.setAttribute( "min", "0" );

            northicontranslatey.setAttribute("type", "number");
            northicontranslatey.setAttribute( "objectid", iconId );
            northicontranslatey.setAttribute( "min", "1" );
            northicontranslatex.value = (transX*0.5);
            northicontranslatey.value = (transY*0.5);

            northicontranslateylabel.innerHTML = "Translate Y Position";
            northicontranslatexlabel.innerHTML = "Translate X Position";

            iconscaleinput.addEventListener("change", updateIconScale)
            iconmaincolorinput.addEventListener("change", function(event){updateIconColor(event, 0)})
            iconaccentcolorinput.addEventListener("change", function(event){updateIconColor(event, 1)})
            
            northicontranslatex.addEventListener("change", function(event){updateIconPosition(event, 0)})
            northicontranslatey.addEventListener("change", function(event){updateIconPosition(event, 1)})

            icontoolbox.classList.add("icontoolbox");

            icontoolbox.append( scalelabel, document.createElement("br"), iconscaleinput, document.createElement("br"),
            maincolorlabel, document.createElement("br"), iconmaincolorinput, document.createElement("br"),
            accentcolorlabel, document.createElement("br"), iconaccentcolorinput, document.createElement("br"), northicontranslatexlabel,
            document.createElement("br"), northicontranslatex, document.createElement("br"), northicontranslateylabel,
            document.createElement("br"), northicontranslatey );
        
            toolbox.append(iconoptionbar,icontoolbox);
            break;
    
        case "sun":
            let suniconscaleinput = document.createElement("input");
            let suniconmaincolorinput = document.createElement("input");
            let suniconaccentcolorinput = document.createElement("input");
            let sunscalelabel = document.createElement("label");
            let sunmaincolorlabel = document.createElement("label");
            let sunaccentcolorlabel = document.createElement("label");
            let sunicontoolbox = document.createElement("div");
            let sunoptionbar = document.createElement("div");
            let sunoptionheader = document.createElement("h4");
            let deletebtn1 = document.createElement("button");
            let sunicontranslatex = document.createElement("input");
            let sunicontranslatexlabel = document.createElement("label");
            let sunicontranslatey = document.createElement("input");
            let sunicontranslateylabel = document.createElement("label");

            sunoptionbar.setAttribute("class", 'windowoptionsbar');
            sunoptionbar.style.display = "flex";

            sunoptionheader.innerHTML = "Sun Icon";

            // same for delete as minimize
            deletebtn1.classList.add("windowremovebtn");
                deletebtn1.innerHTML = "&times";
                deletebtn1.addEventListener( "click", function(event) {
                removeIconWindow(event);
            });

            sunicontranslatex.setAttribute("type", "number");
            sunicontranslatex.setAttribute( "objectid", iconId );
            sunicontranslatex.setAttribute( "min", "0" );

            sunicontranslatey.setAttribute("type", "number");
            sunicontranslatey.setAttribute( "objectid", iconId );
            sunicontranslatey.setAttribute( "min", "1" );

            sunicontranslateylabel.innerHTML = "Translate Y Position";
            sunicontranslatexlabel.innerHTML = "Translate X Position";

            sunoptionbar.append(sunoptionheader, document.createElement("br"), deletebtn1);
            sunoptionbar.setAttribute("objectid", iconId);

            suniconscaleinput.setAttribute("type", "number");
            suniconscaleinput.setAttribute( "objectid", iconId );
            suniconscaleinput.value = "0.5";
            suniconscaleinput.setAttribute("step", "0.01")

            sunmaincolorlabel.innerHTML = "Sun Main Color";
            sunaccentcolorlabel.innerHTML = "Sun Secondary Color";
            sunscalelabel.innerHTML = "Sun Scale";
               
            sunicontranslatex.value = (transX*0.5);
            sunicontranslatey.value = (transY*0.5);

            suniconmaincolorinput.setAttribute("type", "color");
            suniconmaincolorinput.setAttribute( "objectid", iconId );
            suniconmaincolorinput.value = "#ffffff";

            suniconaccentcolorinput.setAttribute("type", "color");
            suniconaccentcolorinput.setAttribute( "objectid", iconId );
            suniconaccentcolorinput.value = "#000000";

            suniconscaleinput.addEventListener("change", updateIconScale)
            suniconmaincolorinput.addEventListener("change", function(event){updateIconColor(event, 0)})
            suniconaccentcolorinput.addEventListener("change", function(event){updateIconColor(event, 1)})

            sunicontranslatex.addEventListener("change", function(event){updateIconPosition(event, 0)})
            sunicontranslatey.addEventListener("change", function(event){updateIconPosition(event, 1)})

            sunicontoolbox.classList.add("icontoolbox");

            sunicontoolbox.append( sunscalelabel, document.createElement("br"), suniconscaleinput, document.createElement("br"),
            sunmaincolorlabel, document.createElement("br"), suniconmaincolorinput, document.createElement("br"),
            sunaccentcolorlabel, document.createElement("br"), suniconaccentcolorinput, document.createElement("br"), sunicontranslatexlabel, document.createElement("br"),
            sunicontranslatex, document.createElement("br"), sunicontranslateylabel, document.createElement("br"), sunicontranslatey );

            toolbox.append(sunoptionbar, sunicontoolbox);
            break;
    
        case "observer":
            let obsiconscaleinput = document.createElement("input");
            let obsiconmaincolorinput = document.createElement("input");
            let obsiconaccentcolorinput = document.createElement("input");
            let obsscalelabel = document.createElement("label");
            let obsmaincolorlabel = document.createElement("label");
            let obsaccentcolorlabel = document.createElement("label");
            let obsicontoolbox = document.createElement("div");
            let obsoptionbar = document.createElement("div");
            let obsoptionheader = document.createElement("h4");
            let deletebtn2 = document.createElement("button");
            let obsicontranslatex = document.createElement("input");
            let obsicontranslatexlabel = document.createElement("label");
            let obsicontranslatey = document.createElement("input");
            let obsicontranslateylabel = document.createElement("label");

            obsoptionbar.setAttribute("class", 'windowoptionsbar');
            obsoptionbar.style.display = "flex";

            obsoptionheader.innerHTML = "Observer Icon";

            // same for delete as minimize
            deletebtn2.classList.add("windowremovebtn");
            deletebtn2.innerHTML = "&times";
            deletebtn2.addEventListener( "click", function(event) {
                removeIconWindow(event);
            });

            obsicontranslatex.setAttribute("type", "number");
            obsicontranslatex.setAttribute( "objectid", iconId );
            obsicontranslatex.setAttribute( "min", "0" );

            obsicontranslatey.setAttribute("type", "number");
            obsicontranslatey.setAttribute( "objectid", iconId );
            obsicontranslatey.setAttribute( "min", "1" );

            obsicontranslateylabel.innerHTML = "Translate Y Position";
            obsicontranslatexlabel.innerHTML = "Translate X Position";

            obsoptionbar.append(obsoptionheader, document.createElement("br"), deletebtn2);
            obsoptionbar.setAttribute("objectid", iconId);

            obsiconscaleinput.setAttribute("type", "number");
            obsiconscaleinput.setAttribute( "objectid", iconId );
            obsiconscaleinput.setAttribute("step", "0.01");
            obsiconscaleinput.setAttribute("value", "1.00");
            obsiconscaleinput.setAttribute("min", "0.25");

            obsicontranslatex.value = (transX*0.5);
            obsicontranslatey.value = (transY*0.5);

            obsmaincolorlabel.innerHTML = "Observer Main Color";
            obsaccentcolorlabel.innerHTML = "Observer Secondary Color";
            obsscalelabel.innerHTML = "Observer Scale";

            obsiconmaincolorinput.setAttribute("type", "color");
            obsiconmaincolorinput.setAttribute( "objectid", iconId );
            obsiconmaincolorinput.value = "#000000"

            obsiconaccentcolorinput.setAttribute("type", "color");
            obsiconaccentcolorinput.setAttribute( "objectid", iconId );
            obsiconaccentcolorinput.value = "#ffffff"

            obsiconscaleinput.addEventListener("change", updateIconScale)
            obsiconmaincolorinput.addEventListener("change", function(event){updateIconColor(event, 0)})
            obsiconaccentcolorinput.addEventListener("change", function(event){updateIconColor(event, 1)})

            obsicontranslatex.addEventListener("change", function(event){updateIconPosition(event, 0)})
            obsicontranslatey.addEventListener("change", function(event){updateIconPosition(event, 1)})

            obsicontoolbox.classList.add("icontoolbox");

            obsicontoolbox.append( obsscalelabel, document.createElement("br"), obsiconscaleinput, document.createElement("br"),
            obsmaincolorlabel, document.createElement("br"), obsiconmaincolorinput, document.createElement("br"),
            obsaccentcolorlabel, document.createElement("br"), obsiconaccentcolorinput, document.createElement("br"), obsicontranslatexlabel, 
            document.createElement("br"), obsicontranslatex, document.createElement("br"), obsicontranslateylabel, 
            document.createElement("br"), obsicontranslatey );
        
            toolbox.append(obsoptionbar, obsicontoolbox);
            break;

        default:
            console.log("UHHH OHH this is wrong");
            break;
    }
}

function updateIconPosition(event, attrId)
{
    let object = document.getElementById(event.target.attributes.objectid.value);
    if( attrId == 0 ) {

        object.style.transform = updateTranslate(object.style.transform, "x", Number(event.target.value), object.style.scale);
    }
    else if( attrId == 1 )
    {
        object.style.transform = updateTranslate(object.style.transform, "y", Number(event.target.value), object.style.scale);
    }
}

function getWidth ( bbox )
{
    return bbox.width * bbox.scale;
}

function getHeight ( bbox )
{
    return bbox.height * bbox.scale;
}

function updateTranslate ( translateStr, attr, value, scale )
{
    // quick fix for unknown javascript 0px error that changes the transform string
    value = (value == 0) ? 1 : value;

    if( attr == "x" )
    {
        let y = parseInt(translateStr.split(",")[1]);

        return String("translate("+ value/scale+"px,"+y+"px");
    }
    else if( attr == "y" )
    {
        let x = parseInt(translateStr.split("translate(")[1].split(",")[0]);

        return String("translate("+ x + "px," + value/scale + "px")
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
    for(index in array){
        if(array[index].attributes.objectid.value == id){
            return array[index];
        }
    }
}

/**
 * @function updateIconScale
 * @param {_Event} event 
 * @description change the scale of the icon at the target
 */
function updateIconScale( event )
{
    let icon = document.getElementById(event.target.attributes.objectid.value);

    let inputvalue = Number(event.target.value);
    if( !isNaN(inputvalue) )
    {
        icon.style.scale = inputvalue;
    }
}


/**
 * @function removeIconWindow
 * @param {_Event} event 
 * @description remove the icon tool box and the icon svg element
 */
function removeIconWindow( event )
{
    if(event.target.parentElement.attributes.objectid.value)
    {
        // remove the current options bar, its next child and the caption matching the same id
        let icontoolsbar = event.target.parentElement;
        let toolsbox = icontoolsbar.nextElementSibling;
        let iconsvg = document.getElementById(icontoolsbar.attributes.objectid.value);

        let imagetoolbox = document.getElementById("imagetoolsbox-"+iconsvg.attributes.objectid.value);

        imagetoolbox.removeChild(icontoolsbar); 
        imagetoolbox.removeChild(toolsbox); 
        svgContainer.removeChild(iconsvg);

    }
}

/**
 * @function updateIconColor
 * @param {_Event} event 
 * @param {string} colorid
 * @description update the color of the object at the target
 */
function updateIconColor( event , colorid)
{
    let icon = document.getElementById(event.target.attributes.objectid.value);

    let inputvalue = event.target.value;

    switch(colorid){
        case 0:
            changeIconColor(colorid, inputvalue, icon);
            break;
        case 1:
            changeIconColor(colorid, inputvalue, icon);
            break;
    }
}

/**
 * @function changeIconColor
 * @param {number} colorid 
 * @param {string} colorval 
 * @param {Object} icon 
 */
function changeIconColor( colorid, colorval, icon)
{
    switch(colorid){
        case 0:
            // change main color
            if(icon.id.indexOf("north") > -1 )
            {
                // change all three children of the north icon
                changeColorsOfChildren(icon.childNodes, colorval, "fill", "fill");
            }
            else if(icon.id.indexOf("sun") > -1 )
            {
                // change the primary of the sun icon
                changeColorsOfChildren(icon.childNodes, colorval, "stroke", "fill");

            }
            else if(icon.id.indexOf("observer") > -1 )
            {
                // change the primary of the observer icon
                changeColorsOfChildren(icon.childNodes, colorval, "fill", "fill", "fill", "fill", "fill", "fill");
            }

            break;
        case 1:
            // change secondary color
            icon.childNodes.forEach(el => {
                if(icon.id.indexOf("north") > -1 )
                {
                    // change the secondary of the north icon
                    changeColorsOfChildren(icon.childNodes, colorval, "stroke", "stroke");
                }
                else if(icon.id.indexOf("sun") > -1 )
                {
                    // change the secondary of the sun icon
                    changeColorsOfChildren(icon.childNodes, colorval, "fill", "stroke");
                }
                else if(icon.id.indexOf("observer") > -1 )
                {
                    // change the secondary of the observer icon
                    changeColorsOfChildren(icon.childNodes, colorval, "stroke", "stroke", "stroke", "stroke", "stroke", "stroke");
                }
            });
            break;    
    }
}

function changeColorsOfChildren( children, color , ...order )
{
    for (let index = 0; index < children.length; index++) {
        const element = children[index];
        const commandArr = order[index].split(" ");

        commandArr.forEach(attribute => {
            if(attribute != "")
            {
                element.setAttribute(attribute.trim(), color);
            }
        });
    }
}


function changeButtonActivation( code )
{
    if(code == "enable")
    {
        document.getElementById("northarrowopt").classList.remove("disabled");
        document.getElementById("observerarrowopt").classList.remove("disabled");
        document.getElementById("sunarrowopt").classList.remove("disabled");
        document.getElementById("outlinebtnopt").classList.remove("disabled");
    }
    else if(code == "disable")
    {
        document.getElementById("northarrowopt").classList.add("disabled");
        document.getElementById("observerarrowopt").classList.add("disabled");
        document.getElementById("sunarrowopt").classList.add("disabled");
        document.getElementById("outlinebtnopt").classList.add("disabled");
    }
    
}

/**
 * @function translateString
 * @param {number} x 
 * @param {number} y 
 * @description returns a string for of the x,y point as a translate() command
 */
function translateString(x, y) {
    return "translate("+ Number(x).toFixed(0)+"px,"+Number(y).toFixed(0)+"px)"
}

/**
 * @function getScaledPoint
 * @param {number} p 
 * @param {number} scale 
 * @param {number} objectWidth 
 * @description move the point over half the scaled width and then divide by the scale again 
 */
function getScaledPoint( p, scale, objectDim) {
    return (p-(objectDim*scale)/2)/scale;
}

function updateCaptionTextColor ( color, objectid )
{
    document.getElementById(objectid).firstChild.style.color = color;
}

function updateCaptionBoxColor ( color, objectid )
{
    document.getElementById(objectid).firstChild.style.background = color;
}