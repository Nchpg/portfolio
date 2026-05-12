import React, { useEffect, useRef, useState } from 'react';

// --- Perlin Noise Implementation (Exact from site) ---
class Perlin {
  constructor(seed = 0) {
    this.grad3 = [
      { x: 1, y: 1, z: 0 }, { x: -1, y: 1, z: 0 }, { x: 1, y: -1, z: 0 }, { x: -1, y: -1, z: 0 },
      { x: 1, y: 0, z: 1 }, { x: -1, y: 0, z: 1 }, { x: 1, y: 0, z: -1 }, { x: -1, y: 0, z: -1 },
      { x: 0, y: 1, z: 1 }, { x: 0, y: -1, z: 1 }, { x: 0, y: 1, z: -1 }, { x: 0, y: -1, z: -1 }
    ];
    this.p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
    this.perm = new Array(512);
    this.gradP = new Array(512);
    this.seed(seed);
  }
  seed(seed) {
    if (seed > 0 && seed < 1) seed *= 65536;
    seed = Math.floor(seed);
    if (seed < 256) seed |= seed << 8;
    for (let i = 0; i < 256; i++) {
      let v = (i & 1) ? (this.p[i] ^ (seed & 255)) : (this.p[i] ^ ((seed >> 8) & 255));
      this.perm[i] = this.perm[i + 256] = v;
      this.gradP[i] = this.gradP[i + 256] = this.grad3[v % 12];
    }
  }
  dot2(g, x, y) { return g.x * x + g.y * y; }
  fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  lerp(t, a, b) { return a + t * (b - a); }
  perlin2(x, y) {
    let X = Math.floor(x), Y = Math.floor(y);
    x -= X; y -= Y;
    X &= 255; Y &= 255;
    let n00 = this.dot2(this.gradP[X + this.perm[Y]], x, y);
    let n01 = this.dot2(this.gradP[X + this.perm[Y + 1]], x, y - 1);
    let n10 = this.dot2(this.gradP[X + 1 + this.perm[Y]], x - 1, y);
    let n11 = this.dot2(this.gradP[X + 1 + this.perm[Y + 1]], x - 1, y - 1);
    let u = this.fade(x);
    return this.lerp(this.fade(y), this.lerp(u, n00, n10), this.lerp(u, n01, n11));
  }
}

