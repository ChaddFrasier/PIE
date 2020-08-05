
function writeContent(){
    const contentArr = [
        String("<pre><i><b>All contact can be directed to our <a class='descanchor' href='https://github.com/ChaddFrasier/PIE/issues',target='_blank'>GitHub</a> Page. \
        <br>Please file an issue with the label that best fits your topic.</b></i></pre>\
        <pre><pre><u>How to file an issue:</u></pre> \
        <pre><u><b>1. Click New Issue </b></u><br><img class='pilotstepsimage' src='images/newissue1.png'></pre>\
        <pre><u><b>2. Set Label(s)</b></u><br><img src='images/newissue2.png' class='pilotstepsimage'/></pre>\
        <pre><u><b>3. Fill out remaining fields</b></u><br> <img src='images/newissue3.png' class='pilotstepsimage'/></pre></pre>"),
        String("<div class='linklist'>\
        <a href='https://github.com/ChaddFrasier/PIE' , target='_blank'>Planetary Image Editor (PIE) Code</a><br/>\
        <a href='https://www.usgs.gov/centers/astrogeology-science-center/about', target='_blank'>USGS Astrogeology\
        </a><br/><a href='https://astrocloud.wr.usgs.gov/', target='_blank'>Processing On the Web (POW)</a><br/>\
        <a href='https://pilot.wr.usgs.gov/', target='_blank'>Planetary Image LOcator Tool (PILOT)</a><br/>\
        <a href='https://isis.astrogeology.usgs.gov/index.html', target='_blank'>Integrated Software for Imagers and Spectrometers (ISIS)</a></div>")];

    let contentPrefix = "contactcontent";
    contentArr.forEach(string => {
        document.getElementById(contentPrefix+String(contentArr.indexOf(string)+1)).innerHTML = string;
    });
}

$(document).ready(() => {
    writeContent();
});