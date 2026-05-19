import React from 'react';
import ReactDOM from 'react-dom';
import CustomCursor from './components/CustomCursor/CustomCursor';
import FooterSpacerScene from './components/FooterSpacerScene/FooterSpacerScene';
import Hero from './components/Hero/Hero';
import Section from './components/Section/Section';
import './App.css';

const ICONS = {
  github: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>,
  link:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>,
  doc:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>,
};

const ProjectLink = ({ href, icon, label }) => (
  <a className="project-link" href={href} target="_blank" rel="noreferrer">
    {ICONS[icon]}
    <span>{label}</span>
  </a>
);

const computePreviewSize = (naturalW, naturalH) => {
  if (!naturalW || !naturalH) return null;
  const maxW = window.innerWidth * 0.9;
  const maxH = window.innerHeight * 0.85;
  const ratio = naturalW / naturalH;
  let w = maxW;
  let h = maxW / ratio;
  if (h > maxH) {
    h = maxH;
    w = maxH * ratio;
  }
  return { width: `${w}px`, height: `${h}px` };
};

const PREVIEW_OPEN_EVENT = 'project-preview-open';
let nextPreviewId = 0;

const ProjectThumb = ({ type, src, alt }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [isShown, setIsShown] = React.useState(false);
  const [previewStyle, setPreviewStyle] = React.useState(null);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const [isMouseActive, setIsMouseActive] = React.useState(true);
  const inactivityTimer = React.useRef(null);
  const hoverLeaveTimer = React.useRef(null);
  const videoRef = React.useRef(null);
  const idRef = React.useRef(++nextPreviewId);
  const closingRef = React.useRef(false);

  const handleThumbEnter = () => {
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    closingRef.current = false;
    window.dispatchEvent(new CustomEvent(PREVIEW_OPEN_EVENT, { detail: idRef.current }));
    setIsHovered(true);
  };
  const handleThumbLeave = () => {
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    hoverLeaveTimer.current = setTimeout(() => setIsHovered(false), 200);
  };
  const handlePreviewEnter = () => {
    if (closingRef.current) return;
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    setIsHovered(true);
  };
  const handlePreviewLeave = () => {
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    closingRef.current = true;
    setIsHovered(false);
  };

  React.useEffect(() => {
    const handler = (e) => {
      if (e.detail !== idRef.current) {
        if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
        setIsHovered(false);
        setIsOpen(false);
      }
    };
    window.addEventListener(PREVIEW_OPEN_EVENT, handler);
    return () => window.removeEventListener(PREVIEW_OPEN_EVENT, handler);
  }, []);
  const supportsHover = React.useRef(
    typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
  ).current;

  const togglePlay = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const seekFromEvent = (clientX, bar) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    v.currentTime = ratio * v.duration;
    setProgress(ratio);
  };

  const handleScrubStart = (e) => {
    e.stopPropagation();
    const bar = e.currentTarget;
    const isTouch = e.type === 'touchstart';
    const getX = (ev) => isTouch ? ev.touches[0].clientX : ev.clientX;
    seekFromEvent(getX(e), bar);
    const move = (ev) => seekFromEvent(getX(ev), bar);
    const stop = () => {
      window.removeEventListener(isTouch ? 'touchmove' : 'mousemove', move);
      window.removeEventListener(isTouch ? 'touchend' : 'mouseup', stop);
    };
    window.addEventListener(isTouch ? 'touchmove' : 'mousemove', move);
    window.addEventListener(isTouch ? 'touchend' : 'mouseup', stop);
  };

  const handleTimeUpdate = (e) => {
    const v = e.currentTarget;
    if (v.duration) setProgress(v.currentTime / v.duration);
  };

  const handlePreviewMouseMove = () => {
    setIsMouseActive(true);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => setIsMouseActive(false), 2000);
  };

  React.useEffect(() => () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
  }, []);

  const isVisible = isOpen || (supportsHover && isHovered);

  React.useEffect(() => {
    if (isVisible) {
      setIsMounted(true);
      const r1 = requestAnimationFrame(() => {
        const r2 = requestAnimationFrame(() => setIsShown(true));
        return () => cancelAnimationFrame(r2);
      });
      return () => cancelAnimationFrame(r1);
    }
    setIsShown(false);
    const timer = setTimeout(() => setIsMounted(false), 250);
    return () => clearTimeout(timer);
  }, [isVisible]);

  const handleImgLoad = (e) => setPreviewStyle(computePreviewSize(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight));
  const handleVideoLoad = (e) => setPreviewStyle(computePreviewSize(e.currentTarget.videoWidth, e.currentTarget.videoHeight));

  const media = type === 'video'
    ? <video src={src} autoPlay loop muted playsInline />
    : <img src={src} alt={alt} />;

  const preview = isMounted && ReactDOM.createPortal(
    <div
      className={`project-thumb-preview${isShown ? ' project-thumb-preview--visible' : ''}${isOpen ? ' project-thumb-preview--open' : ''}${isMouseActive ? ' project-thumb-preview--active' : ''}`}
      style={previewStyle || undefined}
      onMouseEnter={() => { handlePreviewEnter(); handlePreviewMouseMove(); }}
      onMouseLeave={handlePreviewLeave}
      onMouseMove={handlePreviewMouseMove}
      onClick={() => setIsOpen(true)}
      aria-hidden="true"
    >
      {type === 'video'
        ? (
          <video
            ref={videoRef}
            src={src}
            autoPlay
            loop
            muted
            playsInline
            onLoadedMetadata={handleVideoLoad}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )
        : <img src={src} alt="" onLoad={handleImgLoad} />}
      {type === 'video' && (
        <div className="project-thumb-controls" onClick={(e) => e.stopPropagation()}>
          <button className="project-thumb-ctrl" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>}
          </button>
          <div
            className="project-thumb-progress"
            onMouseDown={handleScrubStart}
            onTouchStart={handleScrubStart}
            role="slider"
            aria-label="Seek"
          >
            <div className="project-thumb-progress-fill" style={{ width: `${progress * 100}%` }} />
            <div className="project-thumb-progress-handle" style={{ left: `${progress * 100}%` }} />
          </div>
        </div>
      )}
      {isOpen && (
        <button
          className="project-thumb-close"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
            setIsHovered(false);
            if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
          }}
          aria-label="Close preview"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      )}
    </div>,
    document.body
  );

  return (
    <>
      <div
        className={`project-thumb${isVisible ? ' project-thumb--active' : ''}`}
        onClick={() => {
          window.dispatchEvent(new CustomEvent(PREVIEW_OPEN_EVENT, { detail: idRef.current }));
          setIsOpen(true);
        }}
        onMouseEnter={handleThumbEnter}
        onMouseLeave={handleThumbLeave}
      >
        {media}
      </div>
      {preview}
    </>
  );
};

