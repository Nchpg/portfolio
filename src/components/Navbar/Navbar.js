import React from 'react';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar container">
            <div className="logo">
                <span>Nathan Champagne</span>
            </div>
            <div className="nav-links">
                <a href="#about">About</a>
                <a href="#projects">Projects</a>
                <a href="#contact" className="contact-link">Contact</a>
            </div>
        </nav>
    );
};

export default Navbar;
