

function writeContent(){
    const contentArr = [
        String("Born from the <i><b>Planetary Image Caption Writer Project</b></i> by Laszlo Kestay and the USGS,\
    this project aims to simplify the figure making process for planetary researchers that use \
    <a class='descanchor', href='https://astrocloud.wr.usgs.gov/' , target='_blank'>POW</a> and <a \
    class='descanchor', href='https://pilot.wr.usgs.gov/' , target='_blank'>PILOT</a> by the USGS. Using ISIS \
     Cube files or GeoTIFF files, PIE helps automate some of the more tedious parts of creating a scientificly \
    acceptable figure.<br/><br/> PIE helps automate image annotation by digging through the planeatary data files and \
    setting the icons accordingly. PIE also allows users write captions and place them directly over the image or\
     export all layers seperatly."),
        String("PIE allows you to create publication ready figures much faster than similar products while \
    providng a much simplier user interface given by ArcGIS and similar applications. PIE specifically focuses on \
    GeoTIFF and ISIS Cube products because it it intentded for use by planetary scientists."),
        String("Use the Image Button to add ISIS cubes, GeoTIFFs, or still images to the figure <br/> \
        <pre>1. Find a planetary product with <a class='descanchor', href='https://pilot.wr.usgs.gov/'>PILOT</a>.\
        </pre>-<pre>2. Select the POW export function in PILOT.</pre>-<pre>3. Select the proper POW configuration.\
        </pre>-<pre>4. Navigate to the link that is given to you when POW finished processing your files.</pre><br/>")];

    let contentPrefix = "aboutcontent";
    contentArr.forEach(string => {
        document.getElementById(contentPrefix+String(contentArr.indexOf(string)+1)).innerHTML = string;
    });
}

$(document).ready(() => {
    writeContent();
});