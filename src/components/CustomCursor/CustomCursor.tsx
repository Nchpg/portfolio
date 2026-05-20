'use client';

import { useEffect, useRef, useState } from 'react';
import { cx } from '../../utils/cx';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import './CustomCursor.css';

const interactiveSelector = 'a, button, img, input, textarea, select';

const CustomCursor = () => {
  const dotEl = useRef<HTMLDivElement>(null);
  const ringEl = useRef<HTMLDivElement>(null);

  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isDisabled = useMediaQuery('(hover: none), (pointer: coarse)');

  useEffect(() => {
    if (isDisabled) return undefined;

    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;

    const target = { x: startX, y: startY };
    const dot = { x: startX, y: startY };
    const ring = { x: startX, y: startY };

    const writeTransform = (el: HTMLDivElement | null, x: number, y: number) => {
      if (!el) return;
      el.style.setProperty('--x', `${x}px`);
      el.style.setProperty('--y', `${y}px`);
    };

    writeTransform(dotEl.current, startX, startY);
    writeTransform(ringEl.current, startX, startY);

    const lerp = (from: number, to: number, amount: number) => from + (to - from) * amount;

    let rafId = 0;

    const scheduleFrame = () => {
      if (!rafId) rafId = requestAnimationFrame(animate);
    };

    const animate = () => {
      rafId = 0;
      dot.x = lerp(dot.x, target.x, 0.2);
      dot.y = lerp(dot.y, target.y, 0.2);
      ring.x = lerp(ring.x, target.x, 0.1);
      ring.y = lerp(ring.y, target.y, 0.1);

      writeTransform(dotEl.current, dot.x, dot.y);
      writeTransform(ringEl.current, ring.x, ring.y);

      const stillMoving =
        Math.abs(dot.x - target.x) > 0.05 ||
        Math.abs(dot.y - target.y) > 0.05 ||
        Math.abs(ring.x - target.x) > 0.05 ||
        Math.abs(ring.y - target.y) > 0.05;

      if (stillMoving) rafId = requestAnimationFrame(animate);
    };

    let hasMoved = false;
    const handleMouseMove = (event: MouseEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      if (!hasMoved) {
        hasMoved = true;
        setIsVisible(true);
      }
      scheduleFrame();
    };

    const handlePointerOver = (event: MouseEvent) => {
      if ((event.target as Element).closest(interactiveSelector)) setIsHovering(true);
    };
    const handlePointerOut = (event: MouseEvent) => {
      if ((event.target as Element).closest(interactiveSelector)) setIsHovering(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handlePointerOver);
    document.addEventListener('mouseout', handlePointerOut);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handlePointerOver);
      document.removeEventListener('mouseout', handlePointerOut);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isDisabled]);

  if (isDisabled) return null;

  return (
    <div className="custom-cursor" aria-hidden="true">
      <div ref={dotEl} className={cx('custom-cursor-dot', isVisible && 'is-visible')} />
      <div
        ref={ringEl}
        className={cx('custom-cursor-ring', isVisible && 'is-visible', isHovering && 'is-hovering')}
      />
    </div>
  );
};

export default CustomCursor;
