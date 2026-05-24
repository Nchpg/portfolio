'use client';

import './Footer.css';

const Footer = () => (
  <footer className="container">
    <div className="footer-bottom">
      <p>© {new Date().getFullYear()} Nathan Champagne</p>
      <p className="footer-portfolio-label">Portfolio</p>
    </div>
  </footer>
);

export default Footer;
