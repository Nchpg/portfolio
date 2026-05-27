import { useRef, useEffect } from 'react';
import { buildPerm, perlin2, type PerlinCtx } from './perlin';
import {
  PIXEL_BUDGET_TOUCH,
  PIXEL_BUDGET_MOUSE,
  MAX_DPR,
  DATA_STRIDE as S,
  NOISE_STEP,
  FIXED_SCALE,
  TRIG_TABLE_SIZE,
  CANVAS_MARGIN,
  FRAME_MS_60FPS,
  MOUSE_LERP_FACTOR,
  MAX_MOUSE_VELOCITY,
  AVG_WORK_DECAY,
  FRAME_WORK_HIGH_MS,
  FRAME_WORK_LOW_MS,
  MAX_DRAW_STEP,
} from './constants';

const TRIG_MASK = TRIG_TABLE_SIZE - 1;
const SIN_TABLE = new Float32Array(TRIG_TABLE_SIZE);
const COS_TABLE = new Float32Array(TRIG_TABLE_SIZE);
for (let i = 0; i < TRIG_TABLE_SIZE; i++) {
  const angle = (i / TRIG_TABLE_SIZE) * Math.PI * 2;
  SIN_TABLE[i] = Math.sin(angle);
  COS_TABLE[i] = Math.cos(angle);
}

type MouseState = {
  x: number;
  y: number;
  lx: number;
  ly: number;
  sx: number;
  sy: number;
  v: number;
  vs: number;
  a: number;
  set: boolean;
};

type PtsData = {
  data: Float32Array;
  cols: number;
  rows: number;
  rowCount: number;
  offsetX: number;
  offsetY: number;
  gx: number;
  gy: number;
  subCols: number;
  subRows: number;
  noiseX: Float32Array;
  noiseY: Float32Array;
  rowInfos: Float32Array;
  colNoiseX: Float32Array;
  colNoiseY: Float32Array;
  trigFactor: number;
  mouseRadius: number;
  dynamicForceScale: number;
  effScale: number;
};

export type AnimationProps = {
  lineColor: string;
  backgroundColor: string;
  waveSpeedX: number;
  waveSpeedY: number;
  waveAmpX: number;
  waveAmpY: number;
  xGap: number;
  yGap: number;
  friction: number;
  tension: number;
  maxCursorMove: number;
};

