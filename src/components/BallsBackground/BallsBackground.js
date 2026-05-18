import React, { useEffect, useRef } from 'react';
import './BallsBackground.css';

// Strict port of `example/portfolio-epita/ball.js`. DOM structure, gradient,
// dimensions, positioning style (left/top), and movement formula are copied
// 1:1 so the rendered output matches the example pixel-for-pixel on the same
// browser. The only change vs. the original is using requestAnimationFrame
// instead of `setInterval(_, 125)` so motion is smooth, with `speed * 0.13`
// (~125ms / 1000ms * 60fps gives parity per frame).
const BALLS = [
    // radius, speed, angle — exact values from the original `new Ball(…)` calls
    { x: 200, y: 200, angle: -50, radius: 300, speed: 60 },
    { x: 600, y: 400, angle:  40, radius: 350, speed: 40 },
    { x: 800, y: 100, angle:  50, radius: 400, speed: 30 },
    { x: 400, y: 300, angle:   0, radius: 450, speed: 20 },
];

// Original used setInterval(_, 125ms). Per rAF tick at 60fps we cover 16.67ms,
// so per-frame movement = original speed * (16.67/125) ≈ speed * 0.1333.
const SPEED_SCALE = 16.6667 / 125;

const BallsBackground = () => {
    const containerRef = useRef(null);
    const ballRefs = useRef([]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const state = BALLS.map((b) => ({ ...b, dx: 1, dy: 1 }));
        // Original code: `let win_height = window.innerHeight * 2;` — the
        // bouncing area is twice the viewport height, so balls drift well
        // beyond the visible region before bouncing back.
        let winHeight = window.innerHeight * 2;
        const onResize = () => { winHeight = window.innerHeight * 2; };
        window.addEventListener('resize', onResize);

        let visible = true;
        const io = typeof IntersectionObserver !== 'undefined'
            ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting && !document.hidden; }, { threshold: 0 })
            : null;
        if (io) io.observe(container);

        const onVisibility = () => { visible = !document.hidden; };
        document.addEventListener('visibilitychange', onVisibility);

        let last = performance.now();
        let raf;
        const step = (now) => {
            raf = requestAnimationFrame(step);
            const dt = Math.min((now - last) / 16.6667, 3);
            last = now;
            if (!visible) return;

            const w = window.innerWidth;

            for (let i = 0; i < state.length; i++) {
                const b = state[i];
                // Identical update rule to the original `_move`. Angles are
                // treated as raw radians (Math.cos/sin), same as the source.
                b.x += b.speed * SPEED_SCALE * Math.cos(b.angle) * b.dx * dt;
                b.y += b.speed * SPEED_SCALE * Math.sin(b.angle) * b.dy * dt;
                if (b.x < -b.radius * 3) { b.x = -b.radius * 3; b.dx *= -1; }
                if (b.y < -b.radius * 3) { b.y = -b.radius * 3; b.dy *= -1; }
                if (b.x + b.radius * 3 >= w) { b.x = w - b.radius * 3 - 1; b.dx *= -1; }
                if (b.y + b.radius * 6 >= winHeight) { b.y = winHeight - b.radius * 6 - 1; b.dy *= -1; }

                const el = ballRefs.current[i];
                if (el) {
                    el.style.left = b.x + 'px';
                    el.style.top = b.y + 'px';
                }
            }
        };
        raf = requestAnimationFrame(step);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            document.removeEventListener('visibilitychange', onVisibility);
            if (io) io.disconnect();
        };
    }, []);

    return (
        <div className="balls-area" ref={containerRef} id="ball-area">
            <div id="mask" className="balls-mask" />
            {BALLS.map((b, i) => (
                <div
                    key={i}
                    id={`b${i + 1}`}
                    ref={(el) => { ballRefs.current[i] = el; }}
                    style={{
                        width: `${b.radius * 6}px`,
                        height: `${b.radius * 6}px`,
                        zIndex: 0,
                        position: 'absolute',
                        background: 'radial-gradient(circle, rgba(71, 89, 255, 0.4) 0%, rgba(230, 232, 255, 0) 70%, rgba(255, 255, 255, 0) 100%)',
                        filter: 'blur(0px)',
                        left: `${b.x}px`,
                        top: `${b.y}px`,
                    }}
                />
            ))}
        </div>
    );
};

export default BallsBackground;
