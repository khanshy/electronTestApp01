const elem = document.getElementById("progress-bar-bg");
let width = 1;
let id = setInterval(()=> {
    if (width >= 100) {
        clearInterval(id);
    } else {
        width++;
        elem.style.width = width + "%";
    }
}, 25);