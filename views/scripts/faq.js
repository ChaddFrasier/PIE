
function writeContent(){
    const contentArr = [
        String("<i><b>Planetary Image Editor</i></b> - Born from the <i>Planetary Image Caption Writer Project</i>\
         by Laszlo Kestay and the USGS,\
        <b><i>PIE</i></b> aims to simplify the figure making process for planetary researchers that use \
        <a class='descanchor', href='https://astrocloud.wr.usgs.gov/' , target='_blank'>POW</a> and <a \
        class='descanchor', href='https://pilot.wr.usgs.gov/' , target='_blank'>PILOT</a> to create publication \
        images. Using ISIS Cube files or GeoTIFF files, PIE helps automate some of the more tedious parts of creating \
        a scientificly acceptable figure.<br/>"),
        String("<i><b>GDAL & ISIS3</i></b> - These make this whole application possible."),
        String("<i><b>Follow How To</i></b> - Follow the instructions presented <a class='descanchor',\
         href='/about', target='_blank'>HERE</a>. When POW gives you a job id come back here and type it into the \
         folder address field.<br/>")];

    let contentPrefix = "faqcontent";
    contentArr.forEach(string => {
        document.getElementById(contentPrefix+String(contentArr.indexOf(string)+1)).innerHTML = string;
    });
}

$(document).ready(() => {
    writeContent();
});