const ContactLink = ({ name, id, copyValue }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(copyValue);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <a href={copyValue.includes('@') ? `mailto:${copyValue}` : (copyValue.startsWith('/') ? `https://linkedin.com${copyValue}` : `https://github.com/${copyValue}`)} target="_blank" rel="noreferrer" className="contact-link">
            <span className="link-name">{name}</span>
            <span className="link-id" onClick={handleCopy}>
                {copied ? <span className="copied-text">Copied!</span> : (
                    <>
                        {id}
                        <svg className="copy-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </>
                )}
            </span>
        </a>
    );
};

function App() {
  return (
    <div className="app">
      <CustomCursor />
      <main className="content">
        <Hero />

        <Section id="projects" title="Projets">
          <div className="projects-list">
            <article className="project-row">
              <span className="project-index">01</span>
              <ProjectThumb type="video" src="/projects/demo_hrflow.mp4" alt="HRévolution" />
              <div className="project-main">
                <h3>HRévolution</h3>
                <p>2nd place at the HrFlow.ai GenAI & HR Hackathon. Platform for continuous analysis of job applications, leveraging GenAI for explainable scoring and tagging.</p>
                <div className="project-links">
                  <ProjectLink href="https://github.com/Nchpg/HRFlow/tree/master/HEpiR-HREvolution" icon="github" label="GitHub" />
                </div>
              </div>
              <div className="project-meta">
                <span>React</span><span>Python</span><span>GenAI</span>
              </div>
            </article>

            <article className="project-row">
              <span className="project-index">02</span>
              <ProjectThumb type="img" src="https://raw.githubusercontent.com/Nchpg/RLkart/master/assets/demo.gif" alt="RLkart" />
              <div className="project-main">
                <h3>RLkart</h3>
                <p>Kart racing simulation powered by Reinforcement Learning. Custom web-based track editor and AI agent trained with PPO and PyBullet physics.</p>
                <div className="project-links">
                  <ProjectLink href="https://rlviewer.nathanchampagne.ddns.net/" icon="link" label="Live demo" />
                  <ProjectLink href="https://github.com/Nchpg/RLkart" icon="github" label="GitHub" />
                </div>
              </div>
              <div className="project-meta">
                <span>Python</span><span>RL</span><span>PPO</span>
              </div>
            </article>

            <article className="project-row">
              <span className="project-index">03</span>
              <ProjectThumb type="video" src="/projects/mnist_demo.mp4" alt="MNIST CNN" />
              <div className="project-main">
                <h3>MNIST CNN from Scratch</h3>
                <p>Implementation of a Convolutional Neural Network from scratch in C++ to classify the MNIST handwritten digit dataset.</p>
                <div className="project-links">
                  <ProjectLink href="https://github.com/Nchpg/mnist-cnn-cpp" icon="github" label="GitHub" />
                </div>
              </div>
              <div className="project-meta">
                <span>C++</span><span>Deep Learning</span>
              </div>
            </article>

            <article className="project-row">
              <span className="project-index">04</span>
              <ProjectThumb type="img" src="/projects/OCR_img.gif" alt="OCR Sudoku Solver" />
              <div className="project-main">
                <h3>OCR Sudoku Solver</h3>
                <p>Uses Optical Character Recognition to load a Sudoku image, extract the digits, and applies AI algorithms to solve the puzzle.</p>
                <div className="project-links">
                  <ProjectLink href="/projects/OCR__Rapport_final.pdf" icon="doc" label="Read report" />
                </div>
              </div>
              <div className="project-meta">
                <span>C</span><span>GTK</span><span>OCR</span>
              </div>
            </article>

            <article className="project-row">
              <span className="project-index">05</span>
              <ProjectThumb type="img" src="/projects/MS403_trailer.gif" alt="MS402" />
              <div className="project-main">
                <h3>MS402</h3>
                <p>Multiplayer video game developed in Unity. Full gameplay loop, networking and level design.</p>
                <div className="project-links">
                  <ProjectLink href="https://a2nt.gitlab.io/ms-402-website/" icon="link" label="Visit website" />
                  <ProjectLink href="/projects/MS402___Rapport_de_projet.pdf" icon="doc" label="Read report" />
                </div>
              </div>
              <div className="project-meta">
                <span>C#</span><span>Unity</span>
              </div>
            </article>

            <article className="project-row">
              <span className="project-index">06</span>
              <ProjectThumb type="img" src="/projects/vim-airline.png" alt="Vim Airline Theme" />
              <div className="project-main">
                <h3>Vim Airline Theme</h3>
                <p>A minimal airline theme for VIM inspired by lightline.</p>
                <div className="project-links">
                  <ProjectLink href="https://github.com/Nchpg/Vim-Airline-Powerline-Theme" icon="github" label="GitHub" />
                </div>
              </div>
              <div className="project-meta">
                <span>Vimscript</span>
              </div>
            </article>

            <article className="project-row">
              <span className="project-index">07</span>
              <ProjectThumb type="img" src="/projects/aoc.gif" alt="Advent of Code" />
              <div className="project-main">
                <h3>Advent of Code</h3>
                <p>My Advent of Code solutions — an annual programming challenge with daily puzzles throughout December.</p>
                <div className="project-links">
                  <ProjectLink href="https://github.com/Nchpg/Advent-of-Code" icon="github" label="GitHub" />
                </div>
              </div>
              <div className="project-meta">
                <span>Python</span>
              </div>
            </article>

            <article className="project-row">
              <span className="project-index">08</span>
              <ProjectThumb type="img" src="/projects/portfolio2.png" alt="Previous Portfolio" />
              <div className="project-main">
                <h3>Previous Portfolio</h3>
                <p>My first portfolio built in vanilla HTML/CSS/JS with a touch of Three.js.</p>
                <div className="project-links">
                  <ProjectLink href="https://github.com/Nchpg/portfolio-epita" icon="github" label="GitHub" />
                </div>
              </div>
              <div className="project-meta">
                <span>HTML</span><span>JS</span><span>Three.js</span>
              </div>
            </article>
          </div>
        </Section>

        <Section id="contact" title="Contact">
          <div className="contact-split">
            <div className="contact-left">
              <h3 className="contact-name">
                <span className="title-line">Nathan</span><br/>
                <span className="title-line outline">Champagne</span>
              </h3>
            </div>
            <div className="contact-right">
              <div className="contact-list">
                <ContactLink name="LinkedIn" id="/in/nathan-champagne" copyValue="/in/nathan-champagne" />
                <ContactLink name="GitHub" id="@Nchpg" copyValue="Nchpg" />
                <ContactLink name="Email" id="nathan.champagne@epita.fr" copyValue="nathan.champagne@epita.fr" />
              </div>
            </div>
          </div>
        </Section>
      </main>

      <FooterSpacerScene />
      
      <footer className="footer container">
        <div className="footer-bottom">
          <p>© 2026 Nathan Champagne</p>
          <p className="footer-portfolio-label">Portfolio</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
