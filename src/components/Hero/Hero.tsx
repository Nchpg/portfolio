"use client";

import { useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import HeroBottomBar from "./HeroBottomBar";
import { smoothScrollTo } from "../../utils/smoothScroll";
import { ChevronDownIcon } from "../icons";
import TitleLine from "../TitleLine/TitleLine";
import { useTranslations } from "next-intl";
import "./Hero.css";
import "./HeroCTA.css";

// Persists across remounts — true after the first entry animation has played
let heroHasAnimated = false;

const Hero = () => {
  const t = useTranslations("hero");
  const skipAnim = heroHasAnimated;

  useEffect(() => {
    if (skipAnim) return;
    const timer = setTimeout(() => {
      heroHasAnimated = true;
    }, 900);
    return () => clearTimeout(timer);
  }, [skipAnim]);

  return (
    <section className={`hero container${skipAnim ? " hero--instant" : ""}`}>
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
              <span className="sr-only">{t("srRole")}</span>
              <span className="accent" aria-hidden="true">
                {t("roleLeft")}
              </span>
              <span className="role-amp" aria-hidden="true">
                ·
              </span>
              <span className="accent" aria-hidden="true">
                {t("roleRight")}
              </span>
            </div>
          </div>

          <button
            className="hero-cta-button"
            onClick={() => smoothScrollTo("projects")}
          >
            <span>{t("cta")}</span>
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
