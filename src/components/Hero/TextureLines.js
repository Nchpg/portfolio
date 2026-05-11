import React, { useEffect, useRef } from 'react';
import './TextureLines.css';

const TextureLines = () => {
    const containerRef = useRef(null);
    const numLines = 60; // Number of horizontal slats

    useEffect(() => {
        const lines = containerRef.current.querySelectorAll('.texture-line');
        
        const handleMouseMove = (e) => {
            const mouseY = e.clientY;
            
            lines.forEach((line) => {
                const rect = line.getBoundingClientRect();
                const lineY = rect.top + rect.height / 2;
                const distance = Math.abs(mouseY - lineY);
                
                // Calculate stretch factor based on distance
                // The closer the mouse, the more the line "stretches" (scales)
                const maxDistance = 300;
                let intensity = 0;
                
                if (distance < maxDistance) {
                    // Smooth bell curve (Gaussian-like)
                    intensity = Math.pow(1 - distance / maxDistance, 2);
                }
                
                // Scale Y and adjust opacity
                const scaleY = 1 + intensity * 4; // Stretch up to 5x
                const opacity = 0.05 + intensity * 0.15; // Fade in more near mouse
                
                line.style.transform = `scaleY(${scaleY})`;
                line.style.opacity = opacity;
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="texture-lines-container" ref={containerRef}>
            {[...Array(numLines)].map((_, i) => (
                <div key={i} className="texture-line" />
            ))}
        </div>
    );
};

export default TextureLines;
