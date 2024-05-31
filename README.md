# SDF-canvas
inspired by [2024 MSI](https://www.youtube.com/watch?v=ETQ9LME7UzQ)

[sandbox/example](https://puutzza.github.io/sdf-canvas/)

![moin](https://github.com/PuuTzzA/sdf-canvas/blob/main/gifs/text.gif?raw=true)
*example output*

## Premise
This repo provides an easy way to "convert" HTML-elements into signed distance fields. By converting elements into sdf's you can easily achieve a metaball like effect. 

## Getting Started

In your HTML-Document create a div with id _meta-container_, where the canvas will live ...
```html
    <div id="meta-container"></div>
```
... and include [Three.js](https://threejs.org/) and the meta-logig.js file.

```html
    <script type="importmap">
        {
          "imports": {
            "three": "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.164.1/three.module.js",
            "three/addons/": "https://cdn.jsdelivr.net/npm/three@<version>/examples/jsm/"
          }
        }
    </script>
    <script type="module" src="src/meta-logic.js"></script>
```

In your script you can then simply import the MetaCanvas class and create the canvas.


```js
    import { MetaCanvas, ColorRamp, ColorStop } from "./meta-logic.js";
    const metaCanvas = new MetaCanvas({});
```

## Meta-Elements
You can mark the HTML-elements that you want to include in the sdf with classes. Currently there are four supported classes:

- #### meta-circle:
    A circle that appears wherever the element is placed in the document. If the width and height of the element do not equal the width gets used as the diameter of the circle with the sdf-circle being tugged into the top left corner of the element. e.g:
```html
    <div class="meta-circle"></div>
```
- #### meta-box:
    A rectangle that takes up the same space as the bounding-box of its respective HTML-element. e.g:
```html
    <div class="meta-box"></div>
```
- #### meta-box-rounded
    Similar to meta-box, but with rounded corners, the radius of which can be adjusted with the HTML-attribute _r_. e.g:
```html
    <div class="meta-box-rounded" r="15"></div>
```
- #### meta-text 
    The main attraction. SDF-text! Currently only lowercase letters are supported, that render in a custom font, that was specifically designed with no sharp corners. The original font file can be found in [./src/fonts/metaball_font.ttf](./src/fonts/metaball_font.ttf) (The font file includes all of ASCII).
    e.g:
```html
    <div class="meta-text">my sdf text</div>
```

In order to debug your element, you can attach the class _meta-debugb_ which shows where the objects should appear. e.g:

```html
    <div class="meta-text meta-debugb">my sdf text</div>
```

## JS
To get started you have to import the needed classes:
```js
    import { MetaCanvas, ColorRamp, ColorStop } from "./meta-logic.js";
```
_ColorRamp_ and _ColorStop_ are only needed if you want to change the colors. 
Then you can simply create a new MetaCanvas and you should see the result.
```js
    const metaCanvas = new MetaCanvas({});
```
You can pass following optional parameters into the constructor, with the default values being:
```js
{ smoothRadius = 15, 
  gain = 0, 
  contrast = 0.1, 
  steps = 5, 
  colorRamp = ColorRamp.toEquallySpaced([new THREE.Color("black"), new THREE.Color("white")]) }
```
All these parameters can also be changed with their respective setters. e.g:
```js
    metaCanvas.setSmoothRadius(40);
    metaCanvas.setGain(.2);
    metaCanvas.setContrast(2);
    metaCanvas.setSteps(500);
    metaCanvas.setColorRamp(new ColorRamp([new ColorStop(new THREE.Color("rgb(0, 0, 255)"), 0), new ColorStop(new THREE.Color("rgb(0, 255, 0)"), 1)]));
```

Normally all elements get updated on _resize_ and _scroll_. If your element changes whenever the mouse moves, you can attach the _updateMouse_ Attribute to update the element also on _mousemove_. e.g:
```html
    <div class="meta-text" updateMouse="">my sdf text</div>
```

Additionally, you can also update manually by calling the _update_ function of the canvas.
```js
    metaCanvas.update();
```

- #### smoothRadius
    Controls the radius of the metaball-effect (the flowing into another of elements).
- #### gain & contrast
    _gain_ can be used to "shift" the boundary up or down, making the elements bigger or smaller and _contrast_ changes the width of the boundary, where you can see the colors of the chosen ColorRamp.
    The color of a pixel get calculated according to this formula:
```js
    colorRamp(sdf(pixelPosition) * contrast + gain);
```
- #### steps
    Controls the number of discrete steps inside the boundary.

- #### colorRamp
    Controlls the Color of the output. A color ramp is a List of _ColorStops_. A Color Stop is a color with a value between 0 and 1 that controlls its position in the ramp. In this case the color is a [THREE.Color](https://threejs.org/docs/#api/en/math/Color) which can be initialised in many ways. The colors are interpolated linearly. The ColorRamp class provides a static function to generate a ColorRamp with equally spaced colors from a list of colors. Otherwise, a list can be passed into the Constructor or colors added with the function _append_. e.g:
```js
    const c = ColorRamp.toEquallySpaced([new THREE.Color("black"), new THREE.Color(0, 1, 0), new THREE.Color("white")]);
    c = new ColorRamp([new ColorStop(new THREE.Color("rgb(0, 0, 255)"), 0), new ColorStop(new THREE.Color("rgb(0, 255, 0)"), 0.7)]);
    c.append(new ColorStop(new THREE.Color("0xff0006"), 1)));
```
    
To play around with all the parameters, go to [this site](https://puutzza.github.io/sdf-canvas/).

## Implementation Details

The Class creates a [Three.js](https://threejs.org/) canvas with a single plane covering the whole screen. This plane has a ShaderMaterial that can be programmed completely by the user. On Setup the Fragment shader is generated procedually according to the meta-objects in the scene. The result is a single function that contains the SDF of the scene. This sdf is then called in every fragment and the resulting color calculated according to the previously stated formula. 4x MSAA was used to smooth out the edges. The position, scale, edge-radius, ... of all the elements and the global parameters of the MetaCanvas are passed as Uniforms and updated when changed or on events like _scroll_, _resize_ or _mousemove_. By doing this the expensive step of building and compiling the fragment shader has to be done only in the beginning and not every time something changes.
