'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { flushSync } from 'react-dom';
import './PageLoader.css';

const STRIPE_COUNT = 8;
const PHASE1_DURATION = 1500; // 0 → 90%, minimum display time
const PHASE2_DURATION = 400;  // 90 → 100%, once page is loaded
const PHASE1_TARGET = 90;
const EXIT_STRIPE_DURATION = 520 + (STRIPE_COUNT - 1) * 45 + 50;

function DigitSlot({
  trackPos,
  trackLen,
  visible,
}: {
  trackPos: number;
  trackLen: number;
  visible: boolean;
}) {
  const [displayPos, setDisplayPos] = useState(trackPos);
  const wasVisible = useRef(visible); // init au visible initial, pas à false

  useEffect(() => {
    if (visible && !wasVisible.current) {
      // Première apparition : forcer un rendu une position en dessous,
      // puis animer vers la bonne position → effet tambour qui monte
      wasVisible.current = true;
      flushSync(() => setDisplayPos(Math.max(0, trackPos - 1)));
      const raf = requestAnimationFrame(() => setDisplayPos(trackPos));
      return () => cancelAnimationFrame(raf);
    }
    if (visible) {
      setDisplayPos(trackPos);
    }
  }, [trackPos, visible]);

  const digits = useMemo(
    () => Array.from({ length: trackLen }, (_, i) => (
      <span key={i} className="loader-digit">{i % 10}</span>
    )),
    [trackLen]
  );

  return (
    <div className={`loader-digit-slot${visible ? '' : ' loader-digit-slot--hidden'}`}>
      <div
        className="loader-digit-track"
        style={{ transform: `translateY(calc(${-displayPos} * var(--digit-h)))` }}
      >
        {digits}
      </div>
    </div>
  );
}

export default function PageLoader() {
  const [count, setCount] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let raf: number;
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    let phase1Done = false;
    let pageLoaded = document.readyState === 'complete';

    const finish = () => {
      setCount(100);
      t1 = setTimeout(() => {
        setIsExiting(true);
        t2 = setTimeout(() => {
          document.body.classList.add('page-loaded');
          setIsDone(true);
        }, EXIT_STRIPE_DURATION);
      }, 250);
    };

    const tryStartPhase2 = () => {
      if (!phase1Done || !pageLoaded) return;
      const phase2Start = performance.now();
      const tickPhase2 = (now: number) => {
        const t = Math.min((now - phase2Start) / PHASE2_DURATION, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setCount(Math.floor(PHASE1_TARGET + eased * (100 - PHASE1_TARGET)));
        if (t < 1) {
          raf = requestAnimationFrame(tickPhase2);
        } else {
          finish();
        }
      };
      raf = requestAnimationFrame(tickPhase2);
    };

    const onLoad = () => {
      pageLoaded = true;
      tryStartPhase2();
    };

    if (!pageLoaded) {
      window.addEventListener('load', onLoad, { once: true });
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / PHASE1_DURATION, 1);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      setCount(Math.floor(eased * PHASE1_TARGET));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setCount(PHASE1_TARGET);
        phase1Done = true;
        tryStartPhase2();
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('load', onLoad);
    };
  }, []);

  if (isDone) return null;

  const onesPos = count;
  const tensPos = Math.floor(count / 10);
  const hundredsPos = Math.floor(count / 100);

  return (
    <div
      className={`page-loader${isExiting ? ' page-loader--exiting' : ''}`}
      style={{ '--loader-progress': `${count}%` } as React.CSSProperties}
      aria-hidden="true"
    >
      <div className="page-loader__stripes">
        {Array.from({ length: STRIPE_COUNT }, (_, i) => (
          <div
            key={i}
            className="page-loader__stripe"
            style={{ '--stripe-i': i } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="page-loader__counter">
        <DigitSlot trackPos={hundredsPos} trackLen={2}   visible={count >= 100} />
        <DigitSlot trackPos={tensPos}     trackLen={11}  visible={count >= 10} />
        <DigitSlot trackPos={onesPos}     trackLen={101} visible />
        <span className="loader-percent">%</span>
      </div>
    </div>
  );
}
