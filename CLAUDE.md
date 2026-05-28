# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` — dev server (Create React App / react-scripts) on port 3000
- `npm run build` — production build to `build/`
- `npm test` — Jest in watch mode (`npm test -- --watchAll=false` for single run, `npm test -- -t "name"` for one test). Note: no test files currently exist.
- Docker: `docker compose up --build` serves the production build via nginx on port 8080.
- NixOS users: `nix-shell` provides Node 20 + a local `.npm-cache` to avoid `~/.npm` permission issues.

## Architecture

Single-page React 18 portfolio (CRA, JavaScript — not TypeScript). All page content lives in `src/App.js`; section components in `src/components/<Name>/` each ship their own `.css`. No router, no state management library, no API layer — everything is static client-side.

Key cross-cutting pieces to know before editing:

- **Project previews (`src/App.js` `ProjectThumb`)** — the hover/click "expand" preview renders into `document.body` via `ReactDOM.createPortal`, not inside the section. Mutual exclusion across thumbnails uses a `window` `CustomEvent('project-preview-open')` plus module-level `pinnedPreviewId` / `nextPreviewId`. Hover-vs-click states are tracked separately (`isHovered`, `isOpen`); on touch devices (`matchMedia('(hover: hover)')` false) only click works. Thumbnail videos use an `IntersectionObserver` to pause off-screen and pause again when the large preview is visible to avoid double-decoding.
- **Three.js scenes** — `BackgroundAnimation` (hero), `BallsBackground`, and `FooterSpacerScene` each instantiate their own `THREE.WebGLRenderer` inside a `useEffect` and clean up on unmount. `FooterSpacerScene` adapts particle counts to viewport width and `pointer: coarse`. `@react-three/fiber` and `@react-three/drei` are in `dependencies` but not all scenes use them — check before adding new ones.
- **CustomCursor (`src/components/CustomCursor`)** — a global custom cursor with separate dot/ring elements driven by `requestAnimationFrame`. Auto-disables on coarse pointers / touch via `matchMedia('(hover: none), (pointer: coarse)')`. Hover state is detected by a delegated listener against the selector `a, button, img, input, textarea, select` — new interactive elements should match that list or the cursor won't react.
- **Smooth scroll** — `src/utils/smoothScroll.js` (`smoothScrollTo(id)`) is used by Hero CTA / Navbar; prefer it over `scrollIntoView` for in-page nav so easing stays consistent.
- **Static assets** — videos, GIFs, PDFs for project rows live in `public/projects/` and are referenced by absolute path (e.g. `/projects/demo_hrflow.mp4`). Custom fonts are in `public/fonts/`.

## Repo notes

- `example/BotAmoungUs/` is an unrelated nested git repo kept as reference material — do not modify it from this project, and don't include it in greps/searches by default.
- Code/comments mix English and French (the original author's language); match the surrounding file when editing.
