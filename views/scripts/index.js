$(document).ready(()=>{
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
        if(toolbox.classList.contains('closed')){
            toolbox.classList.remove('closed')
            editbox.style.width = "auto";
            event.target.innerHTML = "◄";
        }
        else{
            toolbox.classList.add('closed')
            editbox.style.width = "auto";
            event.target.innerHTML = "►";

        }
    });
});
