
function writeContent(){
    const contentArr = [
        String("If you need to contact the developers for any reason feel free to contact us at our github page.\
         We ask that if you are wanting to submit a new feature or problem with the service please use the \
         'Report an Issue' button in the footer."),
        String("<div class='linklist'><a href='https://github.com/ChaddFrasier/PIE' , target='_blank'>PIE Code</a><br/>\
        <a href='https://www.usgs.gov/centers/astrogeology-science-center/about', target='_blank'>USGS Astrogeology</a><br/>\
        <a href='https://astrocloud.wr.usgs.gov/', target='_blank'>Processing On the Web (POW)</a><br/>\
        <a href='https://pilot.wr.usgs.gov/', target='_blank'>Planetary Image LOcator Tool (PILOT)</a><br/>\
        <a href='https://isis.astrogeology.usgs.gov/index.html', target='_blank'>Integrated Software for Imagers and Spectrometers</a></div>")];

    let contentPrefix = "contactcontent";
    contentArr.forEach(string => {
        document.getElementById(contentPrefix+String(contentArr.indexOf(string)+1)).innerHTML = string;
    });
}

$(document).ready(() => {
    writeContent();
});