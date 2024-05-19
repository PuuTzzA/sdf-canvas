uniform vec4 resolution;
uniform float time;
uniform sampler2D matcap;
uniform vec2 mouse;
varying vec2 vUv;

// stammfunktionen
vec2 rotate2d(vec2 v, float a) {
    float s = sin(a);
    float c = cos(a);
    mat2 m = mat2(c, s, -s, c);
    return m * v;
}

float smin(float a, float b, float k) {
    k *= 1.0 / (1.0 - sqrt(0.5));
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - k * 0.5 * (1.0 + h - sqrt(1.0 - h * (h - 2.0)));
}

float sdCircle(vec2 p, float r) {
    return length(p) - r;
}

float sdBox(in vec2 p, in vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sdRoundedBox(in vec2 p, in vec2 b, in vec4 r) {
    r.xy = (p.x > 0.0) ? r.xy : r.zw;
    r.x = (p.y > 0.0) ? r.x : r.y;
    vec2 q = abs(p) - b + r.x;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
}

float sdRing(in vec2 p, in vec2 n, in float r, float th) {
    p.x = abs(p.x);

    p = mat2x2(n.x, n.y, -n.y, n.x) * p;

    return max(abs(length(p) - r) - th * 0.5, length(vec2(p.x, max(0.0, abs(r - p.y) - th * 0.5))) * sign(p.x));
}

// kleinbuchstaben
const float d = 45.;
const float _h = 365.;
const vec2 scale = 1500. * vec2(-1., 1.);
const float pi = 3.1415926535897932384626433832795;

float sda(in vec2 p) {
    float a = sdRing(p + vec2(d * 1.5, -_h - d * 1.5), vec2(cos(pi / 2.), sin(pi / 2.)), d, d); // ring top
    a = min(sdRoundedBox(p + vec2(d / 2., -d * 1.5 - _h + 115. / 2.), vec2(d / 2., 115. / 2.), vec4(0., d / 2., 0., d / 2.)), a);
    a = min(sdBox(p + vec2(d * 2.5, -_h / 2. - d * 1.5), vec2(d / 2., _h / 2.)), a); // rectangle right
    a = min(sdRing(p + vec2(d * 1.5, -d * 1.5), vec2(cos(pi / -2.), sin(pi / -2.)), d, d), a); // ring bottom
    a = smin(sdBox(p + vec2(d * 1.75, -137.5 - d * 2.5), vec2(d / 4., d / 2.)), a, d / 8.); // small rectangle middle
    a = min(sdBox(p + vec2(d / 2., -137.5 / 2. - d * 1.5), vec2(d / 2., 137.5 / 2.)), a); // rectangle left bottom
    a = min(sdRing(rotate2d(p + vec2(d * 1.5, -137.5 - d * 1.5), pi / 4.), vec2(cos(pi / 4.), sin(pi / 4.)), d, d), a); // quarter ring
    return a;
}

float sdb(in vec2 p) {
    float b = sdRing(p + vec2(d * 1.5, -d * 1.5), vec2(cos(pi / -2.), sin(pi / -2.)), d, d); // ring bottom
    b = min(sdRoundedBox(p + vec2(d / 2., -632.5 / 2. - d * 1.5), vec2(d / 2., 632.5 / 2.), vec4(d / 2., 0., d / 2., 0.)), b); // rectangle left
    b = smin(sdBox(p + vec2(d * 1.25, -_h - d * 2.5), vec2(d / 4., d / 2.)), b, d / 8.); // small rectangle middle
    b = min(sdBox(p + vec2(d * 2.5, -_h / 2. - d * 1.5), vec2(d / 2., _h / 2.)), b); // rectangle left
    b = min(sdRing(rotate2d(p + vec2(d * 1.5, -_h - d * 1.5), -pi / 4.), vec2(cos(pi / 4.), sin(pi / 4.)), d, d), b); // quarter ring
    return b;
}

float sdc(in vec2 p) {
    float c = sdRing(p + vec2(d * 1.5, -d * 1.5), vec2(cos(pi / -2.), sin(pi / -2.)), d, d); // ring bottom
    c = min(sdBox(p + vec2(d / 2., -_h / 2. - d * 1.5), vec2(d / 2., _h / 2.)), c); // rectangle left
    c = min(sdRing(p + vec2(d * 1.5, -_h - d * 1.5), vec2(cos(pi / 2.), sin(pi / 2.)), d, d), c); // ring top
    c = min(sdRoundedBox(p + vec2(d * 2.5, -d * 2.25), vec2(d / 2., d * 0.75), vec4(d / 2., 0., d / 2., 0.)), c); // box bottom
    c = min(sdRoundedBox(p + vec2(d * 2.5, -_h - d * 0.75), vec2(d / 2., d * 0.75), vec4(0., d / 2., 0., d / 2.)), c); // box top
    return c;
}

float sdd(in vec2 p) {
    return sdb(p * vec2(-1., 1.) + vec2(-d * 3., 0.));
}

float sde(in vec2 p) {
    return sda(p * vec2(-1., -1.) + vec2(-d * 3., d * 3. + _h));
}

float sdf(in vec2 p) {
    float f = sdRoundedBox(p + vec2(d / 2., -632.5 / 2.), vec2(d / 2., 632.5 / 2.), vec4(0., d / 2., 0., d / 2.)); // rectangle
    f = min(sdRing(p + vec2(d * 1.5, -632.5), vec2(cos(pi / 2.), sin(pi / 2.)), d, d), f); // ring top
    f = min(sdRoundedBox(p + vec2(d * 2.5, -632.5 + d / 2.), vec2(d / 2., d / 2.), vec4(0., d / 2., 0., d / 2.)), f); // box bottom
    f = smin(sdRoundedBox(p + vec2(157.5 / 2. - d, -545. + d / 2.), vec2(157.5 / 2., d / 2.), vec4(d / 2.)), f, d / 8.); // crossbar
    return f;
}

float sdg(in vec2 p) {
    float g = sdRing(p + vec2(d * 1.5, -432.5), vec2(cos(pi / 2.), sin(pi / 2.)), d, d); // ring top
    g = min(sdBox(p + vec2(d * 2.5, -150.), vec2(d / 2., 565. / 2.)), g); // rectangle right
    g = smin(sdBox(p + vec2(d * 1.75, -d / 2.), vec2(d / 4., d / 2.)), g, d / 8.); // rectangle bot
    g = min(sdRing(rotate2d(p + vec2(d * 1.5, d * -1.5), pi * 0.75), vec2(cos(pi / 4.), sin(pi / 4.)), d, d), g); // quarter ring
    g = min(sdBox(p + vec2(d / 2., -_h / 2. - d * 1.5), vec2(d / 2., _h / 2.)), g); // rectangle left
    g = min(sdRing(p + vec2(d * 1.5, 132.5), vec2(cos(pi / -2.), sin(pi / -2.)), d, d), g); // ring bottom
    g = min(sdRoundedBox(p + vec2(d / 2., 132.5 - d / 2.), vec2(d / 2., d * 0.75), vec4(d / 2., 0., d / 2., 0.)), g); // box bottom
    return g;
}

float sdh(in vec2 p) {
    float h = sdRoundedBox(p + vec2(d / 2., -700. / 2.), vec2(d / 2., 700. / 2.), vec4(d / 2.)); // rectangle left
    h = smin(sdBox(p + vec2(d * 1.25, -_h - d * 2.5), vec2(d / 4., d / 2.)), h, d / 8.); // small rectangle middle
    h = min(sdRoundedBox(p + vec2(d * 2.5, -432.5 / 2.), vec2(d / 2., 432.5 / 2.), vec4(0., d / 2., 0., d / 2.)), h); // rectangle left
    h = min(sdRing(rotate2d(p + vec2(d * 1.5, -_h - d * 1.5), -pi / 4.), vec2(cos(pi / 4.), sin(pi / 4.)), d, d), h); // quarter ring
    return h;
}

// testing

float sdCross(vec2 p) {
    float bar1 = sdRoundedBox(p, vec2(5. * d / 2., d / 2.), vec4(d / 2.));
    float bar2 = sdRoundedBox(p, vec2(d / 2., 5. * d / 2.), vec4(d / 2.));
    bar2 = smin(bar1, bar2, d / 8.);
    return bar2;
}

float sdfTotal(vec2 p) {
    float t = 3.1415 / 1.5;
    vec2 mousevec = p - scale * vec2(mouse * resolution.zw);
    float cursor = sdCross(mousevec);
    cursor = sdf(mousevec);

    float test = sdh(p);

    float sdf = smin(cursor, test, d);
    sdf = min(test, cursor);
    sdf = smin(test, cursor, d / 8.);
    return sdf;
}

void main() {
    float res = 600.;
    vec2 pos = floor((res * (vUv - vec2(0.5))) * resolution.zw) / res;
    pos = scale * (vUv - vec2(0.5)) * resolution.zw;
    float col = 1.;

    if(sdfTotal(pos) > 0.) {
        col = 0.;
    }
    gl_FragColor = vec4(vec3(col), 1.);
}