'use client';

import BackgroundAnimation from '../BackgroundAnimation/BackgroundAnimation';
import Navbar from '../Navbar/Navbar';
import HeroBottomBar from './HeroBottomBar';
import { smoothScrollTo } from '../../utils/smoothScroll';
import { ChevronDownIcon } from '../icons';
import TitleLine from '../TitleLine/TitleLine';
import { useTheme } from '../../context/ThemeContext';
import './Hero.css';
import './HeroCTA.css';

const ANIM_DARK = { lineColor: 'rgba(253,253,253,0.08)' };
const ANIM_LIGHT = { lineColor: 'rgba(26,26,26,0.20)' };

const Hero = () => {
  const { theme } = useTheme();
  const animColors = theme === 'light' ? ANIM_LIGHT : ANIM_DARK;

  return (
  <section className="hero container">
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
            <span className="sr-only">AI &amp; Software Engineer</span>
            <span className="accent" aria-hidden="true">AI</span>
            <span className="role-amp" aria-hidden="true">·</span>
            <span className="accent" aria-hidden="true">SOFTWARE ENGINEER</span>
          </div>
        </div>

        <button className="hero-cta-button" onClick={() => smoothScrollTo('projects')}>
          <span>Explore Projects</span>
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
