var shiftObjects, lowerObject, upperObject = null;
// start of jquery function
$(document).ready(()=>{
    // variables for basic js functions
    var svg = document.getElementById("figurecontainer");
    var bgpicker = document.getElementById("backgroundcolor");
    var edittoolsbox = document.getElementById("edittoolsbox");
    var filetoolsbox = document.getElementById("toolcontainer");
    var divider = document.getElementById("tooldivider");
    
    var NS = {xhtml:"http://www.w3.org/1999/xhtml",
                svg: "http://www.w3.org/2000/svg"};


    // set background right away when page loads
    setSVGBackground(svg, bgpicker.value);

    /* Show and hide contents of the tool windows works generically so we can add more later */
    $('button.windowminimizebtn').click((event) => {
        minimizeToolsWindow(event);
    });
    
    // close tools window if the title bar is clicked
    $(".windowoptionsbar").on("click", (event) => {
        let btn = event.target.lastElementChild;
        if( btn ){
            btn.click();
        }
    });

    /** simple redirect for when the user clicks the usgs atrogeology in the footer */
    $('.rightfooter').click(() => {
        window.open("https://www.usgs.gov/centers/astrogeology-science-center", '_blank');
    });

    // TODO: fix the transition issues happening with this now
    $('button.toolboxminimizebtn').click((event) => {
        let toolbox = document.getElementById('toolbox'),
            imgbtn = document.getElementById('addimagebtn'),
            capbtn = document.getElementById('addcaptionbtn');

        if( toolbox.classList.contains('closed') ){
            toolbox.classList.remove('closed');
            // reactivate the other buttons
            imgbtn.classList.remove("disabled");
            capbtn.classList.remove("disabled");
            event.target.innerHTML = "◄";
        }
        else{
            toolbox.classList.add('closed');
            // disable the other buttons
            imgbtn.classList.add("disabled");
            capbtn.classList.add("disabled");
            event.target.innerHTML = "►";
        }
    });

    // TODO: fix the transition issues happening with this now
    $('button.toolboxaddcaptionbtn').click((event) => {

        // used for identifying the tool box for each caption in the image 
        let captionId = randomId("caption");

        let newoptionsbar = document.createElement("div");

        newoptionsbar.classList.add("windowoptionsbar");
        newoptionsbar.style.display = "flex";

        let header = document.createElement("h4");
        header.innerHTML = "Caption Layer";
        header.style.margin = "0";

        let minibtn = document.createElement("button");
        minibtn.classList.add("windowminimizebtn");
        minibtn.innerHTML = "▲";
        minibtn.addEventListener( "click", function(event) {
            minimizeToolsWindow(event);
        });

        
        let deletebtn = document.createElement("button");
        deletebtn.classList.add("windowremovebtn");
        deletebtn.innerHTML = "&times";
        deletebtn.addEventListener( "click", function(event) {
            removeToolsWindow(event);
        });


        /** Dyncamic layer buttoon */
        let layerbtn = document.createElement("button");
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
                
            }catch(err){
                upperObject = null;
            }
            
            // the element to put things below
            try{
                lowerObject = event.target.parentElement.parentElement.nextSibling.nextSibling.nextSibling
            }
            catch(err){
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

        window.addEventListener("mousedown", function(event){
            window.addEventListener("mouseup", documentMouseUpListener, layerbtn)
        });
        
        /** End */


        let toolsarea = document.createElement("div")
        toolsarea.classList.add("captiontoolsbox");
        toolsarea.setAttribute("objectid", captionId);

        let textlabel = document.createElement("label");
        textlabel.innerHTML = "Caption Text:  ";
        textlabel.setAttribute("for", "captiontextinput");

        let textinput = document.createElement("textarea");
        textinput.setAttribute("name","captiontextinput");
        textinput.setAttribute("placeholder", "Type your caption here")
        textinput.classList.add('textareainputfield')

        textinput.addEventListener("keyup", function(event){

            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value+"text" );
            // updpate the text inside once found
            if(matchingCaption)
            {
                matchingCaption.innerHTML = this.value;
            }
        });

        let widthlabel = document.createElement("label");
        widthlabel.innerHTML = "Width of Caption: ";
        widthlabel.setAttribute("for", "widthinput");

        let widthinput = document.createElement("input");
        widthinput.setAttribute("type", "number");
        widthinput.setAttribute("min", '100');
        widthinput.setAttribute("placeholder", '100');
        widthinput.setAttribute("name","widthinput");
        widthinput.addEventListener("change", function(event){
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value );
            // updpate the text inside once found
            if(matchingCaption)
            {
                matchingCaption.setAttribute("width", this.value);
            }
        });

        let heightlabel = document.createElement("label");
        heightlabel.innerHTML = "Height of Caption: ";
        heightlabel.setAttribute("for", "widthinput");

        let heightinput = document.createElement("input");
        heightinput.setAttribute("type", "number");
        heightinput.setAttribute("min", '150');
        heightinput.setAttribute("placeholder", '150');
        heightinput.setAttribute("name","widthinput");
        heightinput.addEventListener("change", function(event){
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value );
            // updpate the text inside once found
            if(matchingCaption)
            {
                matchingCaption.setAttribute("height", this.value);
            }
        });


        let xcoordlabel = document.createElement("label");
        xcoordlabel.innerHTML = "X Coordinate: ";
        xcoordlabel.setAttribute("for", "widthinput");

        let xcoordinput = document.createElement("input");
        xcoordinput.setAttribute("type", "number");
        xcoordinput.setAttribute("min", '0');
        xcoordinput.setAttribute("placeholder", '0');
        xcoordinput.setAttribute("name","xcoordinput");

        xcoordinput.addEventListener("change", function(event){
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value );
            // updpate the text inside once found
            if(matchingCaption)
            {
                matchingCaption.setAttribute("x", this.value);
            }
        });
        
        let ycoordlabel = document.createElement("label");
        ycoordlabel.innerHTML = "Y Coordinate: ";
        ycoordlabel.setAttribute("for", "ycoordinput");

        let ycoordinput = document.createElement("input");
        ycoordinput.setAttribute("type", "number");
        ycoordinput.setAttribute("min", '0');
        ycoordinput.setAttribute("placeholder", '0');
        ycoordinput.setAttribute("name","ycoorinput");

        ycoordinput.addEventListener("change", function(event){
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value );
            // updpate the text inside once found
            if(matchingCaption)
            {
                matchingCaption.setAttribute("y", this.value);
            }
        });

        toolsarea.append( textlabel, document.createElement("br"), textinput,
        document.createElement("br"), widthlabel, document.createElement("br"),
        widthinput, document.createElement("br"), heightlabel, 
        document.createElement("br"), heightinput, document.createElement("br"),
        xcoordlabel, document.createElement("br"), xcoordinput, document.createElement("br"),
        ycoordlabel, document.createElement("br"), ycoordinput );

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
        textholder.setAttribute("width", "100%");
        textholder.setAttribute("height", "250");

        const text = document.createElement("div");
        text.classList.add('captions')
        text.setAttribute("id", captionId + "text");
        text.setAttribute("x", "0");
        text.setAttribute("y", "0");
        text.setAttribute("width","auto");
        text.setAttribute("height","auto");
        text.setAttribute("fill","red");
        
        text.innerHTML = "This is the caption";

        textholder.appendChild(text)

        svg.appendChild(textholder);
    });
    
    // TODO: fix the transition issues happening with this now
    $('button.toolboxaddimagebtn').click((event) => {

        // used for identifying the tool box for each caption in the image 
        let imageId = randomId("image");
        
        let newoptionsbar = document.createElement("div");

        newoptionsbar.classList.add("windowoptionsbar");
        newoptionsbar.style.display = "flex";

        let header = document.createElement("h4");
        header.innerHTML = "Image Layer";
        header.style.margin = "0";

        let minibtn = document.createElement("button");
        minibtn.classList.add("windowminimizebtn");
        minibtn.innerHTML = "▲";
        minibtn.addEventListener( "click", function(event) {
            minimizeToolsWindow(event);
        });

        let deletebtn = document.createElement("button");
        deletebtn.classList.add("windowremovebtn");
        deletebtn.innerHTML = "&times";
        deletebtn.addEventListener( "click", function(event) {
            removeToolsWindow(event);
        });

        /** Dyncamic layer buttoon */
        let layerbtn = document.createElement("button");
        layerbtn.classList.add("windoworderingbtn");
        layerbtn.innerHTML = "<svg viewBox='0 0 100 100' width='100%' height='100%' style='padding:1px'>"+
                            "<rect x='10' y='10' width='10' height='10' fill='black' rx='5'/>"+
                            "<rect x='30' y='10' width='50' height='10' fill='black' rx='5'/>"+
                            "<rect x='10' y='41' width='10' height='10' fill='black' rx='5'/>"+
                            "<rect x='30' y='41' width='50' height='10' fill='black' rx='5'/>" + 
                            "<rect x='10' y='70' width='10' height='10' fill='black' rx='5'/>"+
                            "<rect x='30' y='70' width='50' height='10' fill='black' rx='5'/></svg>"
                            
        layerbtn.addEventListener("mousedown", function(event) {
           
            layerbtn.addEventListener("mouseup", documentMouseUpListener, layerbtn)
            // the element to put things above
            try{
                upperObject = (event.target.parentElement.parentElement.previousSibling.objectid) ?
                event.target.parentElement.parentElement.previousElementSibling.previousSibling :
                null; 
                console.log("UPPER: ");
                console.log(event.target.parentElement.parentElement.previousSibling)
            }catch(err){
                upperObject = null;
            }
            
            // the element to put things below
            try{
                lowerObject = event.target.parentElement.parentElement.nextSibling.nextSibling.nextSibling
            }
            catch(err){
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

        window.addEventListener("mousedown", function(event){
            window.addEventListener("mouseup", documentMouseUpListener, layerbtn)
        });
        
        /** End */

        let toolsarea = document.createElement("div")
        toolsarea.classList.add("imagetoolsbox");

        let filelabel = document.createElement("label");
        filelabel.innerHTML = "Choose a file: ";
        filelabel.setAttribute("for", "imageinput");

        let fileinput = document.createElement("input");
        fileinput.setAttribute("type", "file");
        fileinput.setAttribute("name","imageinput");
        fileinput.classList.add('fileinputfield')

        // TODO: add an event listener here for the file input field

        let widthlabel = document.createElement("label");
        widthlabel.innerHTML = "Width of Image: ";
        widthlabel.setAttribute("for", "widthinput");

        let widthinput = document.createElement("input");
        widthinput.setAttribute("type", "number");
        widthinput.setAttribute("min", '1500');
        widthinput.setAttribute("placeholder", '1500');
        widthinput.setAttribute("name","widthinput");

        widthinput.addEventListener("change", function(event){
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value );
            // updpate the text inside once found
            if(matchingCaption)
            {
                matchingCaption.setAttribute("width", this.value);
            }
        });

        let heightlabel = document.createElement("label");
        heightlabel.innerHTML = "Height of Image: ";
        heightlabel.setAttribute("for", "widthinput");

        let heightinput = document.createElement("input");
        heightinput.setAttribute("type", "number");
        heightinput.setAttribute("min", '1500');
        heightinput.setAttribute("placeholder", '1500');
        heightinput.setAttribute("name","widthinput");

        heightinput.addEventListener("change", function(event){
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value );
            // updpate the text inside once found
            if(matchingCaption)
            {
                matchingCaption.setAttribute("height", this.value);
            }
        });

        let xcoordlabel = document.createElement("label");
        xcoordlabel.innerHTML = "X Coordinate: ";
        xcoordlabel.setAttribute("for", "widthinput");

        let xcoordinput = document.createElement("input");
        xcoordinput.setAttribute("type", "number");
        xcoordinput.setAttribute("min", '0');
        xcoordinput.setAttribute("placeholder", '0');
        xcoordinput.setAttribute("name","xcoordinput");

        xcoordinput.addEventListener("change", function(event){
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value );
            // updpate the text inside once found
            if(matchingCaption)
            {
                matchingCaption.setAttribute("x", this.value);
            }
        });
        
        let ycoordlabel = document.createElement("label");
        ycoordlabel.innerHTML = "Y Coordinate: ";
        ycoordlabel.setAttribute("for", "ycoordinput");

        let ycoordinput = document.createElement("input");
        ycoordinput.setAttribute("type", "number");
        ycoordinput.setAttribute("min", '0');
        ycoordinput.setAttribute("placeholder", '0');
        ycoordinput.setAttribute("name","ycoorinput");

        ycoordinput.addEventListener("change", function(event){
            // find the matching html caption element
            let matchingCaption = document.getElementById( this.attributes.objectid.value );
            // updpate the text inside once found
            if(matchingCaption)
            {
                matchingCaption.setAttribute("y", this.value);
            }
        });

        toolsarea.append( filelabel, document.createElement("br"),
         fileinput, document.createElement("br"), widthlabel, document.createElement("br"), 
         widthinput, document.createElement("br"), heightlabel, document.createElement("br"), 
         heightinput, document.createElement("br"), xcoordlabel, document.createElement("br"),
         xcoordinput, document.createElement("br"), ycoordlabel, 
         document.createElement("br"), ycoordinput, document.createElement("br") );

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

        let imagesvg = document.createElementNS(NS.svg, "image")
        imagesvg.setAttribute("x", "0");
        imagesvg.setAttribute("y", "0");
        imagesvg.setAttribute("width", "1500px");
        imagesvg.setAttribute("height", "1000px");
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

    // close the tabs you dont want
    edittoolsbox.previousElementSibling.lastElementChild.click();

}); // end of jquery functions


