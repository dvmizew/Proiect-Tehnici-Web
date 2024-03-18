window.addEventListener('scroll', function () {
    var header = document.getElementById("header");
    var sticky = header.offsetTop;

    if (window.scrollY > sticky) {
        header.classList.add("sticky");
    } else {
        header.classList.remove("sticky");
    }
});