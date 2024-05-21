import MetaCanvas from "./meta-logic.js";

document.addEventListener("mousemove", (e) => {
    const follower = document.getElementById("cursor");
    follower.style.left = e.clientX - follower.offsetWidth / 2 + "px";
    follower.style.top = e.clientY - follower.offsetHeight / 2 + "px";
})


const metaCanvas = new MetaCanvas(15);

document.addEventListener("click", e => {
    metaCanvas.setSmoothRadius(40.5);
})