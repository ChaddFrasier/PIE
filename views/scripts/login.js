/* Required! 
    run all jquery after the document is loaded
*/
$(document).ready(() => {
    $('#signinform').submit(function(){
        console.log('submitting form')
    });
});

function validateForm(form, email){
    let emailpattern = document.getElementById("email").getAttribute("pattern");
    let regexp = new RegExp(emailpattern);
    if(regexp.test(email)){
        window.alert("usgs email confirmed ");
        form.submit();
    }
    else{
        window.alert("Sign In Failed");
    }
}