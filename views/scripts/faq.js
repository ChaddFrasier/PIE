function writeContent(){
    const contentArr = [
        String("<div class='answerBox'><i><b>Planetary Image Editor</i></b></div><div class='descBox'>Born from the\
        <i>Planetary Image Caption Writer Project</i> by Laszlo Kestay and the USGS,\
        <b><i>PIE</i></b> aims to simplify the figure making process for planetary researchers that use \
        <a class='descanchor', href='https://astrocloud.wr.usgs.gov/' , target='_blank'>POW</a> and <a \
        class='descanchor', href='https://pilot.wr.usgs.gov/' , target='_blank'>PILOT</a> to create publication \
        images. Using ISIS Cube files or GeoTIFF files, PIE helps automate some of the more tedious parts of creating \
        a scientificly acceptable figure.</div><br/>"),
        String("<div class='answerBox'><i><b>GDAL & ISIS3</i></b></div><div class='descBox'>GDAL is the \
        <b><i>Geospacial Data Abstraction Library</i></b>. It is primarily used to manipulate GeoTIFF files and other \
        special purpose data files (Ex: ISIS3 Cube Files). ISIS3 is the <b><i>Integrated System for Imagers and Spectrometers</i></b> which is\
        a software system built by the Astrogeology team at the USGS for the purpose of reading PDS image data into a more managable format.</div>"),
        String("<div class='answerBox'><i><b>Follow How To</i></b></div><div class='descBox'>Follow the instructions presented <a class='descanchor',\
         href='/about', target='_blank'>HERE</a>. When POW gives you a job id come back here and type it into the \
         folder address field.</div><br/>"),
         String("<div class='answerBox'><div class='linklist'>\
        <a href='https://github.com/ChaddFrasier/PIE' , target='_blank'>Planetary Image Editor (PIE) Code</a><br/><br/>\
        <a href='https://www.usgs.gov/centers/astrogeology-science-center/about', target='_blank'>USGS Astrogeology\
        </a><br/><br/><a href='https://astrocloud.wr.usgs.gov/', target='_blank'>Processing On the Web (POW)</a><br/><br/>\
        <a href='https://pilot.wr.usgs.gov/', target='_blank'>Planetary Image LOcator Tool (PILOT)</a><br/><br/>\
        <a href='https://isis.astrogeology.usgs.gov/index.html', target='_blank'>Integrated Software for Imagers \
        and Spectrometers (ISIS)</a></div></div><div class='descBox'><div class='desclist'>\
        >The source code for this service.<br/><br/>\
        >Homepage for USGS Astrogeology<br><br/>\
        >Learn about POW<br/><br/>\
        >Try out PILOT<br/><br/>\
        >Learn about ISIS3</div></div>")];

    let contentPrefix = "faqcontent";
    contentArr.forEach(string => {
        document.getElementById(contentPrefix+String(contentArr.indexOf(string)+1)).innerHTML = string;
    });
}

document.addEventListener("readystatechange", writeContent)