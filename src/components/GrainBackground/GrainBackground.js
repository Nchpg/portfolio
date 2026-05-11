import React, { useEffect, useRef } from 'react';
import './GrainBackground.css';

const GrainBackground = () => {
    const canvasRef = useRef(null);
    const mousePos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const generateNoise = () => {
            const width = canvas.width;
            const height = canvas.height;
            const idata = ctx.createImageData(width, height);
            const buffer32 = new Uint32Array(idata.data.buffer);
            
            for (let i = 0; i < buffer32.length; i++) {
                if (Math.random() < 0.1) {
                    // Small random noise particles
                    const val = Math.random() * 255;
                    buffer32[i] = (255 << 24) | (val << 16) | (val << 8) | val;
                }
            }
            return idata;
        };

        // Pre-generate 10 frames of noise
        const frames = [];
        const numFrames = 10;
        
        resize();
        for (let i = 0; i < numFrames; i++) {
            frames.push(generateNoise());
        }

        let frameIndex = 0;
        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw the current noise frame
            ctx.putImageData(frames[frameIndex], 0, 0);
            frameIndex = (frameIndex + 1) % numFrames;

            // Apply the "spotlight" effect via a radial gradient in CSS or another canvas layer
            // For better performance, we'll use a CSS mask or overlay for the spotlight
            
            animationFrameId = requestAnimationFrame(render);
        };

        const handleMouseMove = (e) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
            document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
            document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        
        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div className="grain-wrapper">
            <canvas ref={canvasRef} className="grain-canvas" />
            <div className="grain-spotlight" />
        </div>
    );
};

export default GrainBackground;
