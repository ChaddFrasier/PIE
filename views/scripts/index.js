
// start of jquery function
$(document).ready(()=>{
    // variables for basic js functions
    var svg = document.getElementById("figurecontainer");
    var caption = document.getElementById("captionbox");
    var captionlocation = document.getElementById("captionlocation");
    var bgpicker = document.getElementById("backgroundcolor");
    var edittoolsbox = document.getElementById("edittoolsbox");
    var filetoolsbox = document.getElementById("toolcontainer");
    
    // set background right away when page loads
    setSVGBackground(svg, bgpicker.value);


    /** CAPTION TOOLS LISTENERS */
    $('#captionwidth').on("change", function(event){
        caption.style.width = this.value;
    });

    $('#captionheight').on("change", function(event){
        caption.style.height = this.value;
    });

    $('#captionxcoord').on("change", function(event){
        captionlocation.setAttribute("x",this.value);
    });

    $('#captionycoord').on("change", function(event){
        captionlocation.setAttribute("y",this.value);
    });

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
        let newoptionsbar = document.createElement("div");

        newoptionsbar.classList.add("windowoptionsbar");
        newoptionsbar.style.display = "flex";

        let header = document.createElement("h4");
        header.innerHTML = "Caption Object";
        header.style.margin = "0";

        let minibtn = document.createElement("button");
        minibtn.classList.add("windowminimizebtn");
        minibtn.innerHTML = "▲";
        minibtn.addEventListener( "click", function(event) {
            minimizeToolsWindow(event);
        });

        let toolsarea = document.createElement("div")
        toolsarea.classList.add("captiontoolsbox");

        let textlabel = document.createElement("label");
        textlabel.innerHTML = "Caption Text:  ";
        textlabel.setAttribute("for", "captiontextinput");

        let textinput = document.createElement("textarea");
        textinput.setAttribute("name","captiontextinput");
        textinput.classList.add('textareainputfield')

        let widthlabel = document.createElement("label");
        widthlabel.innerHTML = "Width of Caption: ";
        widthlabel.setAttribute("for", "widthinput");

        let widthinput = document.createElement("input");
        widthinput.setAttribute("type", "number");
        widthinput.setAttribute("min", '1500');
        widthinput.setAttribute("placeholder", '1500');
        widthinput.setAttribute("name","widthinput");

        let heightlabel = document.createElement("label");
        heightlabel.innerHTML = "Height of Caption: ";
        heightlabel.setAttribute("for", "widthinput");

        let heightinput = document.createElement("input");
        heightinput.setAttribute("type", "number");
        heightinput.setAttribute("min", '1500');
        heightinput.setAttribute("placeholder", '1500');
        heightinput.setAttribute("name","widthinput");

        let xcoordlabel = document.createElement("label");
        xcoordlabel.innerHTML = "X Coordinate: ";
        xcoordlabel.setAttribute("for", "widthinput");

        let xcoordinput = document.createElement("input");
        xcoordinput.setAttribute("type", "number");
        xcoordinput.setAttribute("min", '0');
        xcoordinput.setAttribute("placeholder", '0');
        xcoordinput.setAttribute("name","xcoordinput");
        
        let ycoordlabel = document.createElement("label");
        ycoordlabel.innerHTML = "Y Coordinate: ";
        ycoordlabel.setAttribute("for", "ycoordinput");

        let ycoordinput = document.createElement("input");
        ycoordinput.setAttribute("type", "number");
        ycoordinput.setAttribute("min", '0');
        ycoordinput.setAttribute("placeholder", '0');
        ycoordinput.setAttribute("name","ycoorinput");

        toolsarea.append( textlabel, document.createElement("br"), textinput,
        document.createElement("br"), widthlabel, document.createElement("br"),
        widthinput, document.createElement("br"), heightlabel, 
        document.createElement("br"), heightinput, document.createElement("br"),
        xcoordlabel, document.createElement("br"), xcoordinput, document.createElement("br"),
        ycoordlabel, document.createElement("br"), ycoordinput );

       // append all elements together
       newoptionsbar.append(header, minibtn,toolsarea);
       // finish by appending the whole thing
       filetoolsbox.insertBefore(newoptionsbar, document.getElementById("copyoptionsbar"));
       filetoolsbox.insertBefore(toolsarea, document.getElementById("copyoptionsbar"));

    });
    
    // TODO: fix the transition issues happening with this now
    $('button.toolboxaddimagebtn').click((event) => {

        let newoptionsbar = document.createElement("div");

        newoptionsbar.classList.add("windowoptionsbar");
        newoptionsbar.style.display = "flex";

        let header = document.createElement("h4");
        header.innerHTML = "Image Tools";
        header.style.margin = "0";

        let minibtn = document.createElement("button");
        minibtn.classList.add("windowminimizebtn");
        minibtn.innerHTML = "▲";
        minibtn.addEventListener( "click", function(event) {
            minimizeToolsWindow(event);
        });

        let toolsarea = document.createElement("div")
        toolsarea.classList.add("imagetoolsbox");

        let filelabel = document.createElement("label");
        filelabel.innerHTML = "Choose a file: ";
        filelabel.setAttribute("for", "imageinput");

        let fileinput = document.createElement("input");
        fileinput.setAttribute("type", "file");
        fileinput.setAttribute("name","imageinput");
        fileinput.classList.add('fileinputfield')

        let widthlabel = document.createElement("label");
        widthlabel.innerHTML = "Width of Image: ";
        widthlabel.setAttribute("for", "widthinput");

        let widthinput = document.createElement("input");
        widthinput.setAttribute("type", "number");
        widthinput.setAttribute("min", '1500');
        widthinput.setAttribute("placeholder", '1500');
        widthinput.setAttribute("name","widthinput");

        let heightlabel = document.createElement("label");
        heightlabel.innerHTML = "Height of Image: ";
        heightlabel.setAttribute("for", "widthinput");

        let heightinput = document.createElement("input");
        heightinput.setAttribute("type", "number");
        heightinput.setAttribute("min", '1500');
        heightinput.setAttribute("placeholder", '1500');
        heightinput.setAttribute("name","widthinput");

        let xcoordlabel = document.createElement("label");
        xcoordlabel.innerHTML = "X Coordinate: ";
        xcoordlabel.setAttribute("for", "widthinput");

        let xcoordinput = document.createElement("input");
        xcoordinput.setAttribute("type", "number");
        xcoordinput.setAttribute("min", '0');
        xcoordinput.setAttribute("placeholder", '0');
        xcoordinput.setAttribute("name","xcoordinput");
        
        let ycoordlabel = document.createElement("label");
        ycoordlabel.innerHTML = "Y Coordinate: ";
        ycoordlabel.setAttribute("for", "ycoordinput");

        let ycoordinput = document.createElement("input");
        ycoordinput.setAttribute("type", "number");
        ycoordinput.setAttribute("min", '0');
        ycoordinput.setAttribute("placeholder", '0');
        ycoordinput.setAttribute("name","ycoorinput");

        toolsarea.append( filelabel, document.createElement("br"),
         fileinput, document.createElement("br"), widthlabel, document.createElement("br"), 
         widthinput, document.createElement("br"), heightlabel, document.createElement("br"), 
         heightinput, document.createElement("br"), xcoordlabel, document.createElement("br"),
         xcoordinput, document.createElement("br"), ycoordlabel, 
         document.createElement("br"), ycoordinput, document.createElement("br") );


        // append all elements together
        newoptionsbar.append(header, minibtn,toolsarea);
        // finish by appending the whole thing
        filetoolsbox.insertBefore(newoptionsbar, document.getElementById("copyoptionsbar"));
        filetoolsbox.insertBefore(toolsarea, document.getElementById("copyoptionsbar"));
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