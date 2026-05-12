import React, { useState, useEffect } from 'react';
import BackgroundAnimation from '../BackgroundAnimation';
import Navbar from '../Navbar/Navbar';
import './Hero.css';

const Hero = () => {
    const [time, setTime] = useState('');
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const options = { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
            setTime(new Intl.DateTimeFormat('en-GB', options).format(now));
        };
        const timer = setInterval(updateClock, 1000);
        updateClock();
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="hero container">
            <BackgroundAnimation />
            
            <div className="hero-content">
                <Navbar />
                
                <div className="hero-main-stack">
                    <div className="hero-meta-top">
                        <div className="status-badge">
                            <span className="status-dot"></span>
                            <span className="status-text">Available</span>
                        </div>
                    </div>

                    <div className="hero-title-wrapper">
                        <h1 className="hero-title">
                            <span className="title-line">Nathan</span>
                            <span className="title-line outline">Champagne</span>
                        </h1>
                    </div>

                    <div className="hero-details-stack">
                        <div className="hero-role-primary">
                            <span className="accent">AI</span> & <span className="accent">Software Engineer</span>
                        </div>
                        <div className="hero-role-separator"></div>
                        <div className="hero-role-secondary">
                            <span className="accent">EPITA</span> — SCIA
                        </div>
                        
                        <button className="hero-cta-button" onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}>
                            <span className="cta-text">Explore Projects</span>
                            <div className="cta-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M7 13l5 5 5-5M12 6v12"/>
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="hero-bottom-bar">
                    <div className="hero-info-group">
                        <div className="info-item" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                            <span className="info-label">Location</span>
                            <span className="info-value">
                                Paris, France 
                                {isHovered && (
                                    <>
                                        <span style={{opacity: 0.3, margin: '0 15px'}}>|</span>
                                        <span className="accent fade-in">{time}</span>
                                    </>
                                )}
                            </span>
                        </div>
                    </div>

                    <div className="hero-contact-group">
                        <div className="info-item">
                            <span className="info-label">Connect</span>
                            <div className="contact-links">
                                <a href="https://linkedin.com/in/nathan-champagne/" target="_blank" rel="noreferrer">LinkedIn</a>
                                <a href="https://github.com/Nchpg" target="_blank" rel="noreferrer">GitHub</a>
                                <a href="mailto:nathan.champagne@epita.fr">Email</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