const BackgroundAnimation = ({
  lineColor = '#fdfdfd21',
  backgroundColor = '#212121',
  waveSpeedX = 0.0125,
  waveSpeedY = 0.011,
  waveAmpX = 40,
  waveAmpY = 20,
  xGap = 8,
  yGap = 12,
  friction = 0.92,
  tension = 0.008,
  maxCursorMove = 330
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const ctxRef = useRef(null);
  const boundsRef = useRef({ width: 0, height: 0, left: 0, top: 0 });
  const [perlin] = useState(() => new Perlin(Math.random()));
  const pointsRef = useRef([]);
  const mouseRef = useRef({ x: -10, y: 0, lx: 0, ly: 0, sx: 0, sy: 0, v: 0, vs: 0, a: 0, set: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    ctxRef.current = canvas.getContext('2d');

    const initPoints = () => {
      const { width, height } = boundsRef.current;
      pointsRef.current = [];
      const cols = Math.ceil((width + 200) / xGap);
      const rows = Math.ceil((height + 30) / yGap);
      const offsetX = (width - xGap * cols) / 2;
      const offsetY = (height - yGap * rows) / 2;

      for (let i = 0; i <= cols; i++) {
        const col = [];
        for (let j = 0; j <= rows; j++) {
          col.push({
            x: offsetX + i * xGap,
            y: offsetY + j * yGap,
            wave: { x: 0, y: 0 },
            cursor: { x: 0, y: 0, vx: 0, vy: 0 }
          });
        }
        pointsRef.current.push(col);
      }
    };

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      boundsRef.current = { width: rect.width, height: rect.height, left: rect.left, top: rect.top };
      canvas.width = rect.width;
      canvas.height = rect.height;
      initPoints();
    };

    const handleMouseMove = (e) => {
      const m = mouseRef.current;
      const rect = containerRef.current.getBoundingClientRect();
      m.x = e.clientX - rect.left;
      m.y = e.clientY - rect.top;
      if (!m.set) {
        m.sx = m.x; m.sy = m.y;
        m.lx = m.x; m.ly = m.y;
        m.set = true;
      }
    };

    const getPointPos = (p, isLast = true) => {
        return {
          x: Math.round(10 * (p.x + p.wave.x + (isLast ? p.cursor.x : 0))) / 10,
          y: Math.round(10 * (p.y + p.wave.y + (isLast ? p.cursor.y : 0))) / 10,
        };
    };

    let animationFrame;
    const render = (time) => {
      const ctx = ctxRef.current;
      if (!ctx) return;

      const m = mouseRef.current;
      m.sx += (m.x - m.sx) * 0.1;
      m.sy += (m.y - m.sy) * 0.1;
      const dx = m.x - m.lx;
      const dy = m.y - m.ly;
      const dist = Math.hypot(dx, dy);
      m.v = dist;
      m.vs += (dist - m.vs) * 0.1;
      m.vs = Math.min(100, m.vs);
      m.lx = m.x; m.ly = m.y;
      m.a = Math.atan2(dy, dx);

      // Update Points
      pointsRef.current.forEach((col) => {
        col.forEach((p) => {
          const n = 12 * perlin.perlin2((p.x + time * waveSpeedX) * 0.002, (p.y + time * waveSpeedY) * 0.0015);
          p.wave.x = Math.cos(n) * waveAmpX;
          p.wave.y = Math.sin(n) * waveAmpY;

          const cDist = Math.hypot(p.x - m.sx, p.y - m.sy);
          const influence = Math.max(175, m.vs);
          if (cDist < influence) {
            const f = Math.cos(cDist * 0.001) * (1 - cDist / influence);
            p.cursor.vx += Math.cos(m.a) * f * influence * m.vs * 0.00065;
            p.cursor.vy += Math.sin(m.a) * f * influence * m.vs * 0.00065;
          }

          p.cursor.vx += (0 - p.cursor.x) * tension;
          p.cursor.vy += (0 - p.cursor.y) * tension;
          p.cursor.vx *= friction;
          p.cursor.vy *= friction;
          p.cursor.x += 2 * p.cursor.vx;
          p.cursor.y += 2 * p.cursor.vy;
          p.cursor.x = Math.max(-maxCursorMove, Math.min(maxCursorMove, p.cursor.x));
          p.cursor.y = Math.max(-maxCursorMove, Math.min(maxCursorMove, p.cursor.y));
        });
      });

      // Draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;

      pointsRef.current.forEach((col) => {
        let t = getPointPos(col[0], false);
        ctx.moveTo(t.x, t.y);
        col.forEach((p, index) => {
            const isLast = index === col.length - 1;
            t = getPointPos(p, !isLast);
            const next = getPointPos(col[index + 1] || col[col.length - 1], !isLast);
            ctx.lineTo(t.x, t.y);
            if (isLast) ctx.moveTo(next.x, next.y);
        });
      });
      ctx.stroke();

      animationFrame = requestAnimationFrame(render);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();
    animationFrame = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, [perlin, friction, maxCursorMove, tension, waveAmpX, waveAmpY, waveSpeedX, waveSpeedY, xGap, yGap, lineColor]);

  return (
    <div ref={containerRef} className="style-module-scss-module__NLzJ3a__waves" style={{backgroundColor}}>
      <canvas ref={canvasRef} className="style-module-scss-module__NLzJ3a__wavesCanvas" />
    </div>
  );
};

export default BackgroundAnimation;
