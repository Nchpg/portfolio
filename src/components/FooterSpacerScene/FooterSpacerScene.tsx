"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { vertexShader, fragmentShader } from "./shaders.glsl";
import "./FooterSpacerScene.css";

// --- Minimal column-major mat4 helpers (ported from gl-matrix) -----------
// Replaces three.js' PerspectiveCamera / matrix math for this single scene.

function perspective(
  fovy: number,
  aspect: number,
  near: number,
  far: number,
): Float32Array {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  // prettier-ignore
  return new Float32Array([
    f / aspect, 0, 0,                    0,
    0,          f, 0,                    0,
    0,          0, (far + near) * nf,   -1,
    0,          0, 2 * far * near * nf,  0,
  ]);
}

function lookAt(
  eye: [number, number, number],
  center: [number, number, number],
  up: [number, number, number],
): Float32Array {
  const [ex, ey, ez] = eye;
  const [cx, cy, cz] = center;
  const [ux, uy, uz] = up;

  let z0 = ex - cx,
    z1 = ey - cy,
    z2 = ez - cz;
  let len = 1 / Math.hypot(z0, z1, z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;

  let x0 = uy * z2 - uz * z1;
  let x1 = uz * z0 - ux * z2;
  let x2 = ux * z1 - uy * z0;
  len = Math.hypot(x0, x1, x2);
  if (len) {
    len = 1 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  const y0 = z1 * x2 - z2 * x1;
  const y1 = z2 * x0 - z0 * x2;
  const y2 = z0 * x1 - z1 * x0;

  // prettier-ignore
  return new Float32Array([
    x0, y0, z0, 0,
    x1, y1, z1, 0,
    x2, y2, z2, 0,
    -(x0 * ex + x1 * ey + x2 * ez),
    -(y0 * ex + y1 * ey + y2 * ez),
    -(z0 * ex + z1 * ey + z2 * ez),
    1,
  ]);
}

function compile(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const FooterSpacerScene = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 0 = dark (additive), 1 = light (normal). Read by the render loop each frame.
  const uLightModeRef = useRef(0);
  const { theme } = useTheme();

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    let cleanup: (() => void) | null = null;

    const initObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        initObserver.disconnect();

        const gl = canvas.getContext("webgl", {
          alpha: true,
          antialias: true,
          premultipliedAlpha: true,
          depth: false,
          powerPreference: "high-performance",
        });
        if (!gl) return;

        const vs = compile(gl, gl.VERTEX_SHADER, vertexShader);
        const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
        const program = gl.createProgram();
        if (!vs || !fs || !program) return;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
        gl.useProgram(program);

        // --- Grid geometry (identical to the previous three.js version) ----
        const isMobile = window.matchMedia("(pointer: coarse)").matches;
        const AMOUNTX = Math.max(
          120,
          Math.round(550 * (wrapper.clientWidth / 1440)),
        );
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

        const posLoc = gl.getAttribLocation(program, "position");
        const scaleLoc = gl.getAttribLocation(program, "scale");

        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

        const scaleBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, scaleBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, scales, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(scaleLoc);
        gl.vertexAttribPointer(scaleLoc, 1, gl.FLOAT, false, 0, 0);

        // --- Uniforms ------------------------------------------------------
        const uModelView = gl.getUniformLocation(program, "modelViewMatrix");
        const uProjection = gl.getUniformLocation(program, "projectionMatrix");
        const uTime = gl.getUniformLocation(program, "uTime");
        const uMouse = gl.getUniformLocation(program, "uMouse");
        const uLightMode = gl.getUniformLocation(program, "uLightMode");

        // Camera is static: position (0,20,50) looking at the origin.
        const modelView = lookAt([0, 20, 50], [0, 0, 0], [0, 1, 0]);
        gl.uniformMatrix4fv(uModelView, false, modelView);

        // --- GL state (mirrors ShaderMaterial: transparent, depthWrite off) -
        gl.clearColor(0, 0, 0, 0);
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);

        let lastBlendLight = -1;
        const applyBlend = (isLight: boolean) => {
          const flag = isLight ? 1 : 0;
          if (flag === lastBlendLight) return;
          lastBlendLight = flag;
          if (isLight) {
            // NormalBlending (three.js, non-premultiplied material)
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(
              gl.SRC_ALPHA,
              gl.ONE_MINUS_SRC_ALPHA,
              gl.ONE,
              gl.ONE_MINUS_SRC_ALPHA,
            );
          } else {
            // AdditiveBlending
            gl.blendEquation(gl.FUNC_ADD);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
          }
        };

        const dpr = Math.min(window.devicePixelRatio, 2);
        const resize = () => {
          const rect = wrapper.getBoundingClientRect();
          const width = rect.width || 1;
          const height = rect.height || 1;
          canvas.width = Math.floor(width * dpr);
          canvas.height = Math.floor(height * dpr);
          gl.viewport(0, 0, canvas.width, canvas.height);
          gl.uniformMatrix4fv(
            uProjection,
            false,
            perspective((45 * Math.PI) / 180, width / height, 1, 500),
          );
        };

        const renderSingleFrame = () => {
          applyBlend(uLightModeRef.current > 0.5);
          gl.uniform1f(uLightMode, uLightModeRef.current);
          gl.clear(gl.COLOR_BUFFER_BIT);
          gl.drawArrays(gl.POINTS, 0, numParticles);
        };

        resize();

        // --- Mouse interaction (unchanged behaviour) -----------------------
        let mouseX = -10,
          mouseY = -10;
        const handlePointerMove = (event: PointerEvent) => {
          if (event.pointerType === "touch") return;
          const rect = wrapper.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          const inRange =
            event.clientX >= rect.left - 50 &&
            event.clientX <= rect.right + 50 &&
            event.clientY >= rect.top - 50 &&
            event.clientY <= rect.bottom + 50;
          mouseX = inRange ? x : -10;
          mouseY = inRange ? y : -10;
        };
        const handlePointerLeave = () => {
          mouseX = -10;
          mouseY = -10;
        };

        window.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerleave", handlePointerLeave);

        const resizeObserver = new ResizeObserver(() => {
          resize();
          renderSingleFrame();
        });
        resizeObserver.observe(wrapper);

        // --- Animation loop (throttled to ~60fps) --------------------------
        let frameId = 0;
        const startedAt = performance.now();
        const TARGET_FRAME_MS = 1000 / 60;
        let lastFrameTime = 0;

        const animate = (now: number) => {
          frameId = 0;
          if (now - lastFrameTime >= TARGET_FRAME_MS) {
            lastFrameTime = now;
            gl.uniform1f(uTime, (now - startedAt) / 1000);
            gl.uniform2f(uMouse, mouseX, mouseY);
            renderSingleFrame();
          }
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
          { threshold: 0 },
        );
        visibilityObserver.observe(wrapper);

        cleanup = () => {
          cancelAnimationFrame(frameId);
          resizeObserver.disconnect();
          visibilityObserver.disconnect();
          window.removeEventListener("pointermove", handlePointerMove);
          document.removeEventListener("pointerleave", handlePointerLeave);
          gl.deleteBuffer(posBuffer);
          gl.deleteBuffer(scaleBuffer);
          gl.deleteProgram(program);
          gl.deleteShader(vs);
          gl.deleteShader(fs);
          gl.getExtension("WEBGL_lose_context")?.loseContext();
        };
      },
      { rootMargin: "300px 0px" },
    );

    initObserver.observe(wrapper);

    return () => {
      initObserver.disconnect();
      cleanup?.();
    };
  }, []);

  useLayoutEffect(() => {
    // Applied by the render loop on its next frame (matches the previous
    // needsUpdate behaviour); blending switches additive <-> normal.
    uLightModeRef.current = theme === "light" ? 1.0 : 0.0;
  }, [theme]);

  return (
    <div className="footer-spacer-scene" ref={wrapperRef} aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="footer-spacer-scene-canvas"
        data-engine="raw-webgl"
      />
      <div className="footer-spacer-scene-veil" />
    </div>
  );
};

export default FooterSpacerScene;
