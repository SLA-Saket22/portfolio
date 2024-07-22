var a = document.querySelector(".fa-bars");
var b = document.querySelector(".fa-xmark");
var c = document.querySelector(".nav-list");

a.addEventListener("click", () => myFunction());
b.addEventListener("click", () => myFunction());

function myFunction() {
    if(c.style.display=="none"){
        c.style.display="block";
        a.style.display="none";
        b.style.display="block";
    }else{
        c.style.display="none";
        a.style.display="block";
        b.style.display="none";
    }
}