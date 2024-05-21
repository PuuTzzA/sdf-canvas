uniform vec2 resolution;
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

float sdi(in vec2 p) {
    float i = sdRoundedBox(p + vec2(d / 2., -250.), vec2(d / 2., 250.), vec4(d / 2.));
    i = min(sdCircle(p + vec2(d / 2., -500. - d * 1.5), d / 2.), i);
    return i;
}

float sdj(in vec2 p) {
    float j = sdRoundedBox(p + vec2(d / 2., -183.75), vec2(d / 2., 632.5 / 2.), vec4(d / 2., 0., d / 2., 0.));
    j = min(sdRing(p + vec2(d * -0.5, 132.5), vec2(cos(pi / -2.), sin(pi / -2.)), d, d), j); // ring bottom
    j = min(sdRoundedBox(p + vec2(-d * 1.5, 98.75), vec2(d / 2., d * 0.75), vec4(d / 2., 0., d / 2., 0.)), j); // box bottom
    j = min(sdCircle(p + vec2(d / 2., -500. - d * 1.5), d / 2.), j);
    return j;
}

float sdk(in vec2 p) {
    float k = sdRoundedBox(p + vec2(d / 2., -350.), vec2(d / 2., 350.), vec4(d / 2.));
    k = smin(sdBox(p + vec2(d * 1.25, -295. - d), vec2(d / 4., d / 2.)), k, d / 8.);
    k = smin(sdBox(p + vec2(d * 1.25, -295. + d), vec2(d / 4., d / 2.)), k, d / 8.);
    k = min(sdRoundedBox(p + vec2(d * 2.5, -102.5), vec2(d / 2., 102.5), vec4(0., d / 2., 0., d / 2.)), k);
    k = min(sdRing(rotate2d(p + vec2(d * 1.5, -137.5 - d * 1.5), pi / -4.), vec2(cos(pi / 4.), sin(pi / 4.)), d, d), k); // quarter ring
    k = min(sdRing(rotate2d(p + vec2(d * 1.5, -137.5 - d * 5.5), pi * 1.25), vec2(cos(pi / 4.), sin(pi / 4.)), d, d), k); // quarter ring
    k = min(sdRoundedBox(p + vec2(d * 2.5, -385. - 115. / 2.), vec2(d / 2., 115. / 2.), vec4(d / 2., 0., d / 2., 0.)), k);
    return k;
}

float sdl(in vec2 p) {
    return sdRoundedBox(p + vec2(d / 2., -350.), vec2(d / 2., 350.), vec4(d / 2.));
}

float sdm(in vec2 p) {
    float m = sdRoundedBox(p + vec2(d / 2., -432.5 / 2.), vec2(d / 2., 432.5 / 2.), vec4(0, d / 2., 0., d / 2.));
    m = min(sdBox(p + vec2(d * 2.5, -432.5 - d), vec2(d, d * 0.5)), m);
    m = smin(sdRoundedBox(p + vec2(d * 2.5, -455. / 2.), vec2(d / 2., 455. / 2.), vec4(0, d / 2., 0., d / 2.)), m, d / 8.);
    m = min(sdRing(rotate2d(p + vec2(d * 1.5, -432.5), pi / 4.), vec2(cos(pi / 4.), sin(pi / 4.)), d, d), m); // quarter ring
    m = min(sdRing(rotate2d(p + vec2(d * 3.5, -432.5), pi / -4.), vec2(cos(pi / 4.), sin(pi / 4.)), d, d), m); // quarter ring
    m = min(sdRoundedBox(p + vec2(d * 4.5, -432.5 / 2.), vec2(d / 2., 432.5 / 2.), vec4(0, d / 2., 0., d / 2.)), m);
    return m;
}

float sdn(in vec2 p) {
    float n = sdRoundedBox(p + vec2(d / 2., -432.5 / 2.), vec2(d / 2., 432.5 / 2.), vec4(0, d / 2., 0., d / 2.));
    n = min(sdRoundedBox(p + vec2(d * 2.5, -432.5 / 2.), vec2(d / 2., 432.5 / 2.), vec4(0, d / 2., 0., d / 2.)), n);
    n = min(sdRing(p + vec2(d * 1.5, -_h - d * 1.5), vec2(cos(pi / 2.), sin(pi / 2.)), d, d), n); // ring top
    return n;
}

