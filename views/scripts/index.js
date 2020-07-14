
// start of jquery function
$(document).ready(()=>{
    // variables for basic js functions
    var svg = document.getElementById("figurecontainer");
    var bgpicker = document.getElementById("backgroundcolor")
    
    setSVGBackground(svg, bgpicker.value);

    // moving inner menus up and down
    $('button.windowminimizebtn').click((event) => {
        if(event.target.parentElement.nextElementSibling.style.height == '0%'){
            event.target.parentElement.nextElementSibling.style.height = event.target.parentElement.nextElementSibling.style.maxHeight;
            event.target.innerHTML = '▲';
        }
        else{
            event.target.parentElement.nextElementSibling.style.height = '0%';
            event.target.innerHTML = '▼';
        }
    });

    $('.rightfooter').click(() => {
        window.open("https://www.usgs.gov/centers/astrogeology-science-center", '_blank');
    });

    $('button.toolboxminimizebtn').click((event) => {
        let toolbox = document.getElementById('toolbox');
        let editbox = document.getElementById('editbox');
        if( toolbox.classList.contains('closed') ){
            toolbox.classList.remove('closed');
            editbox.style.width = "auto";
            event.target.innerHTML = "◄";
        }
        else{
            toolbox.classList.add('closed');
            editbox.style.width = "95%";
            event.target.innerHTML = "►";
        }
    });

    // TODO: need to finish changing the svg boxes and stuff when these are changed
    $('#figsizeselect').on("change", (event) => {
        let tmp = event.target.value.split("x");

        svg.setAttribute("viewBox", "0 0 " + tmp[0] + ' ' + tmp[1]);
    });

    // TODO: need to finish changing the svg boxes and stuff when these are changed
    $('#backgroundcolor').on("change", () => {
        setSVGBackground(svg, bgpicker.value)
    });

// TODO:
    $('#framesizeselect').on("change", (event) => {
        console.log("UPDATE THE CAPTION AND IMAGE DIMENSIONS")
    });
// TODO:
    $('#northarrowopt').on("mouseup", (event) => {
        let checkbox = event.target;

        console.log("ADD AND REMOVE NORTH ICON")
    });
// TODO:
    $('#sunarrowopt').on("mouseup", (event) => {
        let checkbox = event.target;

        console.log("ADD AND REMOVE SUN ICON")
    });
// TODO:
    $('#observerarrowopt').on("mouseup", (event) => {
        let observer = event.target;

        console.log("ADD AND REMOVE OBSERVER ICON")
    });
}); // end of jquery functions

function setSVGBackground(svg, color){
    svg.style.background = color;
}