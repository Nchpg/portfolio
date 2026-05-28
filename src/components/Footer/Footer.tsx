"use client";

import { useTranslations } from "next-intl";
import WaveText from "../WaveText/WaveText";
import "./Footer.css";

const Footer = () => {
  const t = useTranslations("footer");
  return (
    <footer className="container">
      <div className="footer-bottom">
        <p>
          <WaveText text={`© ${new Date().getFullYear()} Nathan Champagne`} />
        </p>
        <p className="footer-portfolio-label">
          <WaveText text={t("portfolio")} />
        </p>
      </div>
    </footer>
  );
};

export default Footer;
