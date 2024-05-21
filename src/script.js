import * as THREE from 'three';
let vertex, fragment;

let fragment_main = `
void main() {
    vec2 pos = resolution * (vUv * vec2(1., -1.) + vec2(0., 1.));
    pos = resolution * (vUv * vec2(1., -1.) + vec2(0., 1.));
    gl_FragColor = vec4(vec3(0.), 1.);


    if(sdfTotal(pos) < 0.) {
        gl_FragColor = vec4(vec3(1.), 1.);
    }
}`;

// JavaScript code in your-script.js
window.addEventListener('DOMContentLoaded', () => {
    Promise.all([
        fetch("./src/shaders/vertex.glsl").then(response => response.text()),
        fetch("./src/shaders/fragment.glsl").then(response => response.text()),
    ])
        .then(([vertexShaderText, fragmentShaderText]) => {
            vertex = vertexShaderText;
            fragment = fragmentShaderText;
            new Sketch();
        })
        .catch(error => {
            console.error('Error fetching shader files:', error);
        });
});

class AbstractMetaElement {
    constructor(element, id) {
        if (new.target == AbstractMetaElement) {
            throw new TypeError("Cannot construct AbstractMetaElement");
        }
        this.element = element;
        this.id = id;
    }

    update(array) {
        throw new Error("Must override method update");
    }
}

class MetaBox extends AbstractMetaElement {
    update(array) {
        // array[0] = x position
        // array[1] = y position
        // array[2] = width
        // array[3] = height
        array[this.id + 0] = this.element.getBoundingClientRect().left;
        array[this.id + 1] = this.element.getBoundingClientRect().top;
        array[this.id + 2] = this.element.offsetWidth;
        array[this.id + 3] = this.element.offsetHeight;
    }
}

class MetaBoxRounded extends AbstractMetaElement {
    update(array) {
        // array[0] = x position
        // array[1] = y position
        // array[2] = width
        // array[3] = height
        // array[4] = corner-radius
        array[this.id + 0] = this.element.getBoundingClientRect().left;
        array[this.id + 1] = this.element.getBoundingClientRect().top;
        array[this.id + 2] = this.element.offsetWidth;
        array[this.id + 3] = this.element.offsetHeight;
        array[this.id + 4] = this.element.getAttribute("r");
    }
}

class MetaText extends AbstractMetaElement {
    static letters = {
        "a": { function: "sda", advance: 180 },
        "b": { function: "sdb", advance: 180 },
        "c": { function: "sdc", advance: 180 },
        "d": { function: "sdd", advance: 180 },
        "e": { function: "sde", advance: 180 },
        "f": { function: "sdf", advance: 90 },
        "g": { function: "sdg", advance: 180 },
        "h": { function: "sdh", advance: 180 },
        "i": { function: "sdi", advance: 90 },
        "j": { function: "sdj", advance: 90 },
        "k": { function: "sdk", advance: 180 },
        "l": { function: "sdl", advance: 90 },
        "m": { function: "sdm", advance: 270 },
        "n": { function: "sdn", advance: 180 },
        "o": { function: "sdo", advance: 180 },
        "p": { function: "sdp", advance: 180 },
        "q": { function: "sdq", advance: 180 },
        "r": { function: "sdr", advance: 135 },
        "s": { function: "sds", advance: 180 },
        "t": { function: "sdt", advance: 90 },
        "u": { function: "sdu", advance: 180 },
        "v": { function: "sdv", advance: 180 },
        "w": { function: "sdw", advance: 270 },
        "x": { function: "sdx", advance: 180 },
        "y": { function: "sdy", advance: 180 },
        "z": { function: "sdz", advance: 180 },
    };

    update(array) {
        // array[0] = x position
        // array[1] = y position (bottom)
        array[this.id + 0] = this.element.getBoundingClientRect().left;
        array[this.id + 1] = this.element.getBoundingClientRect().top + this.element.offsetHeight;
    }
}

// Three JS 
class Sketch {
    constructor() {
        this.container = document.getElementById("container");
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.metaElements = []
        this.buildScene();

        let frustumSize = 1;
        this.camera = new THREE.OrthographicCamera(-frustumSize / 2, frustumSize / 2, frustumSize / 2, -frustumSize / 2, -1000, 1000);
        this.camera.position.z = 1;

        this.scene = new THREE.Scene();

        this.geometry = new THREE.PlaneGeometry(1, 1);

        const uniforms = {
            resolution: { type: "vec2", value: new THREE.Vector2() },
            time: { type: "float", value: 0 },
            mouse: { type: "vec2", value: new THREE.Vector2(0, 0) },
            array: { value: new Float32Array(this.arraySize) }
        }

        this.material = new THREE.ShaderMaterial({
            fragmentShader: fragment + this.fragment_sdf + fragment_main,
            vertexShader: vertex,
            uniforms: uniforms,
        })

        this.metaElements.forEach(e => e.update(this.material.uniforms.array.value));

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.width, this.height);
        this.container.appendChild(this.renderer.domElement);

