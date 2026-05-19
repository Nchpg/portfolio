import React from 'react';
import { smoothScrollTo } from '../../utils/smoothScroll';
import './Navbar.css';

const Navbar = () => {
    const name = "Nathan Champagne";

    const handleNavClick = (e, id) => {
        e.preventDefault();
        smoothScrollTo(id);
    };

    const handleMouseEnter = (e) => {
        const wrapper = e.currentTarget;
        if (!wrapper.classList.contains('is-animating')) {
            wrapper.classList.add('is-animating');
            const chars = wrapper.querySelectorAll('.wave-char');
            const lastChar = chars[chars.length - 1];
            const onAnimationEnd = () => {
                wrapper.classList.remove('is-animating');
                lastChar.removeEventListener('animationend', onAnimationEnd);
            };
            lastChar.addEventListener('animationend', onAnimationEnd);
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-group">
                <span className="nav-label">Identity</span>
                <span className="nav-value identity-wrapper" onMouseEnter={handleMouseEnter}>
                    {name.split('').map((char, i) => (
                        <span key={i} className="wave-char" style={{ '--i': i }}>
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </span>
            </div>

            <div className="nav-group">
                <span className="nav-label">Navigation</span>
                <div className="nav-links">
                    <a href="#projects" onClick={(e) => handleNavClick(e, 'projects')}>Projects</a>
                    <a href="#contact" onClick={(e) => handleNavClick(e, 'contact')}>Contact</a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
