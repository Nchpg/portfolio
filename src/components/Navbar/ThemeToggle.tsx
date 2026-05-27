'use client';

import type { MouseEvent } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { SunIcon, MoonIcon } from '../icons';
import './ThemeToggle.css';

type VTResult = { ready: Promise<void>; finished: Promise<void> };
type VTDocument = Document & { startViewTransition?: (cb: () => void) => VTResult };

const ThemeToggle = () => {
  const { toggle } = useTheme();

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(rect.left + rect.width / 2);
    const y = Math.round(rect.top + rect.height / 2);

    const nextIsLight = document.documentElement.getAttribute('data-theme') !== 'light';

    const vt = (document as VTDocument).startViewTransition;
    if (vt) {
      document.documentElement.style.setProperty('--vt-origin-x', `${x}px`);
      document.documentElement.style.setProperty('--vt-origin-y', `${y}px`);
      const oldBg = getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim();
      document.documentElement.style.setProperty('--vt-bg', oldBg);
      document.documentElement.classList.add('vt-active');
      const transition = vt.call(document, () => {
        if (nextIsLight) document.documentElement.setAttribute('data-theme', 'light');
        else document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', nextIsLight ? 'light' : 'dark');
      });
      transition.ready.then(() => toggle()).catch(() => {});
      transition.finished.then(() => {
        document.documentElement.classList.remove('vt-active');
        document.documentElement.style.removeProperty('--vt-bg');
        document.documentElement.style.removeProperty('--vt-origin-x');
        document.documentElement.style.removeProperty('--vt-origin-y');
      }).catch(() => {});
    } else {
      toggle();
    }
  };

  return (
    <button
      className="theme-toggle"
      onClick={handleClick}
      aria-label="Toggle theme"
    >
      <SunIcon size={20} className="theme-toggle-sun" aria-hidden="true" />
      <MoonIcon size={20} className="theme-toggle-moon" aria-hidden="true" />
    </button>
  );
};

export default ThemeToggle;
