// GLOABALS
// only used to track which menu item is being moved and where it should move to
var shiftObjects, lowerObject, upperObject = null;

// start of jquery function
$(document).ready(()=>{
    // jquery scope variables
    var svg = document.getElementById("figurecontainer"),
        bgpicker = document.getElementById("backgroundcolor"),
        divider = document.getElementById("tooldivider");
    
    // Namespaces for svg ele
    var NS = {xhtml:"http://www.w3.org/1999/xhtml",
                svg: "http://www.w3.org/2000/svg"};

    // set background right away when page loads
    setSVGBackground(svg, bgpicker.value);

    /* Show and hide contents of the tool windows works generically so we can add more later */
    $('button.windowminimizebtn').click(function(event) {
        minimizeToolsWindow(event);
    });
    
    // close tools window if the title bar is clicked
    $(".windowoptionsbar").on("click", function(event) {
        let btn = event.target.lastElementChild;
        if( btn ){
            btn.click();
        }
    });

    /** simple redirect for when the user clicks the usgs atrogeology in the footer */
    $('.rightfooter').click(() => {
        window.open("https://www.usgs.gov/centers/astrogeology-science-center", '_blank');
    });

    /** handler for the whole tool window mini button */
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

    /** handler for button to add caption to svg */
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
            textlabel = document.createElement("label");

        toolsarea.classList.add("captiontoolsbox");
        toolsarea.setAttribute("objectid", captionId);
        textlabel.innerHTML = "Caption Text:  ";
        textlabel.setAttribute("for", "captiontextinput");
        textinput.setAttribute("name","captiontextinput");
        textinput.setAttribute("placeholder", "Type your caption here")
        textinput.classList.add('textareainputfield')

        textinput.addEventListener("keyup", function(){
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value+"text" );
            // updpate the text inside once found
            if(matchingCaption)
            {
                matchingCaption.innerHTML = this.value;
            }
        });

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

        // append all the elements to the tool box
        toolsarea.append( 
            textlabel, document.createElement("br"), textinput,
            document.createElement("br"), widthlabel, document.createElement("br"),
            widthinput, document.createElement("br"), heightlabel, 
            document.createElement("br"), heightinput, document.createElement("br"),
            xcoordlabel, document.createElement("br"), xcoordinput, document.createElement("br"),
            ycoordlabel, document.createElement("br"), ycoordinput 
        );

        // set caption id on all input elements
        toolsarea.childNodes.forEach(element => {
            element.setAttribute("objectid", captionId);
        });

        // append all elements together
        newoptionsbar.append(header, minibtn, deletebtn, layerbtn, toolsarea);
        newoptionsbar.setAttribute("objectid", captionId );

        // finish by appending the whole thing
        divider.insertAdjacentElement("afterend", toolsarea);
        divider.insertAdjacentElement("afterend", newoptionsbar);

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
        svg.appendChild(textholder);
    });
    
    /** handler for adding anothe image to the svg */
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
            let imgregexp = new RegExp("^.*\.(png|PNG|jpg|JPG|SVG|svg)");
            let isisregexp = new RegExp("^.*\.(CUB|cub|tif|TIF)");

            if(imgregexp.test(this.value))
            {
                if(this.files && this.files[0])
                {
                    var reader = new FileReader();

                    // occurs after readAsDataURL
                    reader.onload = function(e) {
                    $('#'+imageId).attr('href', e.target.result);
                    }
                    
                    reader.readAsDataURL(this.files[0]); // convert to base64 string
                }
            }
            else if( isisregexp.test(this.value))
            {
                //TODO: send a very large file over to the node server
                console.log("SEND IMG TO SERVER AND RECIEVE OMTHING BACK");
                form.submit();
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
                // TODO: type check here and everywhere else that is similar
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

    
        toolsarea.append( 
            filelabel, document.createElement("br"),
            form, document.createElement("br"), widthlabel, document.createElement("br"), 
            widthinput, document.createElement("br"), heightlabel, document.createElement("br"), 
            heightinput, document.createElement("br"), xcoordlabel, document.createElement("br"),
            xcoordinput, document.createElement("br"), ycoordlabel, 
            document.createElement("br"), ycoordinput, document.createElement("br")
        );


        // set caption id on all input elements
        toolsarea.childNodes.forEach(element => {
            element.setAttribute("objectid", imageId);
        });

        // append all elements together
        newoptionsbar.append(header, minibtn, deletebtn, layerbtn, toolsarea);
        newoptionsbar.setAttribute("objectid", imageId);
    
        // finish by appending the whole thing
        divider.insertAdjacentElement("afterend", toolsarea);
        divider.insertAdjacentElement("afterend", newoptionsbar);

        imagesvg.setAttribute("x", "0");
        imagesvg.setAttribute("y", "0");
        imagesvg.setAttribute("width", "1500");
        imagesvg.setAttribute("height", "1000");
        imagesvg.setAttribute("id", imageId);
        imagesvg.setAttribute("href", "test/moonphasestest.jpg")

        svg.appendChild(imagesvg);
    });


    // TODO: need to finish changing the svg boxes and stuff when these are changed
    $('#figsizeselect').on("change", (event) => {
        let tmp = event.target.value.split("x");
        svg.setAttribute("viewBox", "0 0 " + tmp[0] + ' ' + tmp[1]);
    });

    /**
     * Changes the background color of the editing area.
     * will be visible when exported
     */
    $('#backgroundcolor').on("change", () => {
        setSVGBackground(svg, bgpicker.value)
    });

    /** Annotation buttons */

    // TODO: add the north arrow stuff here
    $('#northarrowopt').on("mouseup", (event) => {
        let checkbox = event.target;

        console.log("ADD AND REMOVE NORTH ICON")
    });
    
    // TODO: add sun azimuthal stuff here
    $('#sunarrowopt').on("mouseup", (event) => {
        let checkbox = event.target;

        console.log("ADD AND REMOVE SUN ICON")
    });
    
    // TODO: add observer stuff here
    $('#observerarrowopt').on("mouseup", (event) => {
        let observer = event.target;

        console.log("ADD AND REMOVE OBSERVER ICON")
    });

}); // end of jquery functions


/* Helper functions */

/**
 * TODO:
 */
function setSVGBackground(svg, color){
    svg.style.background = color;
}

/**
 * Function: minimizeToolsWindow
 * Desc: this is used to close and open the tool boxes using the close btn in the optionsbar
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
 * Function: removeToolsWindow
 * Desc: This function is used to delete the tools window and options bar from the tool box area
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
    }
}

/**
 * TODO:
 */
function randomId( textareafix )
{
    return textareafix + String( Math.floor((Math.random() * 1000) + 1) );
}

/**
 * TODO:
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
 * TODO:
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
 * TODO:
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
 * TODO:
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
 * TODO:
 */
function shiftDown(){
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
 * TODO:
 * @param {*} element 
 */
function moveSvgUp( element ){
    element.nextSibling.insertAdjacentElement("afterend", element);
}
/**
 * TODO:
 * @param {*} element 
 */
function moveSvgDown( element ){
    document.getElementById("figurecontainer").insertBefore(element, element.previousSibling);
}
