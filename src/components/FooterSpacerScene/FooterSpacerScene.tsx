import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './FooterSpacerScene.css';

const FooterSpacerScene = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsActive(true);
          io.disconnect();
        }
      },
      { rootMargin: '300px 0px' }
    );
    io.observe(wrapper);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;

    if (!wrapper || !canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      wrapper.clientWidth / wrapper.clientHeight,
      1,
      500
    );
    camera.position.set(0, 20, 50);
    camera.lookAt(0, 0, 0);

    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    const AMOUNTX = Math.max(120, Math.round(550 * (wrapper.clientWidth / 1440)));
    const AMOUNTZ = isMobile ? 60 : 100;
    const SEPARATION = 1.0;

    const numParticles = AMOUNTX * AMOUNTZ;
    const positions = new Float32Array(numParticles * 3);
    const scales = new Float32Array(numParticles);

    let i = 0,
      j = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iz = 0; iz < AMOUNTZ; iz++) {
        positions[i] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        positions[i + 1] = 0;
        positions[i + 2] = iz * SEPARATION - (AMOUNTZ * SEPARATION) / 2;
        scales[j] = 1;
        i += 3;
        j++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const uTime = { value: 0 };
    const uMouse = { value: new THREE.Vector2(-10, -10) };

    const material = new THREE.ShaderMaterial({
      uniforms: { uTime, uMouse },
      vertexShader: `
                uniform float uTime;
                uniform vec2 uMouse;
                attribute float scale;
                varying vec3 vColor;

                vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
                float snoise(vec2 v){
                    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                    vec2 i  = floor(v + dot(v, C.yy) );
                    vec2 x0 = v -   i + dot(i, C.xx);
                    vec2 i1;
                    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                    vec4 x12 = x0.xyxy + C.xxzz;
                    x12.xy -= i1;
                    i = mod(i, 289.0);
                    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                    m = m*m ; m = m*m ;
                    vec3 x = 2.0 * fract(p * C.www) - 1.0;
                    vec3 h = abs(x) - 0.5;
                    vec3 ox = floor(x + 0.5);
                    vec3 a0 = x - ox;
                    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                    vec3 g;
                    g.x  = a0.x  * x0.x  + h.x  * x0.y;
                    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                    return 130.0 * dot(m, g);
                }

                void main() {
                    vec3 p = position;
                    float n = snoise(p.xz * 0.03 + uTime * 0.08);
                    p.y = n * 2.0;

                    vec4 mvp = modelViewMatrix * vec4(p, 1.0);
                    vec4 projected = projectionMatrix * mvp;
                    vec2 screenPos = projected.xy / projected.w;

                    float h = (p.y + 2.0) / 4.0;
                    float dist = distance(screenPos, uMouse);
                    float radius = 0.5;
                    if (dist < radius) {
                        float force = pow(1.0 - dist / radius, 2.5);
                        float depthFactor = 1.0 + abs(mvp.z) * 0.03;
                        vec2 dir = normalize(uMouse - screenPos);
                        p.x += dir.x * force * 6.0 * depthFactor;
                        p.z += dir.y * force * 6.0 * depthFactor;
                    }

                    vColor = mix(vec3(0.45), vec3(1.0), smoothstep(0.0, 1.0, h));
                    vec4 finalMv = modelViewMatrix * vec4(p, 1.0);
                    gl_Position = projectionMatrix * finalMv;
                    gl_PointSize = scale * (2.0 + h * 2.0) * (45.0 / max(1.0, -finalMv.z));
                }
            `,
      fragmentShader: `
                varying vec3 vColor;
                void main() {
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    if (length(coord) > 0.5) discard;
                    float alpha = smoothstep(0.5, 0.35, length(coord));
                    gl_FragColor = vec4(vColor, alpha * 0.85);
                }
            `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const rect = wrapper.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      if (
        event.clientX >= rect.left - 50 &&
        event.clientX <= rect.right + 50 &&
        event.clientY >= rect.top - 50 &&
        event.clientY <= rect.bottom + 50
      ) {
        uMouse.value.set(x, y);
      } else {
        uMouse.value.set(-10, -10);
      }
    };

    const handlePointerLeave = () => {
      uMouse.value.set(-10, -10);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);

    const renderSingleFrame = () => {
      renderer.render(scene, camera);
    };

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      const width = rect.width || 1;
      const height = rect.height || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderSingleFrame();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrapper);

    let frameId = 0;
    let isVisible = false;
    const startedAt = performance.now();

    const animate = () => {
      if (!isVisible) return;
      const elapsed = (performance.now() - startedAt) / 1000;
      uTime.value = elapsed;
      renderSingleFrame();
      frameId = requestAnimationFrame(animate);
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? false;
        if (isVisible) {
          frameId = requestAnimationFrame(animate);
        } else {
          cancelAnimationFrame(frameId);
        }
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(wrapper);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [isActive]);

  return (
    <div className="footer-spacer-scene" ref={wrapperRef} aria-hidden="true">
      <canvas ref={canvasRef} className="footer-spacer-scene__canvas" data-engine="three.js" />
      <div className="footer-spacer-scene__veil" />
    </div>
  );
};

export default FooterSpacerScene;
