
// start of jquery function
$(document).ready(()=>{
    // variables for basic js functions
    var svg = document.getElementById("figurecontainer");
    var caption = document.getElementById("captionbox");
    var captionlocation = document.getElementById("captionlocation");
    var bgpicker = document.getElementById("backgroundcolor");
    var edittoolsbox = document.getElementById("edittoolsbox");
    var filetoolsbox = document.getElementById("filetools");

    
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
        console.log("ADD A CAPTION");
    });
    
    // TODO: fix the transition issues happening with this now
    $('button.toolboxaddimagebtn').click((event) => {
        
        filetoolsbox.insertAdjacentHTML("afterend", "<!-- THIS IS A WHERE WE INSERT THINGS --> ")
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