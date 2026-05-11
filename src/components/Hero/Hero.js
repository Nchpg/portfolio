import React from 'react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero container">
            <div className="hero-content">
                <h1 className="hero-title">
                    Nathan Champagne
                </h1>
                <p className="hero-role">
                    <span>AI and Software Engineer</span>
                    <span>EPITA - SCIA</span>
                </p>
                <div className="hero-footer">
                    <p className="hero-subtitle">Building intelligent systems, reliable software, and clear technical products.</p>
                    <div className="scroll-indicator">
                        <span>Scroll Down</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