float sdo(in vec2 p) {
    float c = sdRing(p + vec2(d * 1.5, -d * 1.5), vec2(cos(pi / -2.), sin(pi / -2.)), d, d); // ring bottom
    c = min(sdBox(p + vec2(d / 2., -_h / 2. - d * 1.5), vec2(d / 2., _h / 2.)), c); // rectangle left
    c = min(sdRing(p + vec2(d * 1.5, -_h - d * 1.5), vec2(cos(pi / 2.), sin(pi / 2.)), d, d), c); // ring top
    c = min(sdBox(p + vec2(d * 2.5, -_h / 2. - d * 1.5), vec2(d / 2., _h / 2.)), c); // rectangle right
    return c;
}

float sdq(in vec2 p) {
    float g = sdRing(p + vec2(d * 1.5, -432.5), vec2(cos(pi / 2.), sin(pi / 2.)), d, d); // ring top
    g = min(sdRoundedBox(p + vec2(d * 2.5, -116.25), vec2(d / 2., 632.5 / 2.), vec4(0., d / 2., 0., d / 2.)), g); // rectangle right
    g = smin(sdBox(p + vec2(d * 1.75, -d / 2.), vec2(d / 4., d / 2.)), g, d / 8.); // rectangle bot
    g = min(sdRing(rotate2d(p + vec2(d * 1.5, d * -1.5), pi * 0.75), vec2(cos(pi / 4.), sin(pi / 4.)), d, d), g); // quarter ring
    g = min(sdBox(p + vec2(d / 2., -_h / 2. - d * 1.5), vec2(d / 2., _h / 2.)), g); // rectangle left
    return g;
}

float sdp(in vec2 p) {
    return sdq(p * vec2(-1., 1.));
}

float sdr(in vec2 p) {
    float m = sdRoundedBox(p + vec2(d / 2., -432.5 / 2.), vec2(d / 2., 432.5 / 2.), vec4(0, d / 2., 0., d / 2.));
    m = min(sdRing(rotate2d(p + vec2(d * 1.5, -432.5), pi / 4.), vec2(cos(pi / 4.), sin(pi / 4.)), d, d), m); // quarter ring
    m = min(sdCircle(p + vec2(d * 1.5, -500. + d / 2.), d / 2.), m);
    return m;
}

float sds(in vec2 p) {
    float c = sdRing(p + vec2(d * 1.5, -d * 1.5), vec2(cos(pi / -2.), sin(pi / -2.)), d, d); // ring bottom
    c = min(sdBox(p + vec2(d / 2., -342.5 - d), vec2(d / 2., d)), c);
    c = min(sdBox(p + vec2(d * 2.5, -67.5 - 185. / 2.), vec2(d / 2., 185. / 2.)), c);
    c = min(sdRing(p + vec2(d * 1.5, -_h - d * 1.5), vec2(cos(pi / 2.), sin(pi / 2.)), d, d), c); // ring top
    c = min(sdRoundedBox(p + vec2(d * 0.5, -67.5 - 162.5 / 2.), vec2(d / 2., 162.5 / 2.), vec4(d / 2., 0., d / 2., 0.)), c); // box bottom
    c = min(sdRoundedBox(p + vec2(d * 2.5, -_h - d * 0.75), vec2(d / 2., d * 0.75), vec4(0., d / 2., 0., d / 2.)), c); // box top
    c = min(sdRing(rotate2d(p + vec2(d * 1.5, -252.5 - d * 2.), pi * 0.75), vec2(cos(pi / 4.), sin(pi / 4.)), d, d), c);
    c = min(sdRing(rotate2d(p + vec2(d * 1.5, -252.5), pi * -0.25), vec2(cos(pi / 4.), sin(pi / 4.)), d, d), c);
    return c;
}

float sdt(in vec2 p) {
    float t = sdRoundedBox(p + vec2(0., -350.), vec2(d / 2., 350.), vec4(d / 2.));
    t = smin(sdRoundedBox(p + vec2(0., -500. - d / 4.), vec2(135. / 2., d / 2.), vec4(d / 2.)), t, d / 8.);
    return t;
}

float sdu(in vec2 p) {
    return sdn(p * -1. + vec2(d * -3., 500.));
}

float sdv(in vec2 p) {
    return sdn(p * -1. + vec2(d * -3., 500.));
}

float sdw(in vec2 p) {
    return sdm(p * vec2(1., -1.) + vec2(0., 500.));
}

