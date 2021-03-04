
function updateAboutContent( id )
{

    console.log(id)
    document.querySelectorAll('.navbar > p').forEach( p => {
        p.classList.remove("disabled")
    });

    // disable the button that was clicked
    document.getElementById(id).classList.add('disabled')

    switch( id )
    {
        case "start":
            var container = document.createElement("div"),
                header = document.createElement("div"),
                header2 = document.createElement("div"),
                div2 = document.createElement("div"),
                div = document.createElement("div");

            header.classList.add("basicpageheader")
            header.innerHTML = "Getting Started"

            div.classList.add("descBox2")
            div.innerHTML = "<p>In order to use PIE you should first obtain map projected images or web safe images. The following sections will give you an introduction to the PIE user interface and a quick demonstation of how to obtain map projected images from PILOT. If you want to use POW follow the instructions on the POW homepage.</p>"

            header2.innerHTML = "PIE Interface"
            header2.classList.add("basicpageheader")
            div2.classList.add("basicpagecontent")
            div2.innerHTML = "<pre class='UIHolder'><img class='UIIntro' alt='UI1' src='/images/UI-c2.png'/></pre>"
            
            container.append(header, div,header2, div2)

            document.getElementById("changebox").innerHTML = container.innerHTML
            
            break;

        case "interaction":
            var container = document.createElement('div'),
                header = document.createElement('div'),
                desc = document.createElement('div'),
                header2 = document.createElement('div'),
                desc2 = document.createElement('div');

            header.innerHTML = "How to Add Icons"
            header.classList.add('basicpageheader');

            header2.innerHTML = "How to Add Lines & Outlines"
            header2.classList.add('basicpageheader');

            desc.innerHTML = "<h3 class='innerpageheader'>Drag and drop icons onto images.<h3><pre class='UIHolder'><img class='UIGif' alt='UI3', src='/images/sample1.gif'/></pre>";

            desc2.innerHTML = "<h3 class='innerpageheader'>Press and hold to draw lines and boxes.<h3><pre class='UIHolder'><img class='UIGif' alt='UI3', src='/images/sample2.gif'/></pre>";

            desc.classList.add('basicpagecontent')
            desc2.classList.add('basicpagecontent')

            container.append(header,desc,header2,desc2);    
            document.getElementById("changebox").innerHTML = container.innerHTML
            break;
        
        case "pilot":
            // TODO: create the new portion of the about page using js and set to the .changebox.innerHTML
            var container = document.createElement('div'),
                header = document.createElement('div'),
                desc = document.createElement('pre'),
                mainpre = document.createElement('pre'),
                innerpre = document.createElement('pre'),
                innerpre2 = document.createElement('pre'),
                innerpre3 = document.createElement('pre'),
                innerpre4 = document.createElement('pre'),
                innerpre5 = document.createElement('pre'),
                innerpre6 = document.createElement('pre'),
                innerpre7 = document.createElement('pre');
            
            header.innerHTML = "Using PILOT to Find Images"
            header.classList.add('basicpageheader');


            innerpre.innerHTML = "<i><b>1. Select </b></i> the <i><b>planetary body</b></i> you would like to search within.<br><img class='pilotstepsimage' alt='pilotimage1' src='/images/pilot1.PNG'/>";

            innerpre2.innerHTML = "<i><b>2. Click</b></i> the <i><b>Map tab</b></i> to view the planetary map.<br><img class='pilotstepsimage' alt='pilotimage3' src='/images/pilot3.PNG'/>";

            innerpre3.innerHTML = "<i><b>3. Click</b></i> the <i><b>Polygon Button</b></i> to the left side of the map.<br><img class='pilotstepsimage' alt='pilotimage4' src='/images/pilot4.PNG'/>";

            innerpre4.innerHTML = "<i><b>4. Draw a shape</b></i> on the map to select images in that area.<br><img class='pilotstepsimage' alt='pilotimage5' src='/images/pilot5.PNG'/>";

            innerpre5.innerHTML = "<i><b>5. Check the checkboxes</b></i> for the images you want to use.<br><img class='pilotstepsimage' alt='pilotimage6' src='/images/pilot6.PNG'/>";

            innerpre6.innerHTML = "<i><b>6. Click</b></i> the POW bubble for Projections On the Web. Then just click go! and wait for your POW Id to be returned to your email.<br><img class='pilotstepsimage' alt='pilotimage7' src='/images/pilot7.PNG'/>";

            innerpre7.innerHTML = "<i><b>6. Click submit.</b></i><br><img class='pilotstepsimage' alt='pilotimage8' src='/images/pilot8.PNG'/>";

            mainpre.append(innerpre, innerpre2, innerpre3, innerpre4, innerpre5, innerpre6, innerpre7 )
            desc.innerHTML = "<i><b>1. Navigate to the </b><a class='inlayedlink' href='https://pilot.wr.usgs.gov/', target='_blank'>PILOT</a><b> homepage.</b></i>" + mainpre.outerHTML;

            container.append(header, desc);
            document.getElementById("changebox").innerHTML = container.innerHTML;
            break;

        case "pow":
            // update the main content box
            var container = document.createElement('div'),
                header = document.createElement('h2'),
                header4 = document.createElement('h4'),
                header5 = document.createElement('h5'),
                div = document.createElement('div');

            header.classList.add("basicpageheader");
            header.innerHTML = "Processing Images with POW";

            div.classList.add("importantnotecontent")
            header4.classList.add("importantnote-main")
            header4.classList.add("importantnote-desc")

            header4.innerHTML = '<b>Important Note:   </b><i>In order to use POW you need to first sign up with an email address.</i>'
            header5.innerHTML = "<i>Follow the 'Quick step-by-step' </i> <a class='inlayedlink' href='https://astrocloud.wr.usgs.gov' target='_blank'>here</a><i> to sign up for POW access.</i>"
            
            div.append(header4, header5);
            container.append(header, div);
            
            document.getElementById("changebox").innerHTML = container.innerHTML;
            break;
    }
}