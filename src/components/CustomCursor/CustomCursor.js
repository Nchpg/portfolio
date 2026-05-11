import React, { useEffect, useRef, useState } from 'react';
import './CustomCursor.css';

const interactiveSelector = 'a, button, img, input, textarea, select';

const isTouchPointer = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: none), (pointer: coarse)').matches;

const CustomCursor = () => {
    const target = useRef({ x: 0, y: 0 });
    const dot = useRef({ x: 0, y: 0 });
    const ring = useRef({ x: 0, y: 0 });
    const raf = useRef(null);

    const [position, setPosition] = useState({
        dot: { x: 0, y: 0 },
        ring: { x: 0, y: 0 },
    });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(hover: none), (pointer: coarse)');
        const updatePointerMode = () => setIsDisabled(mediaQuery.matches);

        updatePointerMode();
        mediaQuery.addEventListener('change', updatePointerMode);

        return () => mediaQuery.removeEventListener('change', updatePointerMode);
    }, []);

    useEffect(() => {
        if (isDisabled || isTouchPointer()) {
            return undefined;
        }

        const startX = window.innerWidth / 2;
        const startY = window.innerHeight / 2;

        target.current = { x: startX, y: startY };
        dot.current = { x: startX, y: startY };
        ring.current = { x: startX, y: startY };
        setPosition({
            dot: { x: startX, y: startY },
            ring: { x: startX, y: startY },
        });

        const handleMouseMove = (event) => {
            target.current = { x: event.clientX, y: event.clientY };
            setIsVisible(true);
        };

        const handlePointerOver = (event) => {
            if (event.target.closest(interactiveSelector)) {
                setIsHovering(true);
            }
        };

        const handlePointerOut = (event) => {
            if (event.target.closest(interactiveSelector)) {
                setIsHovering(false);
            }
        };

        const lerp = (from, to, amount) => from + (to - from) * amount;

        const animate = () => {
            dot.current.x = lerp(dot.current.x, target.current.x, 0.2);
            dot.current.y = lerp(dot.current.y, target.current.y, 0.2);
            ring.current.x = lerp(ring.current.x, target.current.x, 0.1);
            ring.current.y = lerp(ring.current.y, target.current.y, 0.1);

            setPosition({
                dot: { x: dot.current.x, y: dot.current.y },
                ring: { x: ring.current.x, y: ring.current.y },
            });

            raf.current = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseover', handlePointerOver);
        document.addEventListener('mouseout', handlePointerOut);
        raf.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseover', handlePointerOver);
            document.removeEventListener('mouseout', handlePointerOut);
            cancelAnimationFrame(raf.current);
        };
    }, [isDisabled]);

    if (isDisabled) {
        return null;
    }

    return (
        <div className="custom-cursor" aria-hidden="true">
            <div
                className={`custom-cursor__dot ${isVisible ? 'is-visible' : ''}`}
                style={{ left: `${position.dot.x}px`, top: `${position.dot.y}px` }}
            />
            <div
                className={`custom-cursor__ring ${isVisible ? 'is-visible' : ''} ${isHovering ? 'is-hovering' : ''}`}
                style={{ left: `${position.ring.x}px`, top: `${position.ring.y}px` }}
            />
        </div>
    );
};

export default CustomCursor;
