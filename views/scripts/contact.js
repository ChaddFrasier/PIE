
function writeContent(){
    const contentArr = [
        String("This product was designed by the USGS Astrogeology science Center under the direction of \
        Laszlo Kestay and with assistance from the POW development team. All contact can be directed to our \
        <a class='descanchor' href='https://github.com/ChaddFrasier/PIE/issues',target='_blank'>GitHub</a> Page. \
        Please file an issue with the appropriatte tag for the type of post you are making.<pre><u>Examples:</u></pre> \
        <pre><u><b>Bug</b></u> → Problem found.</pre><pre><u><b>Discussion/Question</b></u> → Ask about something.</pre><pre>Etc.</pre>"),
        String("<div class='linklist'><a href='https://github.com/ChaddFrasier/PIE' , target='_blank'>Planetary Image Editor (PIE) Code</a><br/>\
        <a href='https://www.usgs.gov/centers/astrogeology-science-center/about', target='_blank'>USGS Astrogeology</a><br/>\
        <a href='https://astrocloud.wr.usgs.gov/', target='_blank'>Processing On the Web (POW)</a><br/>\
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