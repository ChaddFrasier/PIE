

function writeContent(){
    const contentArr = [
        String("Born from the Planetary Image Caption Writer Project by NAU Capstone and the USGS,\
    this project aims to simplify the figure making process for many types of planetary researchers. Using ISIS Cube \
    files or Tiff files we can help automate some of the more tedious parts of creating a scientificly \
    acceptable figure."),
        String("PIE allows you to create publication ready figures much faster than photoshop alone while \
    providng a much simplier user interface than what is given by ArcGIS"),
        String("Use the Image Button to add ISIS cubes, GeoTIFFs, or still images to the figure")];

    let contentPrefix = "aboutcontent";
    contentArr.forEach(string => {
        document.getElementById(contentPrefix+String(contentArr.indexOf(string)+1)).innerHTML = string;
    });
}

$(document).ready(() => {
    writeContent();
});