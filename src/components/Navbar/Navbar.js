import React from 'react';
import './Navbar.css';

const Navbar = () => {
    const name = "Nathan Champagne";
    
    const scrollToSection = (id) => {
        const element = document.querySelector(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-group">
                <span className="nav-label">Identity</span>
                <span className="nav-value identity-wrapper">
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
                    <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('#about'); }}>About</a>
                    <a href="#projects" onClick={(e) => { e.preventDefault(); scrollToSection('#projects'); }}>Projects</a>
                    <a href="#contact" onClick={(e) => { e.preventDefault(); scrollToSection('#contact'); }}>Contact</a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
