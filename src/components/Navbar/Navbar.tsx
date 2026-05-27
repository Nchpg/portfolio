'use client';

import type { MouseEvent } from 'react';
import { useTranslations } from 'next-intl';
import { smoothScrollTo } from '../../utils/smoothScroll';
import BarGroup from '../BarGroup/BarGroup';
import HoverLink from '../HoverLink/HoverLink';
import ThemeToggle from './ThemeToggle';
import LangToggle from './LangToggle';
import './Navbar.css';

const Navbar = () => {
  const t = useTranslations('nav');

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    smoothScrollTo(id);
  };

  return (
    <nav className="navbar" aria-label={t('ariaLabel')}>
      <BarGroup
        label="Navigation"
        value={
          <div className="nav-links">
            <HoverLink href="#projects" onClick={(e) => handleNavClick(e, 'projects')}>
              {t('projects')}
            </HoverLink>
            <HoverLink href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>
              {t('contact')}
            </HoverLink>
          </div>
        }
      />

      <div className="nav-controls">
        <LangToggle />
        <span className="nav-controls-sep" aria-hidden="true" />
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
