'use client';

import { useState, useEffect } from 'react';
import { cx } from '../../utils/cx';
import { GithubIcon, LinkedInIcon, EmailIcon } from '../icons';
import './HeroBottomBar.css';

const HeroBottomBar = () => {
  const [time, setTime] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const updateClock = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Europe/Paris',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setTime(new Intl.DateTimeFormat('en-GB', options).format(now));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, [isHovered]);

  return (
    <div className="hero-bottom-bar">
      <div className="hero-info-group">
        <div
          className="bar-group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span className="bar-label">Location</span>
          <span className="bar-value">
            Paris, France
            <span className={cx('location-time', isHovered && 'location-time--visible')}>
              <span className="location-sep">|</span>
              <span className="accent">{time}</span>
            </span>
          </span>
        </div>
      </div>

      <div className="hero-contact-group">
        <div className="bar-group">
          <span className="bar-label">Connect</span>
          <div className="contact-links">
            <a
              className="hover-underline"
              href="https://www.linkedin.com/in/nathan-champagne/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn profile"
            >
              <LinkedInIcon size={13} />
              LinkedIn
            </a>
            <a
              className="hover-underline"
              href="https://github.com/Nchpg"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub profile"
            >
              <GithubIcon size={13} />
              GitHub
            </a>
            <a
              className="hover-underline"
              href="mailto:nathan.champagne@epita.fr"
              aria-label="Send an email to Nathan Champagne"
            >
              <EmailIcon size={13} />
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBottomBar;
