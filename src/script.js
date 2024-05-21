import {MetaCanvas, ColorRamp, ColorStop} from "./meta-logic.js";
import * as THREE from 'three';

document.addEventListener("mousemove", (e) => {
    const follower = document.getElementById("cursor");
    follower.style.left = e.clientX - follower.offsetWidth / 2 + "px";
    follower.style.top = e.clientY - follower.offsetHeight / 2 + "px";
})

document.getElementById("sR").addEventListener("input", e => {
    metaCanvas.setSmoothRadius(e.target.value);
    document.getElementById("sRt").innerHTML = e.target.value;
})

document.getElementById("g").addEventListener("input", e => {
    metaCanvas.setGain(e.target.value);
    document.getElementById("gt").innerHTML = e.target.value;
})

document.getElementById("c").addEventListener("input", e => {
    metaCanvas.setContrast(e.target.value);
    document.getElementById("ct").innerHTML = e.target.value;
})

document.getElementById("s").addEventListener("input", e => {
    metaCanvas.setSteps(e.target.value);
    document.getElementById("st").innerHTML = e.target.value;
})

const colorRamps = [
    ColorRamp.toEquallySpaced([new THREE.Color("black"), new THREE.Color(0, 1, 0), new THREE.Color("white")]),
    ColorRamp.toEquallySpaced([new THREE.Color("rgb(255, 0, 0)"), new THREE.Color(0x00ff00), new THREE.Color(0, 0, 1)]),
    new ColorRamp([new ColorStop(new THREE.Color("rgb(0, 0, 255)"), 0), new ColorStop(new THREE.Color("rgb(0, 255, 0)"), 1)]),
    new ColorRamp([new ColorStop(new THREE.Color(0x000022), 0), new ColorStop(new THREE.Color(0x160870), 0.3), new ColorStop(new THREE.Color(0xcafbaf), 0.4),
        new ColorStop(new THREE.Color(0xfe32e9), 0.6), new ColorStop(new THREE.Color(0xff0006), 0.8), new ColorStop(new THREE.Color(0x160870), 0.9), new ColorStop(new THREE.Color(0x000022), 1)])
];

let currentColorRamp = 0;

document.getElementById("colors").addEventListener("click", e => {
    metaCanvas.setColorRamp(colorRamps[currentColorRamp++ % colorRamps.length]);
    console.log("moin");
})

const metaCanvas = new MetaCanvas({smoothRadius: 250, gain: 0, contrast: 0.1, steps: 500, colorRamp: colorRamps[3]})