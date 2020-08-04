

function writeContent(){
    const contentArr = [
        String("<div style='text-align:left'>PIE allows you to create publication ready figures much faster than similar products while \
        providng a much simplier user interface given by ArcGIS and similar applications. PIE specifically focuses on \
        GeoTIFF and ISIS Cube products because it it intentded for use by planetary scientists.</div>"),
        String(" \
        <pre>1. <i><b>Navigate to <a class='descanchor', href='https://pilot.wr.usgs.gov/'>PILOT</a></b></i>.\
        </pre><br/><pre>2. <i><b>Select</b></i> the <i><b>Planetary Body</b></i> you would like to search within.</pre><img alt='pilotimage1' class='pilotstepsimage' \
        src='images/pilot1.png'/><br/>\
        <pre>3. <i><b>Click</b></i> the <i><b>Map</b></i> tab to see the whole pds map.</pre><img alt='pilotimage3' class='pilotstepsimage' \
        src='images/pilot3.png'/><br/> \
        <pre>4. <i><b>Click</b></i> the <i><b>Polygon</b></i> button to the left of the map.</pre><img alt='pilotimage4' class='pilotstepsimage' \
        src='images/pilot4.png'/><br/> \
        <pre>5. <i><b>Draw</b></i> an area to search for a product image.</pre><img alt='pilotimage5' class='pilotstepsimage' \
        src='images/pilot5.png'/><br/> \
        <pre>6. <i><b>Check the boxes of the images</b></i> you like and <i><b>Click</b></i> the <i><b>Arrow Button</b></i> in the top right when you are ready.</pre><img alt='pilotimage6' class='pilotstepsimage' \
        src='images/pilot6.png'/><br/> \
        <pre>7. <i><b>Click</b></i> the bubble for <i><b>Project on the Web (POW)</b></i> and then <i><b>Click Go!</b></i>.</pre><img alt='pilotimage7' class='pilotstepsimage' \
        src='images/pilot7.png'/><br/> \
        <pre>8. <i><b>Click Submit</b></i>.</pre><img alt='pilotimage8' class='pilotstepsimage pilotstepsimage-sm' \
        src='images/pilot8.png'/><br/> \
        <pre>9 - HOW EVER LONG IT TAKES. Coming in further update.</pre><br/>")];

    let contentPrefix = "aboutcontent";
    contentArr.forEach(string => {
        document.getElementById(contentPrefix+String(contentArr.indexOf(string)+1)).innerHTML = string;
    });
}

$(document).ready(() => {
    writeContent();
});