float sdx(in vec2 p) {
    float n = sdRoundedBox(p + vec2(d / 2., -80.), vec2(d / 2., 80.), vec4(0, d / 2., 0., d / 2.));
    n = min(sdRoundedBox(p + vec2(d * 2.5, -80.), vec2(d / 2., 80.), vec4(0, d / 2., 0., d / 2.)), n);
    n = min(sdRing(p + vec2(d * 1.5, -80. - d * 1.5), vec2(cos(pi / 2.), sin(pi / 2.)), d, d), n); // ring bottom
    n = min(sdRing(p + vec2(d * 1.5, -272.5 - d * 1.5), vec2(cos(pi / -2.), sin(pi / -2.)), d, d), n); // ring top
    n = min(sdRoundedBox(p + vec2(d * .5, -80. - 340.), vec2(d / 2., 80.), vec4(d / 2., 0., d / 2., 0.)), n);
    n = min(sdRoundedBox(p + vec2(d * 2.5, -80. - 340.), vec2(d / 2., 80.), vec4(d / 2., 0., d / 2., 0.)), n);
    return n;
}

float sdy(in vec2 p) {
    float g = sdRoundedBox(p + vec2(d * 2.5, -150.), vec2(d / 2., 350.), vec4(d / 2.)); // rectangle right
    g = smin(sdBox(p + vec2(d * 1.75, -d / 2.), vec2(d / 4., d / 2.)), g, d / 8.); // rectangle bot
    g = min(sdRing(rotate2d(p + vec2(d * 1.5, d * -1.5), pi * 0.75), vec2(cos(pi / 4.), sin(pi / 4.)), d, d), g); // quarter ring
    g = min(sdRoundedBox(p + vec2(d / 2., -432.5 / 2. - d * 1.5), vec2(d / 2., 432.5 / 2.), vec4(d / 2., 0., d / 2., 0.)), g); // rectangle left
    return g;
}

float sdz(in vec2 p) {
    float c = sdRoundedBox(p + vec2(67.5 / 2., -500. + d / 2.), vec2(67.5 / 2., d / 2.), vec4(d / 2., d / 2., 0., 0.)); // ring bottom
    c = min(sdBox(p + vec2(d * 2.5, -342.5 - d), vec2(d / 2., d)), c);
    c = min(sdBox(p + vec2(d * 0.5, -67.5 - 185. / 2.), vec2(d / 2., 185. / 2.)), c);
    c = min(sdRing(rotate2d(p + vec2(d * 1.5, -252.5 - d * 2.), pi * -0.75), vec2(cos(pi / 4.), sin(pi / 4.)), d, d), c);
    c = min(sdRing(rotate2d(p + vec2(d * 1.5, -252.5), pi * 0.25), vec2(cos(pi / 4.), sin(pi / 4.)), d, d), c);
    c = min(sdRoundedBox(p + vec2(67.5  * 1.5, -d / 2.), vec2(67.5 / 2., d / 2.), vec4(0., 0., d / 2., d / 2.)), c);
    c = min(sdRing(rotate2d(p + vec2(d * 1.5, -500. + d * 1.5), pi * -0.25), vec2(cos(pi / 4.), sin(pi / 4.)), d, d), c);
    c = min(sdRing(rotate2d(p + vec2(d * 1.5, -d * 1.5), pi * 0.75), vec2(cos(pi / 4.), sin(pi / 4.)), d, d), c);
    return c;
}

float sdNotDefined(in vec2 p) {
    return sdRoundedBox(p + vec2(d * 1.5, -350.), vec2(d * 1.5, 350.), vec4(d / 2.));
}

// testing
const vec2 scale = 3500. * vec2(-1., 1.);

float sdCross(vec2 p) {
    float bar1 = sdRoundedBox(p, vec2(5. * d / 2., d / 2.), vec4(d / 2.));
    float bar2 = sdRoundedBox(p, vec2(d / 2., 5. * d / 2.), vec4(d / 2.));
    bar2 = smin(bar1, bar2, d / 8.);
    return bar2;
}

/* float sdfTotal(vec2 p) {
    float t = 3.1415 / 1.5;
    vec2 mousevec = (p - vec2(array[0], array[1]));
    float cursor = sdCross(mousevec * 2.);



    return cursor;
} */

/* void main() {
    vec2 pos = resolution * (vUv * vec2(1., -1.) + vec2(0., 1.));
    gl_FragColor = vec4(vec3(0.), 1.);


    if(sdfTotal(pos) < 0.) {
        gl_FragColor = vec4(vec3(1.), 1.);
    }
} */