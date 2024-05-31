import * as THREE from 'three';

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

class MetaCircle extends AbstractMetaElement {
    update(array) {
        // array[0] = x position
        // array[1] = y position (bottom)
        // array[2] = radius (height)
        array[this.id + 0] = this.element.getBoundingClientRect().left;
        array[this.id + 1] = this.element.getBoundingClientRect().top;
        array[this.id + 2] = this.element.offsetWidth;
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
        // array[3] = scale
        array[this.id + 0] = this.element.getBoundingClientRect().left;
        array[this.id + 1] = this.element.getBoundingClientRect().top + this.element.offsetHeight;
        array[this.id + 2] = (900 / this.element.offsetHeight).toFixed(8);
    }
}

export class ColorStop {
    constructor(color, t) {
        this.color = color;
        this.t = t;
    }
}

export class ColorRamp {
    constructor(colorRamp) {
        if (colorRamp == undefined) {
            this.colorStops = [];
        } else {
            this.colorStops = colorRamp;
        }
    }

    static toEquallySpaced(colors) {
        const colorRamp = new ColorRamp();
        const spacing = 1 / (colors.length - 1);
        for (let i = 0; i < colors.length; i++) {
            colorRamp.colorStops.push(new ColorStop(colors[i], spacing * i));
        }
        return colorRamp;
    }

    append(colorStop) {
        this.colorStops.push(colorStop);
    }
}

export class MetaCanvas {
    constructor({ smoothRadius = 15, gain = 0, contrast = 0.1, steps = 5, colorRamp = ColorRamp.toEquallySpaced([new THREE.Color("black"), new THREE.Color("white")]) }) {
        this.container = document.getElementById("meta-container");
        this.smoothRadius = smoothRadius;
        this.gain = gain;
        this.contrast = contrast;
        this.steps = steps;
        this.colorRamp = colorRamp;
        this.loadShaders();
    }

    async loadShaders() {
        const responseVertex = await fetch("./src/shaders/vertex.glsl");
        const responseFragment = await fetch("./src/shaders/fragment.glsl");

        this.vertex = await responseVertex.text();
        this.fragment_first = await responseFragment.text();

        this.metaElements = [];
        this.metaElementsMouse = [];
        this.buildSceneSdf();
        this.buildMain();

        this.setupThree();
    }

