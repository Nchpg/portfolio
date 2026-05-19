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
    <nav className="navbar">
      <div className="nav-group">
        <span className="nav-label">Identity</span>
        <WaveText text="Nathan Champagne" className="nav-value" />
      </div>

      <div className="nav-group">
        <span className="nav-label">Navigation</span>
        <div className="nav-links">
          <a href="#projects" onClick={(e) => handleNavClick(e, 'projects')}>
            Projects
          </a>
          <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
