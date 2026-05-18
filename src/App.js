import React from 'react';
import CustomCursor from './components/CustomCursor/CustomCursor';
import FooterSpacerScene from './components/FooterSpacerScene/FooterSpacerScene';
import Hero from './components/Hero/Hero';
import Section from './components/Section/Section';
import './App.css';

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

        <Section id="about" title="About">
          <div className="about-content">
            <p style={{fontSize: "24px", maxWidth: "800px", lineHeight: "1.6", opacity: "0.8"}}>
              Software Engineer and AI enthusiast focused on building performant, scalable, and intelligent systems. 
              Currently exploring retrieval-augmented generation and low-level system optimizations.
            </p>
          </div>
        </Section>

        <Section id="projects" title="Projets">
          <div className="projects-list">
            <article className="project-row">
              <span className="project-index">01</span>
              <div className="project-main">
                <h3>AI Knowledge Assistant</h3>
                <p>Retrieval-augmented assistant for exploring technical documents and structured knowledge.</p>
              </div>
              <span className="project-meta">AI / RAG</span>
            </article>

            <article className="project-row">
              <span className="project-index">02</span>
              <div className="project-main">
                <h3>Computer Vision Pipeline</h3>
                <p>Image processing and model inference workflow built for experimentation and evaluation.</p>
              </div>
              <span className="project-meta">Vision / ML</span>
            </article>

            <article className="project-row">
              <span className="project-index">03</span>
              <div className="project-main">
                <h3>Software Systems Lab</h3>
                <p>Low-level and backend projects focused on performance, reliability, and clean architecture.</p>
              </div>
              <span className="project-meta">Software</span>
            </article>

            <article className="project-row">
              <span className="project-index">04</span>
              <div className="project-main">
                <h3>Portfolio Interface</h3>
                <p>Portfolio system with custom motion, responsive layout, and visual interaction details.</p>
              </div>
              <span className="project-meta">React</span>
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
