'use client';

import type { MouseEvent } from 'react';
import { smoothScrollTo } from '../../utils/smoothScroll';
import WaveText from '../WaveText/WaveText';
import './Navbar.css';

const Navbar = () => {
  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    smoothScrollTo(id);
  };

  return (
    <nav className="navbar" aria-label="Main Navigation">
      <div className="bar-group">
        <span className="bar-label">Identity</span>
        <WaveText text="Nathan Champagne" className="bar-value" />
      </div>

      <div className="bar-group">
        <span className="bar-label">Navigation</span>
        <div className="nav-links">
          <a className="hover-underline" href="#projects" onClick={(e) => handleNavClick(e, 'projects')}>
            Projects
          </a>
          <a className="hover-underline" href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
