'use client';

import type { MouseEvent } from 'react';
import { smoothScrollTo } from '../../utils/smoothScroll';
import BarGroup from '../BarGroup/BarGroup';
import HoverLink from '../HoverLink/HoverLink';
import WaveText from '../WaveText/WaveText';
import ThemeToggle from './ThemeToggle';
import './Navbar.css';

const Navbar = () => {
  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    smoothScrollTo(id);
  };

  return (
    <nav className="navbar" aria-label="Main Navigation">
      <BarGroup
        label="Identity"
        value={
          <>
            <span className="sr-only">Nathan Champagne</span>
            <WaveText text="Nathan Champagne" aria-hidden="true" />
          </>
        }
      />

      <BarGroup
        label="Navigation"
        value={
          <div className="nav-links">
            <HoverLink href="#projects" onClick={(e) => handleNavClick(e, 'projects')}>
              Projects
            </HoverLink>
            <HoverLink href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>
              Contact
            </HoverLink>
            <ThemeToggle />
          </div>
        }
      />
    </nav>
  );
};

export default Navbar;
