'use client';

import { useEffect } from 'react';
import BackgroundAnimation from '../BackgroundAnimation/BackgroundAnimation';
import Navbar from '../Navbar/Navbar';
import HeroBottomBar from './HeroBottomBar';
import { smoothScrollTo } from '../../utils/smoothScroll';
import { ChevronDownIcon } from '../icons';
import TitleLine from '../TitleLine/TitleLine';
import { useTheme } from '../../context/ThemeContext';
import { useTranslations } from 'next-intl';
import './Hero.css';
import './HeroCTA.css';

const ANIM_DARK = { lineColor: 'rgba(253,253,253,0.08)' };
const ANIM_LIGHT = { lineColor: 'rgba(26,26,26,0.20)' };

// Persists across remounts — true after the first entry animation has played
let heroHasAnimated = false;

const Hero = () => {
  const { theme } = useTheme();
  const t = useTranslations('hero');
  const animColors = theme === 'light' ? ANIM_LIGHT : ANIM_DARK;
  const skipAnim = heroHasAnimated;

  useEffect(() => {
    if (skipAnim) return;
    const timer = setTimeout(() => { heroHasAnimated = true; }, 900);
    return () => clearTimeout(timer);
  }, [skipAnim]);

  return (
  <section className={`hero container${skipAnim ? ' hero--instant' : ''}`}>
    <BackgroundAnimation {...animColors} />

    <div className="hero-content">
      <Navbar />

      <div className="hero-main-stack">
        <div className="hero-text-block">
          <div className="hero-title-wrapper">
            <h1 className="hero-title">
              <TitleLine text="Nathan" />
              <TitleLine text="Champagne" outline />
            </h1>
          </div>

          <div className="hero-role-primary">
            <span className="sr-only">{t('srRole')}</span>
            <span className="accent" aria-hidden="true">{t('roleLeft')}</span>
            <span className="role-amp" aria-hidden="true">·</span>
            <span className="accent" aria-hidden="true">{t('roleRight')}</span>
          </div>
        </div>

        <button className="hero-cta-button" onClick={() => smoothScrollTo('projects')}>
          <span>{t('cta')}</span>
          <div className="cta-icon">
            <ChevronDownIcon />
            <ChevronDownIcon />
          </div>
        </button>
      </div>

      <HeroBottomBar />
    </div>
  </section>
  );
};

export default Hero;
