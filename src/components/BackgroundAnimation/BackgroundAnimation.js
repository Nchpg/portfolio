import React, { useEffect, useRef } from 'react';
import { buildPerm, perlin2 } from './perlin';
import './BackgroundAnimation.css';

// ── Trig LUT ─────────────────────────────────────────────────────────────────
const TRIG_SIZE = 4096;
const TRIG_MASK = TRIG_SIZE - 1;
const SIN_TABLE = new Float32Array(TRIG_SIZE);
const COS_TABLE = new Float32Array(TRIG_SIZE);
for (let i = 0; i < TRIG_SIZE; i++) {
  const angle = (i / TRIG_SIZE) * Math.PI * 2;
  SIN_TABLE[i] = Math.sin(angle);
  COS_TABLE[i] = Math.cos(angle);
}

// ── Layout constants ─────────────────────────────────────────────────────────
const PIXEL_BUDGET_TOUCH  = 300_000;
const PIXEL_BUDGET_MOUSE  = 750_000;
const MAX_DPR      = 2;
const S = 8;
const NOISE_STEP = 4;
const FIXED_SCALE = 1.4;

const BackgroundAnimation = ({
  lineColor      = '#fdfdfd14',
  backgroundColor = '#212121',
  waveSpeedX     = 0.0125,
  waveSpeedY     = 0.011,
  waveAmpX       = 40,
  waveAmpY       = 20,
  xGap           = 8,
  yGap           = 4,
  friction       = 0.90,
  tension        = 0.011,
  maxCursorMove  = 150,
}) => {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);
  const ctxRef       = useRef(null);
  const boundsRef    = useRef({ width: 0, height: 0, left: 0, top: 0 });
  const noiseCtxRef  = useRef(null);
  const ptsRef       = useRef(null);
  const mouseRef     = useRef({ x: -10, y: 0, lx: 0, ly: 0, sx: 0, sy: 0, v: 0, vs: 0, a: 0, set: false });
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    ctxRef.current   = canvas.getContext('2d', { alpha: false, desynchronized: true });
    noiseCtxRef.current = buildPerm(Math.random());

    const frameState = { lastTime: 0, avgWork: 8, drawStep: 2 };

    const initPoints = () => {
      const { width, height } = boundsRef.current;
      // Pin the grid to a constant physical pixel size so the background looks
      // identical regardless of browser zoom or screen resolution.
      const dpr = window.devicePixelRatio || 1;
      const effScale = FIXED_SCALE / dpr;
      const gx = xGap * effScale;
      const gy = yGap * effScale;
      const cols     = Math.ceil((width  + 200) / gx);
      const rows     = Math.ceil((height +  30) / gy);
      const offsetX  = (width  - gx * cols) / 2;
      const offsetY  = (height - gy * rows) / 2;
      const rowCount = rows + 1;
      const data     = new Float32Array((cols + 1) * rowCount * S);

      for (let c = 0; c <= cols; c++) {
        for (let r = 0; r <= rows; r++) {
          const base = (c * rowCount + r) * S;
          data[base    ] = offsetX + c * gx;
          data[base + 1] = offsetY + r * gy;
        }
      }

      const subCols = (cols / NOISE_STEP | 0) + 2;
      const subRows = (rows / NOISE_STEP | 0) + 2;
      const baseMouseRadius = Math.max(140, Math.min(width * 0.15, 220)) * effScale;

      ptsRef.current = {
        data, cols, rows, rowCount, offsetX, offsetY, gx, gy,
        subCols, subRows,
        noiseX: new Float32Array(subCols * subRows),
        noiseY: new Float32Array(subCols * subRows),
        rowInfos: new Float32Array((rows + 1) * 3),
        colNoiseX: new Float32Array(subRows),
        colNoiseY: new Float32Array(subRows),
        trigFactor: TRIG_SIZE / (Math.PI * 2),
        mouseRadius: baseMouseRadius,
        dynamicForceScale: 0.0003 / effScale,
        effScale
      };
    };

    const CANVAS_MARGIN = 80;

    const handleResize = () => {
      const w  = window.innerWidth;
      const h  = window.innerHeight;
      const hx = h + 2 * CANVAS_MARGIN;
      const natural = window.devicePixelRatio || 1;
      const cssArea    = w * h;
      const pixelBudget = window.matchMedia('(pointer: coarse)').matches ? PIXEL_BUDGET_TOUCH : PIXEL_BUDGET_MOUSE;
      const dpr        = Math.min(natural, Math.sqrt(pixelBudget / cssArea), MAX_DPR);

      boundsRef.current = { width: w, height: hx, left: 0, top: -CANVAS_MARGIN };
      canvas.width  = Math.round(w  * dpr);
      canvas.height = Math.round(hx * dpr);
      canvas.style.position = 'absolute';
      canvas.style.left     = '0';
      canvas.style.top      = `-${CANVAS_MARGIN}px`;
      canvas.style.width    = `${w}px`;
      canvas.style.height   = `${hx}px`;
      ctxRef.current.setTransform(dpr, 0, 0, dpr, 0, 0);
      initPoints();
    };

    const handleMouseMove = (e) => {
      const m          = mouseRef.current;
      const { left, top } = boundsRef.current;
      m.x = e.clientX - left;
      m.y = e.clientY - top + window.scrollY;
      if (!m.set) { m.sx = m.x; m.sy = m.y; m.lx = m.x; m.ly = m.y; m.set = true; }
    };

    let animationFrame = 0;
    const render = (time) => {
      animationFrame = 0;
      if (!isVisibleRef.current) return;

      const t0 = performance.now();
      const dt = frameState.lastTime ? Math.min(2, (t0 - frameState.lastTime) / 16.66) : 1;
      frameState.lastTime = t0;

      const ctx = ctxRef.current;
      if (!ctx || !ptsRef.current) return;

      const m = mouseRef.current;
      m.sx += (m.x - m.sx) * 0.1 * dt;
      m.sy += (m.y - m.sy) * 0.1 * dt;
      const dx = m.x - m.lx, dy = m.y - m.ly;
      const dist = Math.sqrt(dx * dx + dy * dy);
      m.v   = dist;
      m.vs += (dist - m.vs) * 0.1 * dt;
      m.vs  = Math.min(100, m.vs);
      m.lx  = m.x; m.ly = m.y;
      m.a   = Math.atan2(dy, dx);

      const msx         = m.sx, msy = m.sy, mvs = m.vs;
      const doMouse     = mvs >= 0.5;
      const txOff       = time * waveSpeedX * 0.002;
      const tyOff       = time * waveSpeedY * 0.0015;

      const { perm, gx, gy } = noiseCtxRef.current;
      const { data, cols, rows, rowCount, offsetX, offsetY, gx: pgx, gy: pgy,
              subCols, subRows, noiseX, noiseY, rowInfos, colNoiseX, colNoiseY,
              trigFactor, mouseRadius, dynamicForceScale, effScale } = ptsRef.current;
      const { width, height } = boundsRef.current;

      const influence   = Math.max(mouseRadius, m.vs * effScale);
      const influenceSq = influence * influence;
      const forceScale  = influence * mvs * dynamicForceScale * dt;

      const cosA = COS_TABLE[((m.a * trigFactor) & TRIG_MASK)];
      const sinA = SIN_TABLE[((m.a * trigFactor) & TRIG_MASK)];

      for (let r = 0; r <= rows; r++) {
        const fr = r / NOISE_STEP;
        const sr0 = fr | 0;
        rowInfos[r * 3]     = sr0;
        rowInfos[r * 3 + 1] = Math.min(sr0 + 1, subRows - 1);
        rowInfos[r * 3 + 2] = fr - sr0;
      }

      for (let sc = 0; sc < subCols; sc++) {
        const px  = offsetX + sc * NOISE_STEP * pgx;
        const nx  = px * 0.002 + txOff;
        const scB = sc * subRows;
        for (let sr = 0; sr < subRows; sr++) {
          const py = offsetY + sr * NOISE_STEP * pgy;
          const n = 12 * perlin2(perm, gx, gy, nx, py * 0.0015 + tyOff);
          const idx = ((n * trigFactor) & TRIG_MASK);
          noiseX[scB + sr] = COS_TABLE[idx] * waveAmpX;
          noiseY[scB + sr] = SIN_TABLE[idx] * waveAmpY;
        }
      }

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth   = 1;

      const fTension  = tension * dt;
      const fFriction = Math.pow(friction, dt);
      const ds        = frameState.drawStep;

      // Physics pass
      for (let c = 0; c <= cols; c++) {
        const colStart = c * rowCount;
        const cx = offsetX + c * pgx;
        const colInMouseRange = doMouse && (Math.abs(cx - msx) <= influence);
        const fc   = c / NOISE_STEP;
        const sc0  = fc | 0;
        const sc1  = Math.min(sc0 + 1, subCols - 1);
        const tc   = fc - sc0;
        const sc0r = sc0 * subRows;
        const sc1r = sc1 * subRows;

        for (let sr = 0; sr < subRows; sr++) {
          colNoiseX[sr] = noiseX[sc0r + sr] + (noiseX[sc1r + sr] - noiseX[sc0r + sr]) * tc;
          colNoiseY[sr] = noiseY[sc0r + sr] + (noiseY[sc1r + sr] - noiseY[sc0r + sr]) * tc;
        }

        for (let r = 0; r <= rows; r++) {
          const base = (colStart + r) * S;
          const rIdx = r * 3;
          const sr0  = rowInfos[rIdx];
          const sr1  = rowInfos[rIdx + 1];
          const tr   = rowInfos[rIdx + 2];

          data[base + 2] = colNoiseX[sr0] + (colNoiseX[sr1] - colNoiseX[sr0]) * tr;
          data[base + 3] = colNoiseY[sr0] + (colNoiseY[sr1] - colNoiseY[sr0]) * tr;

          const hasEnergyPoint = (data[base + 4] !== 0 || data[base + 5] !== 0 || data[base + 6] !== 0 || data[base + 7] !== 0);

          if (colInMouseRange || hasEnergyPoint) {
            if (colInMouseRange) {
              const cy = offsetY + r * pgy;
              const dyc = cy - msy;
              if (Math.abs(dyc) <= influence) {
                const dxc = cx - msx;
                const cDistSq = dxc * dxc + dyc * dyc;
                if (cDistSq < influenceSq) {
                  const cDist = Math.sqrt(cDistSq);
                  const fIdx = ((cDist * 0.001 * trigFactor) & TRIG_MASK);
                  const f = COS_TABLE[fIdx] * (1 - cDist / influence);
                  data[base + 6] += cosA * f * forceScale;
                  data[base + 7] += sinA * f * forceScale;
                }
              }
            }

            data[base + 6] += (0 - data[base + 4]) * fTension;
            data[base + 7] += (0 - data[base + 5]) * fTension;
            data[base + 6] *= fFriction;
            data[base + 7] *= fFriction;
            data[base + 4] += 2 * data[base + 6] * dt;
            data[base + 5] += 2 * data[base + 7] * dt;

            if (Math.abs(data[base + 4]) < 0.01 && Math.abs(data[base + 6]) < 0.01) {
              data[base + 4] = data[base + 5] = data[base + 6] = data[base + 7] = 0;
            } else {
              if (data[base + 4] < -maxCursorMove) data[base + 4] = -maxCursorMove;
              else if (data[base + 4] > maxCursorMove) data[base + 4] = maxCursorMove;
              if (data[base + 5] < -maxCursorMove) data[base + 5] = -maxCursorMove;
              else if (data[base + 5] > maxCursorMove) data[base + 5] = maxCursorMove;
            }
          }
        }
      }

      // Single batched stroke: Firefox's Canvas2D has high per-stroke() overhead;
      // batching cuts hundreds of GPU commits down to one.
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        const colStart = c * rowCount;
        const b0 = colStart * S;
        ctx.moveTo(data[b0] + data[b0 + 2] + data[b0 + 4], data[b0 + 1] + data[b0 + 3] + data[b0 + 5]);
        for (let r = ds; r < rows; r += ds) {
          const base = (colStart + r) * S;
          ctx.lineTo(data[base] + data[base + 2] + data[base + 4], data[base + 1] + data[base + 3] + data[base + 5]);
        }
        const last = (colStart + rows) * S;
        ctx.lineTo(data[last] + data[last + 2] + data[last + 4], data[last + 1] + data[last + 3] + data[last + 5]);
      }
      ctx.stroke();

      const workMs = performance.now() - t0;
      frameState.avgWork = frameState.avgWork * 0.9 + workMs * 0.1;

      // Adaptive draw-step self-tunes within [1, 4].
      if (frameState.avgWork > 14 && frameState.drawStep < 4) {
        frameState.drawStep++;
      } else if (frameState.avgWork < 7 && frameState.drawStep > 1) {
        frameState.drawStep--;
      }

      animationFrame = requestAnimationFrame(render);
    };

    const ensureRunning = () => {
      if (animationFrame || !isVisibleRef.current) return;
      frameState.lastTime = 0;
      animationFrame = requestAnimationFrame(render);
    };

    const io = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting) ensureRunning();
    }, { threshold: 0 });
    io.observe(container);

    const onVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (!document.hidden) ensureRunning();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Detect browser zoom changes (Ctrl+/-): devicePixelRatio shifts and the
    // matchMedia on the current resolution fires.
    let dprMql = null;
    const watchDpr = () => {
      if (dprMql) dprMql.removeEventListener('change', onDprChange);
      dprMql = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      dprMql.addEventListener('change', onDprChange);
    };
    const onDprChange = () => {
      handleResize();
      watchDpr();
    };
    watchDpr();

    handleResize();
    animationFrame = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (dprMql) dprMql.removeEventListener('change', onDprChange);
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [friction, maxCursorMove, tension, waveAmpX, waveAmpY, waveSpeedX, waveSpeedY, xGap, yGap, lineColor, backgroundColor]);

  return (
    <div ref={containerRef} className="bg-waves" style={{ backgroundColor }}>
      <canvas ref={canvasRef} className="bg-waves__canvas" />
    </div>
  );
};

export default BackgroundAnimation;
