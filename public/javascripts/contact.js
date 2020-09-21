function writeContent(){
    const contentArr = [
        String("<pre><i><b>All contact can be directed to our <a class='descanchor' href='https://github.com/ChaddFrasier/PIE',target='_blank'>GitHub</a> Page. \
        <br>Please file an issue with the label that best fits your topic.</b></i></pre>\
        <pre><pre><h2>How to File an Issue:</h2></pre> \
        <pre><u><b>1. Click New Issue </b></u><br><img class='pilotstepsimage' src='images/newissue1.png'></pre>\
        <pre><u><b>2. Set Label(s)</b></u><br><img src='images/newissue2.png' class='pilotstepsimage'/></pre>\
        <pre><u><b>3. Fill out remaining fields</b></u><br> <img src='images/newissue3.png' class='pilotstepsimage'/></pre>\
        <pre><u><b><a class='descanchor' href='https://github.com/ChaddFrasier/PIE/issues/new', target='_blank'>File an Issue?</a></b></u></pre>")];

    let contentPrefix = "contactcontent";
    contentArr.forEach(string => {
        document.getElementById(contentPrefix+String(contentArr.indexOf(string)+1)).innerHTML = string;
    });
}

document.addEventListener("readystatechange", writeContent)