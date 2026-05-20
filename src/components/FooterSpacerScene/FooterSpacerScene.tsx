'use client';

import { useEffect, useRef } from 'react';
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Points,
  BufferGeometry,
  BufferAttribute,
  ShaderMaterial,
  Vector2,
  AdditiveBlending,
} from 'three';
import { vertexShader, fragmentShader } from './shaders.glsl';
import './FooterSpacerScene.css';

const FooterSpacerScene = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    let cleanupThree: (() => void) | null = null;

    const initObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        initObserver.disconnect();

        const renderer = new WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const scene = new Scene();
        const camera = new PerspectiveCamera(
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

        let i = 0, j = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
          for (let iz = 0; iz < AMOUNTZ; iz++) {
            positions[i]     = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
            positions[i + 1] = 0;
            positions[i + 2] = iz * SEPARATION - (AMOUNTZ * SEPARATION) / 2;
            scales[j] = 1;
            i += 3;
            j++;
          }
        }

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(positions, 3));
        geometry.setAttribute('scale', new BufferAttribute(scales, 1));

        const uTime = { value: 0 };
        const uMouse = { value: new Vector2(-10, -10) };

        const material = new ShaderMaterial({
          uniforms: { uTime, uMouse },
          vertexShader,
          fragmentShader,
          transparent: true,
          depthWrite: false,
          blending: AdditiveBlending,
        });

        scene.add(new Points(geometry, material));

        const handlePointerMove = (event: PointerEvent) => {
          if (event.pointerType === 'touch') return;
          const rect = wrapper.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          const inRange =
            event.clientX >= rect.left - 50 &&
            event.clientX <= rect.right + 50 &&
            event.clientY >= rect.top - 50 &&
            event.clientY <= rect.bottom + 50;
          uMouse.value.set(inRange ? x : -10, inRange ? y : -10);
        };

        const handlePointerLeave = () => uMouse.value.set(-10, -10);

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerleave', handlePointerLeave);

        const renderSingleFrame = () => renderer.render(scene, camera);

        const resizeObserver = new ResizeObserver(() => {
          const rect = wrapper.getBoundingClientRect();
          const width = rect.width || 1;
          const height = rect.height || 1;
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderSingleFrame();
        });
        resizeObserver.observe(wrapper);

        let frameId = 0;
        const startedAt = performance.now();

        const animate = () => {
          uTime.value = (performance.now() - startedAt) / 1000;
          renderSingleFrame();
          frameId = requestAnimationFrame(animate);
        };

        const visibilityObserver = new IntersectionObserver(
          ([e]) => {
            if (e?.isIntersecting) {
              frameId = requestAnimationFrame(animate);
            } else {
              cancelAnimationFrame(frameId);
            }
          },
          { threshold: 0 }
        );
        visibilityObserver.observe(wrapper);

        cleanupThree = () => {
          cancelAnimationFrame(frameId);
          resizeObserver.disconnect();
          visibilityObserver.disconnect();
          window.removeEventListener('pointermove', handlePointerMove);
          window.removeEventListener('pointerleave', handlePointerLeave);
          geometry.dispose();
          material.dispose();
          renderer.dispose();
        };
      },
      { rootMargin: '300px 0px' }
    );

    initObserver.observe(wrapper);

    return () => {
      initObserver.disconnect();
      cleanupThree?.();
    };
  }, []);

  return (
    <div className="footer-spacer-scene" ref={wrapperRef} aria-hidden="true">
      <canvas ref={canvasRef} className="footer-spacer-scene-canvas" data-engine="three.js" />
      <div className="footer-spacer-scene-veil" />
    </div>
  );
};

export default FooterSpacerScene;