    buildSceneSdf() {
        this.fragment_sdf = "float sdfTotal(vec2 p) {\n";
        this.fragment_sdf += "\tfloat s = 3.402823466e+38;\n";

        let idCurrent = 0;

        document.querySelectorAll(".meta-box").forEach(element => {
            let box = new MetaBox(element, idCurrent);
            this.metaElements.push(box);

            if (element.hasAttribute("updateMouse")) {
                this.metaElementsMouse.push(box);
            }

            this.fragment_sdf += "\ts = smin(sdBox(p - vec2(array[" + idCurrent + "] + array[" + (idCurrent + 2) + "] / 2., array [" + (idCurrent + 1) + "] + array[" + (idCurrent + 3) + "] / 2.),";
            this.fragment_sdf += "vec2( array[" + (idCurrent + 2) + "] / 2., array[" + (idCurrent + 3) + "] / 2.)), s, smoothRadius);\n";

            idCurrent += 4;
        })

        document.querySelectorAll(".meta-box-rounded").forEach(element => {
            let box = new MetaBoxRounded(element, idCurrent);
            this.metaElements.push(box);

            if (element.hasAttribute("updateMouse")) {
                this.metaElementsMouse.push(box);
            }

            this.fragment_sdf += "\ts = smin(sdRoundedBox(p - vec2(array[" + idCurrent + "] + array[" + (idCurrent + 2) + "] / 2., array [" + (idCurrent + 1) + "] + array[" + (idCurrent + 3) + "] / 2.),";
            this.fragment_sdf += "vec2( array[" + (idCurrent + 2) + "] / 2., array[" + (idCurrent + 3) + "] / 2.), vec4(array[" + (idCurrent + 4) + "])), s, smoothRadius);\n";

            idCurrent += 5;
        })

        document.querySelectorAll(".meta-circle").forEach(element => {
            let box = new MetaCircle(element, idCurrent);
            this.metaElements.push(box);

            if (element.hasAttribute("updateMouse")) {
                this.metaElementsMouse.push(box);
            }

            this.fragment_sdf += "\ts = smin(sdCircle(p - vec2(array[" + idCurrent + "] + array[" + (idCurrent + 2) + "] / 2., array [" + (idCurrent + 1) + "] + array[" + (idCurrent + 2) + "] / 2.), array[" + (idCurrent + 2) + "] / 2.), s, smoothRadius);\n";

            idCurrent += 3;
        })

        document.querySelectorAll(".meta-text").forEach(element => {
            let box = new MetaText(element, idCurrent);
            this.metaElements.push(box);

            if (element.hasAttribute("updateMouse")) {
                this.metaElementsMouse.push(box);
            }

            const string = element.innerHTML;
            const scale = (900 / element.offsetHeight).toFixed(6);
            let advanceCurrent = 0;
            this.fragment_sdf += "\tfloat text" + idCurrent + " = 3.402823466e+38;\n";

            for (let i = 0; i < string.length; i++) {
                const char = string.charAt(i);
                if (char in MetaText.letters) {

                    this.fragment_sdf += "\ttext" + idCurrent + " = smin(" + MetaText.letters[char].function + "(((p - vec2(array[" + idCurrent + "], array[" + (idCurrent + 1) + "] - " + "(200. / array[" + (idCurrent + 2) + "]))) * - array[" + (idCurrent + 2) + "]) + vec2(" + advanceCurrent.toFixed(6) + ", 0.)) / array[" + (idCurrent + 2) + "], text" + idCurrent + ", d / 8. / array[" + (idCurrent + 2) + "]);\n";
                    advanceCurrent += MetaText.letters[char].advance;
                } else if (char == " ") {
                    advanceCurrent += 180;
                } else {
                    this.fragment_sdf += "\ttext" + idCurrent + " = smin(sdNotDefined(((p - vec2(array[" + idCurrent + "], array[" + (idCurrent + 1) + "] - (200. / array[" + (idCurrent + 2) + "]))) * - array[" + (idCurrent + 2) + "]) + vec2(" + advanceCurrent.toFixed(6) + ", 0.)) / array[" + (idCurrent + 2) + "], text" + idCurrent + ", d / 8. / array[" + (idCurrent + 2) + "]);\n";
                    advanceCurrent += 180;
                }
            }

            this.fragment_sdf += "\ts = smin(text" + idCurrent + ", s, smoothRadius);\n";
            idCurrent += 3;
        })

        this.fragment_sdf = "uniform float[" + idCurrent + "] array;\n" + this.fragment_sdf;
        this.fragment_sdf += "\treturn s;\n}"
        this.arraySize = idCurrent;
    }

    buildMain() {
        this.fragment_main =
            `         
void main() { 
    const vec2 subPixleOffsets[] = vec2[]( 
        vec2(0.375,0.125)-vec2(0.5),
        vec2(0.875,0.375)-vec2(0.5),
        vec2(0.125,0.625)-vec2(0.5),
        vec2(0.625,0.875)-vec2(0.5)
    );
    vec2 pixelSize = vec2(1.) / resolution;

    float sdfSum = 0.;
    vec2 pos = resolution * (vUv * vec2(1., -1.) + vec2(0., 1.));
    vec2 posOffset;

    for (int i = 0; i < subPixleOffsets.length(); i++) {
        posOffset = pos + subPixleOffsets[i] * pixelSize;
        sdfSum += sdfTotal(posOffset);
    }

    sdfSum /= float(subPixleOffsets.length());
    sdfSum += gain;
    sdfSum *= contrast;

    sdfSum = floor(sdfSum * steps) / steps;

    ColorStop[] colors = ColorStop[](
`;
        for (let i = 0; i < this.colorRamp.colorStops.length; i++) {
            const e = this.colorRamp.colorStops[i];
            this.fragment_main += "\t\t\tColorStop(vec3(" + e.color.r.toFixed(6) + ", " + e.color.g.toFixed(6) + ", " + e.color.b.toFixed(6) + "), " + e.t.toFixed(6) + ")";
            if (i != this.colorRamp.colorStops.length - 1) {
                this.fragment_main += ",\n";
            }
        };

        this.fragment_main +=
            `);
    vec3 finalColor;
    COLOR_RAMP(colors, sdfSum, finalColor);

    gl_FragColor = vec4(finalColor, 1.);
}`;
    }

