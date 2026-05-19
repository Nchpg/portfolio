import { useEffect, useRef, useState } from 'react';
import { cx } from '../../utils/cx';
import './CustomCursor.css';

const interactiveSelector = 'a, button, img, input, textarea, select';

const CustomCursor = () => {
  const dotEl = useRef(null);
  const ringEl = useRef(null);

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
    if (isDisabled) return undefined;

    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;

    const target = { x: startX, y: startY };
    const dot = { x: startX, y: startY };
    const ring = { x: startX, y: startY };

    const writeTransform = (el, x, y) => {
      if (!el) return;
      el.style.setProperty('--x', `${x}px`);
      el.style.setProperty('--y', `${y}px`);
    };

    writeTransform(dotEl.current, startX, startY);
    writeTransform(ringEl.current, startX, startY);

    let hasMoved = false;
    const handleMouseMove = (event) => {
      target.x = event.clientX;
      target.y = event.clientY;
      if (!hasMoved) {
        hasMoved = true;
        setIsVisible(true);
      }
    };

    const handlePointerOver = (event) => {
      if (event.target.closest(interactiveSelector)) setIsHovering(true);
    };
    const handlePointerOut = (event) => {
      if (event.target.closest(interactiveSelector)) setIsHovering(false);
    };

    const lerp = (from, to, amount) => from + (to - from) * amount;

    let rafId;
    const animate = () => {
      dot.x = lerp(dot.x, target.x, 0.2);
      dot.y = lerp(dot.y, target.y, 0.2);
      ring.x = lerp(ring.x, target.x, 0.1);
      ring.y = lerp(ring.y, target.y, 0.1);

      writeTransform(dotEl.current, dot.x, dot.y);
      writeTransform(ringEl.current, ring.x, ring.y);

      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handlePointerOver);
    document.addEventListener('mouseout', handlePointerOut);
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handlePointerOver);
      document.removeEventListener('mouseout', handlePointerOut);
      cancelAnimationFrame(rafId);
    };
  }, [isDisabled]);

  if (isDisabled) return null;

  return (
    <div className="custom-cursor" aria-hidden="true">
      <div ref={dotEl} className={cx('custom-cursor__dot', isVisible && 'is-visible')} />
      <div
        ref={ringEl}
        className={cx(
          'custom-cursor__ring',
          isVisible && 'is-visible',
          isHovering && 'is-hovering'
        )}
      />
    </div>
  );
};

export default CustomCursor;
