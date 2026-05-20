'use client';

import BackgroundAnimation from '../BackgroundAnimation/BackgroundAnimation';
import Navbar from '../Navbar/Navbar';
import HeroBottomBar from './HeroBottomBar';
import { smoothScrollTo } from '../../utils/smoothScroll';
import { ChevronDownIcon } from '../icons';
import TitleLine from '../TitleLine/TitleLine';
import './Hero.css';
import './HeroCTA.css';

const Hero = () => (
  <section className="hero container">
    <BackgroundAnimation />

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
            <span className="accent">AI</span>
            <span className="role-amp" aria-hidden="true">
              ·
            </span>
            <span className="accent">Software Engineer</span>
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

export default Hero;
