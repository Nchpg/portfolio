"use client";

import { useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "../../i18n/navigation";
import { createNavSignal, resolveNavSignal } from "../../utils/langNavSignal";
import "./LangToggle.css";

const STRIPE_COUNT = 8;
const ENTER_MS = 300;
const EXIT_MS = 350;
const STAGGER_MS = 25;
const ENTER_TOTAL_MS = ENTER_MS + (STRIPE_COUNT - 1) * STAGGER_MS;
const EXIT_TOTAL_MS = EXIT_MS + (STRIPE_COUNT - 1) * STAGGER_MS;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const LangToggle = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const nextLocale = locale === "en" ? "fr" : "en";
  const transitioning = useRef(false);

  // Resolve on mount OR when locale changes (handles Next.js router cache restores)
  useEffect(() => {
    resolveNavSignal();
  }, [locale]);

  useEffect(() => {
    router.prefetch(pathname, { locale: nextLocale });
  }, [pathname, nextLocale, router]);

  const handleMouseEnter = () => {
    router.prefetch(pathname, { locale: nextLocale });
  };

  const handleClick = async () => {
    if (transitioning.current) return;
    transitioning.current = true;

    const overlay = document.createElement("div");
    overlay.className = "lang-stripes";
    for (let i = 0; i < STRIPE_COUNT; i++) {
      const stripe = document.createElement("div");
      stripe.className = "lang-stripe";
      stripe.style.setProperty("--stripe-i", String(i));
      overlay.appendChild(stripe);
    }
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    try {
      // Next frame to allow paint before triggering animation
      await sleep(16);
      overlay.classList.add("lang-stripes--entering");

      // Wait for stripes to fully cover the screen before navigating
      await sleep(ENTER_TOTAL_MS + 50);

      const savedScroll = window.scrollY;

      router.prefetch(pathname, { locale: nextLocale });
      const signal = createNavSignal();
      router.replace(pathname, { locale: nextLocale });

      // Wait for new locale to be mounted and ready (3s safety timeout)
      await Promise.race([signal, sleep(3000)]);

      window.scrollTo({ top: savedScroll, behavior: "instant" });

      // Switch to exit: stripes retreat upward, left to right
      overlay.classList.remove("lang-stripes--entering");
      overlay.classList.add("lang-stripes--exiting");

      await sleep(EXIT_TOTAL_MS + 50);
    } finally {
      document.body.style.overflow = "";
      overlay.remove();
      transitioning.current = false;
    }
  };

  return (
    <button
      className="lang-toggle"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      aria-label={`Switch to ${nextLocale === "fr" ? "French" : "English"}`}
    >
      {nextLocale.toUpperCase()}
    </button>
  );
};

export default LangToggle;