    setupThree() {
        this.camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -1000, 1000);
        this.camera.position.z = 1;

        this.scene = new THREE.Scene();
        this.geometry = new THREE.PlaneGeometry(1, 1);

        const uniforms = {
            resolution: { type: "vec2", value: new THREE.Vector2() },
            time: { type: "float", value: 0 },
            smoothRadius: { type: "float", value: this.smoothRadius / 4 },
            gain: { type: "float", value: this.gain },
            contrast: { type: "float", value: this.contrast },
            steps: { type: "float", value: this.steps },
            array: { value: new Float32Array(this.arraySize) }
        };

        this.material = new THREE.ShaderMaterial({
            fragmentShader: this.fragment_first + this.fragment_sdf + this.fragment_main,
            vertexShader: this.vertex,
            uniforms: uniforms,
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);

        this.renderer = new THREE.WebGLRenderer({ antialias: false });
        this.renderer.setSize(this.width, this.height);
        this.container.appendChild(this.renderer.domElement);

        window.addEventListener("resize", this.resize.bind(this));
        this.resize();
        document.addEventListener("mousemove", this.mouseMove.bind(this));
        document.addEventListener("scroll", this.scroll.bind(this));

        this.start = undefined;
        this.metaElements.forEach(e => e.update(this.material.uniforms.array.value));

        this.render();
    }

    render(timeStamp) {
        if (this.start == undefined) {
            this.start = timeStamp;
        }
        const elapsed = timeStamp - this.start;

        this.material.uniforms.time.value = elapsed;
        this.renderer.render(this.scene, this.camera);

        window.requestAnimationFrame(this.render.bind(this));
    }

    resize() {
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;
        this.renderer.setSize(width, height);

        this.material.uniforms.resolution.value.x = width;
        this.material.uniforms.resolution.value.y = height;

        this.metaElements.forEach(e => e.update(this.material.uniforms.array.value));
    }

    scroll() {
        this.metaElements.forEach(e => e.update(this.material.uniforms.array.value));
    }

    mouseMove() {
        this.metaElementsMouse.forEach(e => e.update(this.material.uniforms.array.value));
    }

    update() {
        this.metaElements.forEach(e => e.update(this.material.uniforms.array.value));
    }

    setSmoothRadius(r) {
        this.material.uniforms.smoothRadius.value = r / 4;
        this.smoothRadius = r;
    }

    setGain(g) {
        this.material.uniforms.gain.value = g;
        this.gain = g;
    }

    setContrast(c) {
        this.material.uniforms.contrast.value = c;
        this.contrast = c;
    }

    setSteps(s) {
        this.material.uniforms.steps.value = s;
        this.steps = s;
    }

    setColorRamp(colorRamp) {
        this.colorRamp = colorRamp;
        this.buildMain(colorRamp);

        const uniforms = {
            resolution: { type: "vec2", value: new THREE.Vector2() },
            time: { type: "float", value: 0 },
            smoothRadius: { type: "float", value: this.smoothRadius / 4 },
            gain: { type: "float", value: this.gain },
            contrast: { type: "float", value: this.contrast },
            steps: { type: "float", value: this.steps },
            array: { value: new Float32Array(this.arraySize) }
        };

        this.material = new THREE.ShaderMaterial({
            fragmentShader: this.fragment_first + this.fragment_sdf + this.fragment_main,
            vertexShader: this.vertex,
            uniforms: uniforms,
        });

        this.mesh.material = this.material;
        this.resize();
    }
}