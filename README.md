# SDF-canvas
inspired by [2024 MSI](https://www.youtube.com/watch?v=ETQ9LME7UzQ)

![moin](https://github.com/PuuTzzA/sdf-canvas/blob/main/gifs/text.gif?raw=true)
*example output*

## Premise
This repo provides an easy way to "convert" HTML-elements into signed distance fields. By converting elements into sdf's you can easily achieve a metaball like effect. 

## Overview
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

In order to debug your element you can attach the class _meta-debugb_ whitch shows where the objects should appear. e.g:

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
All of these parameters can also be changed with their respective setters. e.g:
```js
metaCanvas.setSmoothRadius(40);
metaCanvas.setGain(.2);
metaCanvas.setContrast(2);
metaCanvas.setSteps(500);
metaCanvas.setColorRamp(new ColorRamp([new ColorStop(new THREE.Color("rgb(0, 0, 255)"), 0), new ColorStop(new THREE.Color("rgb(0, 255, 0)"), 1)]));
```