export function useBackgroundAnimation({
  lineColor,
  backgroundColor,
  waveSpeedX,
  waveSpeedY,
  waveAmpX,
  waveAmpY,
  xGap,
  yGap,
  friction,
  tension,
  maxCursorMove,
}: AnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const boundsRef = useRef({ width: 0, height: 0, left: 0, top: 0 });
  const noiseCtxRef = useRef<PerlinCtx | null>(null);
  const ptsRef = useRef<PtsData | null>(null);
  const mouseRef = useRef<MouseState>({
    x: -10,
    y: 0,
    lx: 0,
    ly: 0,
    sx: 0,
    sy: 0,
    v: 0,
    vs: 0,
    a: 0,
    set: false,
  });
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    ctxRef.current = canvas.getContext('2d', { alpha: false, desynchronized: true });
    noiseCtxRef.current = buildPerm(Math.random());

    const frameState = { lastTime: 0, avgWork: FRAME_WORK_HIGH_MS * 0.5, drawStep: 2 };

    const initPoints = () => {
      const { width, height } = boundsRef.current;
      const dpr = window.devicePixelRatio || 1;
      const effScale = FIXED_SCALE / dpr;
      const pgx = xGap * effScale;
      const pgy = yGap * effScale;
      const cols = Math.ceil((width + 200) / pgx);
      const rows = Math.ceil((height + 30) / pgy);
      const offsetX = (width - pgx * cols) / 2;
      const offsetY = (height - pgy * rows) / 2;
      const rowCount = rows + 1;
      const data = new Float32Array((cols + 1) * rowCount * S);

      for (let c = 0; c <= cols; c++) {
        for (let r = 0; r <= rows; r++) {
          const base = (c * rowCount + r) * S;
          data[base] = offsetX + c * pgx;
          data[base + 1] = offsetY + r * pgy;
        }
      }

      const subCols = ((cols / NOISE_STEP) | 0) + 2;
      const subRows = ((rows / NOISE_STEP) | 0) + 2;
      const baseMouseRadius = Math.max(140, Math.min(width * 0.15, 220)) * effScale;

      ptsRef.current = {
        data,
        cols,
        rows,
        rowCount,
        offsetX,
        offsetY,
        gx: pgx,
        gy: pgy,
        subCols,
        subRows,
        noiseX: new Float32Array(subCols * subRows),
        noiseY: new Float32Array(subCols * subRows),
        rowInfos: new Float32Array((rows + 1) * 3),
        colNoiseX: new Float32Array(subRows),
        colNoiseY: new Float32Array(subRows),
        trigFactor: TRIG_TABLE_SIZE / (Math.PI * 2),
        mouseRadius: baseMouseRadius,
        dynamicForceScale: 0.0003 / effScale,
        effScale,
      };
    };

    const handleResize = () => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const hx = h + 2 * CANVAS_MARGIN;

      const prev = boundsRef.current;
      if (
        ptsRef.current &&
        Math.abs(w - prev.width) < 30 &&
        Math.abs(hx - prev.height) < 30
      ) {
        boundsRef.current = { width: w, height: hx, left: 0, top: -CANVAS_MARGIN };
        canvas.style.width = `${w}px`;
        canvas.style.height = `${hx}px`;
        return;
      }

      const natural = window.devicePixelRatio || 1;
      const cssArea = w * h;
      const pixelBudget = window.matchMedia('(pointer: coarse)').matches
        ? PIXEL_BUDGET_TOUCH
        : PIXEL_BUDGET_MOUSE;
      const dpr = Math.min(natural, Math.sqrt(pixelBudget / cssArea), MAX_DPR);

      boundsRef.current = { width: w, height: hx, left: 0, top: -CANVAS_MARGIN };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(hx * dpr);
      canvas.style.position = 'absolute';
      canvas.style.left = '0';
      canvas.style.top = `-${CANVAS_MARGIN}px`;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${hx}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, w, hx);
      initPoints();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const m = mouseRef.current;
      const { left, top } = boundsRef.current;
      m.x = e.clientX - left;
      m.y = e.clientY - top + window.scrollY;
      if (!m.set) {
        m.sx = m.x;
        m.sy = m.y;
        m.lx = m.x;
        m.ly = m.y;
        m.set = true;
      }
    };

    let animationFrame = 0;
    const render = (time: number) => {
      animationFrame = 0;
      if (!isVisibleRef.current) return;

      const t0 = performance.now();
      const dt = frameState.lastTime ? Math.min(2, (t0 - frameState.lastTime) / FRAME_MS_60FPS) : 1;
      frameState.lastTime = t0;

      const ctx = ctxRef.current;
      const noiseCtx = noiseCtxRef.current;
      if (!ctx || !ptsRef.current || !noiseCtx) return;

      const m = mouseRef.current;
      m.sx += (m.x - m.sx) * MOUSE_LERP_FACTOR * dt;
      m.sy += (m.y - m.sy) * MOUSE_LERP_FACTOR * dt;
      const dx = m.x - m.lx,
        dy = m.y - m.ly;
      const dist = Math.sqrt(dx * dx + dy * dy);
      m.v = dist;
      m.vs += (dist - m.vs) * MOUSE_LERP_FACTOR * dt;
      m.vs = Math.min(MAX_MOUSE_VELOCITY, m.vs);
      m.lx = m.x;
      m.ly = m.y;
      m.a = Math.atan2(dy, dx);

      const msx = m.sx,
        msy = m.sy,
        mvs = m.vs;
      const doMouse = mvs >= 0.5;
      const txOff = time * waveSpeedX * 0.002;
      const tyOff = time * waveSpeedY * 0.0015;

      const { perm, gx, gy } = noiseCtx;
      const {
        data,
        cols,
        rows,
        rowCount,
        offsetX,
        offsetY,
        gx: pgx,
        gy: pgy,
        subCols,
        subRows,
        noiseX,
        noiseY,
        rowInfos,
        colNoiseX,
        colNoiseY,
        trigFactor,
        mouseRadius,
        dynamicForceScale,
        effScale,
      } = ptsRef.current;
      const { width, height } = boundsRef.current;

      const influence = Math.max(mouseRadius, m.vs * effScale);
      const influenceSq = influence * influence;
      const forceScale = influence * mvs * dynamicForceScale * dt;

      const cosA = COS_TABLE[(m.a * trigFactor) & TRIG_MASK] ?? 0;
      const sinA = SIN_TABLE[(m.a * trigFactor) & TRIG_MASK] ?? 0;

      for (let r = 0; r <= rows; r++) {
        const fr = r / NOISE_STEP;
        const sr0 = fr | 0;
        rowInfos[r * 3] = sr0;
        rowInfos[r * 3 + 1] = Math.min(sr0 + 1, subRows - 1);
        rowInfos[r * 3 + 2] = fr - sr0;
      }

      for (let sc = 0; sc < subCols; sc++) {
        const px = offsetX + sc * NOISE_STEP * pgx;
        const nx = px * 0.002 + txOff;
        const scB = sc * subRows;
        for (let sr = 0; sr < subRows; sr++) {
          const py = offsetY + sr * NOISE_STEP * pgy;
          const n = 12 * perlin2(perm, gx, gy, nx, py * 0.0015 + tyOff);
          const idx = (n * trigFactor) & TRIG_MASK;
          noiseX[scB + sr] = (COS_TABLE[idx] ?? 0) * waveAmpX;
          noiseY[scB + sr] = (SIN_TABLE[idx] ?? 0) * waveAmpY;
        }
      }

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;

      const fTension = tension * dt;
      const fFriction = Math.pow(friction, dt);
      const ds = frameState.drawStep;

      for (let c = 0; c <= cols; c++) {
        const colStart = c * rowCount;
        const cx = offsetX + c * pgx;
        const colInMouseRange = doMouse && Math.abs(cx - msx) <= influence;
        const fc = c / NOISE_STEP;
        const sc0 = fc | 0;
        const sc1 = Math.min(sc0 + 1, subCols - 1);
        const tc = fc - sc0;
        const sc0r = sc0 * subRows;
        const sc1r = sc1 * subRows;

        for (let sr = 0; sr < subRows; sr++) {
          colNoiseX[sr] =
            (noiseX[sc0r + sr] ?? 0) + ((noiseX[sc1r + sr] ?? 0) - (noiseX[sc0r + sr] ?? 0)) * tc;
          colNoiseY[sr] =
            (noiseY[sc0r + sr] ?? 0) + ((noiseY[sc1r + sr] ?? 0) - (noiseY[sc0r + sr] ?? 0)) * tc;
        }

        for (let r = 0; r <= rows; r++) {
          const base = (colStart + r) * S;
          const rIdx = r * 3;
          const sr0 = rowInfos[rIdx] ?? 0;
          const sr1 = rowInfos[rIdx + 1] ?? 0;
          const tr = rowInfos[rIdx + 2] ?? 0;

          data[base + 2] =
            (colNoiseX[sr0] ?? 0) + ((colNoiseX[sr1] ?? 0) - (colNoiseX[sr0] ?? 0)) * tr;
          data[base + 3] =
            (colNoiseY[sr0] ?? 0) + ((colNoiseY[sr1] ?? 0) - (colNoiseY[sr0] ?? 0)) * tr;

          const hasEnergyPoint =
            data[base + 4] !== 0 ||
            data[base + 5] !== 0 ||
            data[base + 6] !== 0 ||
            data[base + 7] !== 0;

          if (colInMouseRange || hasEnergyPoint) {
            if (colInMouseRange) {
              const cy = offsetY + r * pgy;
              const dyc = cy - msy;
              if (Math.abs(dyc) <= influence) {
                const dxc = cx - msx;
                const cDistSq = dxc * dxc + dyc * dyc;
                if (cDistSq < influenceSq) {
                  const cDist = Math.sqrt(cDistSq);
                  const fIdx = (cDist * 0.001 * trigFactor) & TRIG_MASK;
                  const f = (COS_TABLE[fIdx] ?? 0) * (1 - cDist / influence);
                  data[base + 6] = (data[base + 6] ?? 0) + cosA * f * forceScale;
                  data[base + 7] = (data[base + 7] ?? 0) + sinA * f * forceScale;
                }
              }
            }

            data[base + 6] = (data[base + 6] ?? 0) + (0 - (data[base + 4] ?? 0)) * fTension;
            data[base + 7] = (data[base + 7] ?? 0) + (0 - (data[base + 5] ?? 0)) * fTension;
            data[base + 6] = (data[base + 6] ?? 0) * fFriction;
            data[base + 7] = (data[base + 7] ?? 0) * fFriction;
            data[base + 4] = (data[base + 4] ?? 0) + 2 * (data[base + 6] ?? 0) * dt;
            data[base + 5] = (data[base + 5] ?? 0) + 2 * (data[base + 7] ?? 0) * dt;

            if (Math.abs(data[base + 4] ?? 0) < 0.01 && Math.abs(data[base + 6] ?? 0) < 0.01) {
              data[base + 4] = data[base + 5] = data[base + 6] = data[base + 7] = 0;
            } else {
              if ((data[base + 4] ?? 0) < -maxCursorMove) data[base + 4] = -maxCursorMove;
              else if ((data[base + 4] ?? 0) > maxCursorMove) data[base + 4] = maxCursorMove;
              if ((data[base + 5] ?? 0) < -maxCursorMove) data[base + 5] = -maxCursorMove;
              else if ((data[base + 5] ?? 0) > maxCursorMove) data[base + 5] = maxCursorMove;
            }
          }
        }
      }

      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        const colStart = c * rowCount;
        const b0 = colStart * S;
        ctx.moveTo(
          (data[b0] ?? 0) + (data[b0 + 2] ?? 0) + (data[b0 + 4] ?? 0),
          (data[b0 + 1] ?? 0) + (data[b0 + 3] ?? 0) + (data[b0 + 5] ?? 0)
        );
        for (let r = ds; r < rows; r += ds) {
          const base = (colStart + r) * S;
          ctx.lineTo(
            (data[base] ?? 0) + (data[base + 2] ?? 0) + (data[base + 4] ?? 0),
            (data[base + 1] ?? 0) + (data[base + 3] ?? 0) + (data[base + 5] ?? 0)
          );
        }
        const last = (colStart + rows) * S;
        ctx.lineTo(
          (data[last] ?? 0) + (data[last + 2] ?? 0) + (data[last + 4] ?? 0),
          (data[last + 1] ?? 0) + (data[last + 3] ?? 0) + (data[last + 5] ?? 0)
        );
      }
      ctx.stroke();

      const workMs = performance.now() - t0;
      frameState.avgWork = frameState.avgWork * AVG_WORK_DECAY + workMs * (1 - AVG_WORK_DECAY);
      if (frameState.avgWork > FRAME_WORK_HIGH_MS && frameState.drawStep < MAX_DRAW_STEP)
        frameState.drawStep++;
      else if (frameState.avgWork < FRAME_WORK_LOW_MS && frameState.drawStep > 1)
        frameState.drawStep--;

      animationFrame = requestAnimationFrame(render);
    };

    const ensureRunning = () => {
      if (animationFrame || !isVisibleRef.current) return;
      frameState.lastTime = 0;
      animationFrame = requestAnimationFrame(render);
    };

    const addMouseListener = () => window.addEventListener('mousemove', handleMouseMove);
    const removeMouseListener = () => window.removeEventListener('mousemove', handleMouseMove);

    const io = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry?.isIntersecting ?? false;
        if (entry?.isIntersecting) {
          addMouseListener();
          ensureRunning();
        } else {
          removeMouseListener();
        }
      },
      { threshold: 0 }
    );
    io.observe(container);

    const onVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      if (!document.hidden) {
        addMouseListener();
        ensureRunning();
      } else {
        removeMouseListener();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);

    let dprMql: MediaQueryList | null = null;
    const onDprChange = () => {
      handleResize();
      watchDpr();
    };
    const watchDpr = () => {
      if (dprMql) dprMql.removeEventListener('change', onDprChange);
      dprMql = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      dprMql.addEventListener('change', onDprChange);
    };
    watchDpr();

    handleResize();
    animationFrame = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (dprMql) dprMql.removeEventListener('change', onDprChange);
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [
    friction,
    maxCursorMove,
    tension,
    waveAmpX,
    waveAmpY,
    waveSpeedX,
    waveSpeedY,
    xGap,
    yGap,
    lineColor,
    backgroundColor,
  ]);

  return { canvasRef, containerRef };
}
