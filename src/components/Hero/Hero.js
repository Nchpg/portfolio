import React, { useState, useEffect } from 'react';
import BackgroundAnimation from '../BackgroundAnimation/BackgroundAnimation';
import Navbar from '../Navbar/Navbar';
import { smoothScrollTo } from '../../utils/smoothScroll';
import { ChevronDownIcon, GithubIcon, LinkedInIcon, EmailIcon } from '../icons';
import { cx } from '../../utils/cx';
import './Hero.css';

const Hero = () => {
    const [time, setTime] = useState('');
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (!isHovered) return;
        const updateClock = () => {
            const now = new Date();
            const options = { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
            setTime(new Intl.DateTimeFormat('en-GB', options).format(now));
        };
        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, [isHovered]);

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
                            <ChevronDownIcon />
                            <ChevronDownIcon />
                        </div>
                    </button>
                </div>

                <div className="hero-bottom-bar">
                    <div className="hero-info-group">
                        <div className="info-item" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
                            <span className="info-label">Location</span>
                            <span className="info-value">
                                Paris, France
                                <span className={cx('location-time', isHovered && 'location-time--visible')}>
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
                                    <LinkedInIcon size={13} />
                                    LinkedIn
                                </a>
                                <a href="https://github.com/Nchpg" target="_blank" rel="noreferrer">
                                    <GithubIcon size={13} />
                                    GitHub
                                </a>
                                <a href="mailto:nathan.champagne@epita.fr">
                                    <EmailIcon size={13} />
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