/* Helper functions */
function setSVGBackground(svg, color){
    svg.style.background = color;
}

function minimizeToolsWindow(event) {
    if(event.target.parentElement.nextElementSibling.style.height == '0%'){
        event.target.parentElement.nextElementSibling.style.height = event.target.parentElement.nextElementSibling.style.maxHeight;
        event.target.innerHTML = '▲';
    }
    else{
        event.target.parentElement.nextElementSibling.style.height = '0%';
        event.target.innerHTML = '▼';
    }
}

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

function randomId( textareafix )
{
    return textareafix + String( Math.floor((Math.random() * 1000) + 1) );
}

// dragging function to help with layer browser
function docucmentMouseOverHandler () {
     // TODO: trigger the function that moves the object
        if(yDirection == "up") {
            console.log("MOUSE IS MOVING UP");
            if(shiftObjects && upperObject)
            {
                shiftUp(shiftObjects, upperObject);
            }
        }
        else if(yDirection == "down"){
            console.log("MOUSE IS MOVING DOWN");
            if(shiftObjects && lowerObject)
            {
                shiftDown(shiftObjects, lowerObject);
            }
        }
}

 
/** Setup a function to track the mouse movement of the user */

var xDirection = "";
var yDirection = "";
 
var oldX = 0;
var oldY = 0;
var sensitivity = 150;
 
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

function documentMouseUpListener(btn){
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

function shiftUp(){
    if(!upperObject.classList.contains("tooldivider") ){
        // runs the shift operations here
        console.log( "shift up:")
        shiftObjects.forEach(domElement => {
            console.log("runs")
            document.getElementById("toolcontainer").insertBefore(domElement, upperObject);
        });
        lowerObject = null;
        upperObject = null;
        shiftObjects = null;
        yDirection = "";
    }
}

function shiftDown(){
    if(lowerObject)
    {
        console.log(lowerObject)
        // run the function to shift the object downward
        console.log( "shift down:")
        shiftObjects.reverse().forEach(domElement => {
            lowerObject.insertAdjacentElement("afterend", domElement);
        });
        lowerObject = null;
        upperObject = null;
        shiftObjects = null;
        yDirection = "";
    }
}