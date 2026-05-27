'use client';

import { useTheme } from '../../context/ThemeContext';
import { SunIcon, MoonIcon } from '../icons';
import './ThemeToggle.css';

type VTResult = { ready: Promise<void>; finished: Promise<void> };
type VTDocument = Document & { startViewTransition?: (cb: () => void) => VTResult };

const ThemeToggle = () => {
  const { toggle } = useTheme();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    document.documentElement.style.setProperty('--toggle-x', `${Math.round(rect.left + rect.width / 2)}px`);
    document.documentElement.style.setProperty('--toggle-y', `${Math.round(rect.top + rect.height / 2)}px`);

    const nextIsLight = document.documentElement.getAttribute('data-theme') !== 'light';

    const vt = (document as VTDocument).startViewTransition;
    if (vt) {
      const oldBg = getComputedStyle(document.documentElement).getPropertyValue('--bg-color').trim();
      document.documentElement.style.setProperty('--vt-bg', oldBg);
      document.documentElement.classList.add('vt-active');
      const transition = vt.call(document, () => {
        if (nextIsLight) document.documentElement.setAttribute('data-theme', 'light');
        else document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', nextIsLight ? 'light' : 'dark');
      });
      transition.ready.then(() => toggle());
      transition.finished.then(() => {
        document.documentElement.classList.remove('vt-active');
        document.documentElement.style.removeProperty('--vt-bg');
      });
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
      <SunIcon size={16} className="theme-toggle-sun" aria-hidden="true" />
      <MoonIcon size={16} className="theme-toggle-moon" aria-hidden="true" />
    </button>
  );
};

export default ThemeToggle;
