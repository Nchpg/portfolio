import React from 'react';
import BackgroundAnimation from './components/BackgroundAnimation';
import CustomCursor from './components/CustomCursor/CustomCursor';
import FooterSpacerScene from './components/FooterSpacerScene/FooterSpacerScene';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import Section from './components/Section/Section';
import './App.css';

function App() {
  return (
    <div className="app">
      <CustomCursor />
      <BackgroundAnimation />
      <Navbar />
      <main className="content">
        <Hero />

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
                <p>Personal portfolio system with custom motion, responsive layout, and visual interaction details.</p>
              </div>
              <span className="project-meta">React</span>
            </article>
          </div>
        </Section>
      </main>

      <FooterSpacerScene />
      
      <footer className="footer container">
        <div className="footer-panel">
          <div className="footer-identity">
            <span className="footer-label">Get in touch</span>
            <h2>Nathan Champagne</h2>
            <p>AI and Software Engineer at EPITA - SCIA.</p>
          </div>

          <div className="footer-contact">
            <a className="footer-email" href="mailto:nathan.champagne@epita.fr">
              nathan.champagne@epita.fr
            </a>
            <div className="footer-socials" id="contact">
              <a href="https://www.linkedin.com/in/nathan-champagne/" target="_blank" rel="noreferrer">
                <span>LinkedIn</span>
                <span>Open</span>
              </a>
              <a href="https://github.com/Nchpg" target="_blank" rel="noreferrer">
                <span>GitHub</span>
                <span>Open</span>
              </a>
              <a href="mailto:nathan.champagne@epita.fr">
                <span>Email</span>
                <span>Write</span>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Nathan Champagne</p>
          <p>Portfolio / AI / Software</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
