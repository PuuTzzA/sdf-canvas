import * as THREE from 'three';
let vertex, fragment;

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

// Three JS 
class Sketch {
    constructor() {
        this.container = document.getElementById("container");
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        let frustumSize = 1;
        this.camera = new THREE.OrthographicCamera(-frustumSize / 2, frustumSize / 2, frustumSize / 2, -frustumSize / 2, -1000, 1000);
        this.camera.position.z = 1;

        this.scene = new THREE.Scene();

        this.geometry = new THREE.PlaneGeometry(1, 1);

        this.uniforms = {
            resolution: { type: "vec4", value: new THREE.Vector4() },
            time: { type: "float", value: 0 },
            matcap: { type: "sampler2d", value: new THREE.TextureLoader().load("./src/matcap.png") },
            mouse: { type: "vec2", value: new THREE.Vector2(0, 0) },
        }

        this.material = new THREE.ShaderMaterial({
            fragmentShader: fragment,
            vertexShader: vertex,
            uniforms: this.uniforms
        })

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

        let a1, a2;
        const aspect = 1;
        if (this.height / this.width > aspect) {
            a1 = this.width / this.height;
            a2 = 1;
        } else {
            a1 = 1;
            a2 = this.height / this.width;
        }
        this.material.uniforms.resolution.value.x = this.width;
        this.material.uniforms.resolution.value.y = this.height;
        this.material.uniforms.resolution.value.z = a1;
        this.material.uniforms.resolution.value.w = a2;
    }

    mouseMove(event) {
        this.material.uniforms.mouse.value.x = event.pageX / this.width - 0.5;
        this.material.uniforms.mouse.value.y = - event.pageY / this.height + 0.5;
    }
}