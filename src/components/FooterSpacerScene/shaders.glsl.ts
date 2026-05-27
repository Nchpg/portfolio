export const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uLightMode;
uniform vec2 uMouse;
attribute float scale;
varying vec3 vColor;

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m; m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main() {
    vec3 p = position;
    p.y = snoise(p.xz * 0.03 + uTime * 0.08) * 2.0;

    float h = (p.y + 2.0) * 0.25;
    vColor = mix(vec3(1.0), vec3(0.18), uLightMode);

    vec4 mvp = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * mvp;
    vec2 screenPos = clip.xy / clip.w;

    // use dot() to avoid sqrt on the ~95% of particles outside mouse radius
    const float RADIUS = 0.5;
    vec2 diff = screenPos - uMouse;
    float distSq = dot(diff, diff);
    if (distSq < RADIUS * RADIUS) {
        float dist = sqrt(distSq);
        float t = 1.0 - dist / RADIUS;
        float force = t * t * sqrt(t);               // t^2.5 without pow()
        float depthFactor = 1.0 + abs(mvp.z) * 0.03;
        vec2 dir = -diff / dist;                     // normalize, reuses dist
        p.x += dir.x * force * 6.0 * depthFactor;
        p.z += dir.y * force * 6.0 * depthFactor;
        mvp = modelViewMatrix * vec4(p, 1.0);        // recompute only when displaced
    }

    gl_Position = projectionMatrix * mvp;
    gl_PointSize = scale * (2.0 + h * 2.0) * (45.0 / max(1.0, -mvp.z));
}
`;

export const fragmentShader = /* glsl */ `
uniform float uLightMode;
varying vec3 vColor;

void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float lenSq = dot(coord, coord);
    if (lenSq > 0.25) discard;
    float len = sqrt(lenSq);
    float alpha = smoothstep(0.5, 0.35, len);
    gl_FragColor = vec4(vColor, alpha * mix(0.85, 0.95, uLightMode));
}
`;
