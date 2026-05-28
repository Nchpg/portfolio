'use client';

import { useEffect, useRef } from 'react';
import './error.css';

type Props = {
  code: string;
  label: string;
  action: React.ReactNode;
};

export default function ErrorScreen({ code, label, action }: Props) {
  const codeRef  = useRef<HTMLParagraphElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  const rafRef   = useRef<number>(0);
  const targetRef  = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    document.body.classList.add('is-not-found');

    const onMove = (e: MouseEvent) => {
      targetRef.current = {
        x: (e.clientX / window.innerWidth  - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };
    };

    const tick = () => {
      const t = targetRef.current;
      const c = currentRef.current;
      c.x += (t.x - c.x) * 0.06;
      c.y += (t.y - c.y) * 0.06;

      if (codeRef.current)
        codeRef.current.style.transform  = `translate(${c.x * -28}px, ${c.y * -18}px)`;
      if (labelRef.current)
        labelRef.current.style.transform = `translate(${c.x * 8}px, ${c.y * 5}px)`;
      if (actionRef.current)
        actionRef.current.style.transform = `translate(${c.x * 12}px, ${c.y * 8}px)`;

      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
      document.body.classList.remove('is-not-found');
    };
  }, []);

  return (
    <div className="error-screen">
      <p ref={codeRef} className="error-screen__code">{code}</p>
      <p ref={labelRef} className="error-screen__label">{label}</p>
      <div ref={actionRef} className="error-screen__action">
        {action}
      </div>
    </div>
  );
}
