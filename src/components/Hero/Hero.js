import React, { useState, useEffect } from 'react';
import BackgroundAnimation from '../BackgroundAnimation';
import Navbar from '../Navbar/Navbar';
import { smoothScrollTo } from '../../utils/smoothScroll';
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
                    <div className="hero-text-block">
                        <div className="hero-title-wrapper">
                            <h1 className="hero-title">
                                <span className="title-line">Nathan</span>
                                <span className="title-line outline">Champagne</span>
                            </h1>
                        </div>

                        <div className="hero-role-primary">
                            <span className="accent">AI</span>
                            <span className="role-amp" aria-hidden="true">·</span>
                            <span className="accent">Software Engineer</span>
                        </div>
                    </div>

                    <button className="hero-cta-button" onClick={() => smoothScrollTo('projects')}>
                        <span className="cta-text">Explore Projects</span>
                        <div className="cta-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M7 13l5 5 5-5M12 6v12"/>
                            </svg>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M7 13l5 5 5-5M12 6v12"/>
                            </svg>
                        </div>
                    </button>
                </div>

                <div className="hero-bottom-bar">
                    <div className="hero-info-group">
                        <div className="info-item" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                            <span className="info-label">Location</span>
                            <span className="info-value">
                                Paris, France
                                <span className={`location-time${isHovered ? ' location-time--visible' : ''}`}>
                                    <span className="location-sep">|</span>
                                    <span className="accent">{time}</span>
                                </span>
                            </span>
                        </div>
                    </div>

                    <div className="hero-contact-group">
                        <div className="info-item">
                            <span className="info-label">Connect</span>
                            <div className="contact-links">
                                <a href="https://linkedin.com/in/nathan-champagne/" target="_blank" rel="noreferrer">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                    LinkedIn
                                </a>
                                <a href="https://github.com/Nchpg" target="_blank" rel="noreferrer">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                                    GitHub
                                </a>
                                <a href="mailto:nathan.champagne@epita.fr">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                    Email
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
