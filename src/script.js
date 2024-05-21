import {MetaCanvas, ColorRamp, ColorStop} from "./meta-logic.js";
import * as THREE from 'three';

document.addEventListener("mousemove", (e) => {
    const follower = document.getElementById("cursor");
    follower.style.left = e.clientX - follower.offsetWidth / 2 + "px";
    follower.style.top = e.clientY - follower.offsetHeight / 2 + "px";
})


const metaCanvas = new MetaCanvas({smoothRadius: 15, gain: 0});

document.addEventListener("click", e => {
    metaCanvas.setSmoothRadius(100);
    metaCanvas.setContrast(0.05);
    metaCanvas.setGain(2);

    let c = new ColorRamp();
    c.append(new ColorStop(new THREE.Color("rgb(255, 0, 0)"), 0.));
    c.append(new ColorStop(new THREE.Color("rgb(255, 255, 0)"), 0.25));
    c.append(new ColorStop(new THREE.Color("rgb(0, 255, 255)"), 0.75));
    c.append(new ColorStop(new THREE.Color("rgb(0, 0, 255)"), 1.)); 
    const colors = ColorRamp.toEquallySpaced([new THREE.Color("rgb(255, 0, 0)"), new THREE.Color(0x00ff00), new THREE.Color(0, 0, 1)]);
    console.log(colors);
    metaCanvas.setColorRamp(colors);
})