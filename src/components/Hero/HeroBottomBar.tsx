'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { cx } from '../../utils/cx';
import { GithubIcon, LinkedInIcon, EmailIcon } from '../icons';
import BarGroup from '../BarGroup/BarGroup';
import HoverLink from '../HoverLink/HoverLink';
import './HeroBottomBar.css';

const HeroBottomBar = () => {
  const [time, setTime] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const t = useTranslations('heroBar');

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
      setTime(new Intl.DateTimeFormat(t('timeLocale'), options).format(now));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, [isHovered, t]);

  return (
    <div className="hero-bottom-bar">
      <div className="hero-info-group">
        <BarGroup
          label={t('locationLabel')}
          value={
            <>
              Paris, France
              <span className={cx('location-time', isHovered && 'location-time-visible')}>
                <span className="location-sep">|</span>
                <span className="accent">{time}</span>
              </span>
            </>
          }
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
      </div>

      <div className="hero-contact-group">
        <BarGroup
          label={t('connectLabel')}
          value={
            <div className="contact-links">
              <HoverLink
                href="https://www.linkedin.com/in/nathan-champagne/"
                target="_blank"
                rel="noreferrer"
                aria-label={t('linkedinAria')}
              >
                <LinkedInIcon size={13} />
                LinkedIn
              </HoverLink>
              <HoverLink
                href="https://github.com/Nchpg"
                target="_blank"
                rel="noreferrer"
                aria-label={t('githubAria')}
              >
                <GithubIcon size={13} />
                GitHub
              </HoverLink>
              <HoverLink
                href="mailto:nathan.champagne@epita.fr"
                aria-label={t('emailAria')}
              >
                <EmailIcon size={13} />
                Email
              </HoverLink>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default HeroBottomBar;