        window.addEventListener("resize", this.resize.bind(this));
        this.resize();

        document.addEventListener("mousemove", this.mouseMove.bind(this));

        this.start = undefined;
        this.render();
    }

    buildScene() {
        this.fragment_sdf = "float sdfTotal(vec2 p) {\n";
        this.fragment_sdf += "\tfloat s = 3.402823466e+38;\n";

        let idCurrent = 2;

        document.querySelectorAll(".meta-box").forEach(element => {
            let box = new MetaBox(element, idCurrent);
            this.metaElements.push(box);

            this.fragment_sdf += "\ts = smin(sdBox(p - vec2(array[" + idCurrent + "] + array[" + (idCurrent + 2) + "] / 2., array [" + (idCurrent + 1) + "] + array[" + (idCurrent + 3) + "] / 2.),";
            this.fragment_sdf += "vec2( array[" + (idCurrent + 2) + "] / 2., array[" + (idCurrent + 3) + "] / 2.)), s, d / 8.);\n";

            idCurrent += 4;
        })

        document.querySelectorAll(".meta-box-rounded").forEach(element => {
            let box = new MetaBoxRounded(element, idCurrent);
            this.metaElements.push(box);

            this.fragment_sdf += "\ts = smin(sdRoundedBox(p - vec2(array[" + idCurrent + "] + array[" + (idCurrent + 2) + "] / 2., array [" + (idCurrent + 1) + "] + array[" + (idCurrent + 3) + "] / 2.),";
            this.fragment_sdf += "vec2( array[" + (idCurrent + 2) + "] / 2., array[" + (idCurrent + 3) + "] / 2.), vec4(array[" + (idCurrent + 4) + "])), s, d / 8.);\n";

            idCurrent += 5;
        })

        document.querySelectorAll(".meta-text").forEach(element => {
            let box = new MetaText(element, idCurrent);
            this.metaElements.push(box);

            const string = element.innerHTML;
            const scale = (900 / element.offsetHeight).toFixed(6);
            let advanceCurrent = 0;
            this.fragment_sdf  += "\tfloat text" + idCurrent + " = 3.402823466e+38;\n";

            for (let i = 0; i < string.length; i++) {
                const char = string.charAt(i);
                if (char in MetaText.letters) {

                    this.fragment_sdf += "\ttext" + idCurrent + " = smin(" + MetaText.letters[char].function + "(((p - vec2(array[" + idCurrent + "], array[" + (idCurrent + 1) + "] - "+  (200 / scale).toFixed(6) +")) * -" + scale + ") + vec2 (" + advanceCurrent.toFixed(6) + ", 0.)) / " + scale + ", text" + idCurrent + ", d / 8. / " + scale + ");\n";
                    advanceCurrent += MetaText.letters[char].advance;
                } else {
                    advanceCurrent += 180;
                }
            }

            this.fragment_sdf += "\ts = smin(text" + idCurrent + ", s, d / 8.);\n";
            idCurrent += 2;
        })

        this.fragment_sdf = "uniform float[" + idCurrent + "] array;\n" + this.fragment_sdf;

        this.fragment_sdf += "\tfloat t = 3.1415 / 1.5;\n";
        this.fragment_sdf += "\tvec2 mousevec = (p - vec2(array[0], array[1]));\n";
        this.fragment_sdf += "\ts = smin(sdCross(mousevec * 2.) / 2., s, d / 8.);\n";
        this.fragment_sdf += "\treturn s;\n}"

        console.log(this.fragment_sdf);
        this.arraySize = idCurrent;

    }

    render(timeStamp) {
        if (this.start == undefined) {
            this.start = timeStamp;
        }
        let elapsed = timeStamp - this.start;
        /*       this.mesh.rotation.x = elapsed / 2000;
                 this.mesh.rotation.y = elapsed / 1000;
         */

        this.material.uniforms.time.value = elapsed;
        this.renderer.render(this.scene, this.camera);

        /*         let material = new THREE.ShaderMaterial({
                    fragmentShader: fragment + "gl_FragColor = vec4(vec3( col ), 1.);}",
                    vertexShader: vertex,
                    uniforms: this.uniforms
                });
                this.mesh.material = material; */

        window.requestAnimationFrame(this.render.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize(this.width, this.height);

        this.material.uniforms.resolution.value.x = this.width;
        this.material.uniforms.resolution.value.y = this.height;

        this.metaElements.forEach(e => e.update(this.material.uniforms.array.value));
    }

    mouseMove(event) {
        this.material.uniforms.mouse.value.x = event.pageX;
        this.material.uniforms.mouse.value.y = event.pageY;

        let test = this.material.uniforms.array.value;

        test[0] = event.pageX;
        test[1] = event.pageY;
    }
}