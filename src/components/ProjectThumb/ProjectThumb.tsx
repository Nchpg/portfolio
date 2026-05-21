'use client';

import Image from 'next/image';
import React from 'react';
import { createPortal } from 'react-dom';
import { PlayIcon, PauseIcon, CloseIcon, FullscreenIcon, ExitFullscreenIcon } from '../icons';
import { cx } from '../../utils/cx';
import { useCoordinator } from './ProjectThumbContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import './ProjectThumb.css';

const HOVER_LEAVE_DELAY_MS = 200;
const INACTIVITY_DELAY_MS = 2000;
const SCROLL_DISMISS_PX = 80;

// Shared across all instances: suppresses synthetic mouseenter events that browsers
// fire when a portal is removed and the cursor happens to be over another thumbnail.
// Set to true on Tab navigation, cleared on the next real mousemove.
let suppressHoverUntilMouseMove = false;

type PreviewStyle = { width: string; height: string };

const computePreviewSize = (naturalW: number, naturalH: number): PreviewStyle | null => {
  if (!naturalW || !naturalH) return null;
  const maxW = window.innerWidth * 0.9;
  const maxH = window.innerHeight * 0.85;
  const ratio = naturalW / naturalH;
  let w = maxW;
  let h = maxW / ratio;
  if (h > maxH) { h = maxH; w = maxH * ratio; }
  return { width: `${w}px`, height: `${h}px` };
};

// ─── Fullscreen transition helpers ───────────────────────────────────────────
// Module-level so no per-instance closure cost and no useCallback deps needed.

function maskForEntry(el: HTMLElement) {
  el.style.transition = 'none';
  el.style.opacity = '0';
  void el.offsetHeight;
}

function unmaskAfterEntry(el: HTMLElement) {
  el.style.opacity = '';
  requestAnimationFrame(() => { el.style.transition = ''; });
}

function killTransitionForExit(el: HTMLElement) {
  el.style.transition = 'none';
  void el.offsetHeight;
}

function restoreTransitionAfterExit(el: HTMLElement) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { el.style.transition = ''; });
  });
}

// ─── VideoControls ────────────────────────────────────────────────────────────
// Isolated in React.memo so progress updates (60fps) don't re-render the parent.

type VideoControlsProps = {
  src: string;
  poster: string;
  isOpen: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onPin: () => void;
  onFullscreenChange: (isFs: boolean) => void;
  onDimensionsLoaded: (style: PreviewStyle | null) => void;
};

const VideoControls = React.memo(({ src, poster, isOpen, containerRef, onPin, onFullscreenChange, onDimensionsLoaded }: VideoControlsProps) => {
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const [hasError, setHasError] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const setFs = React.useCallback((isFs: boolean) => {
    setIsFullscreen(isFs);
    onFullscreenChange(isFs);
  }, [onFullscreenChange]);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const scrubCleanupRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => () => { scrubCleanupRef.current?.(); }, []);

  React.useEffect(() => {
    const onFsChange = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element };
      const isFs = !!(document.fullscreenElement || doc.webkitFullscreenElement);
      setFs(isFs);
      const c = containerRef.current;
      if (!c) return;
      if (isFs) {
        unmaskAfterEntry(c);
      } else {
        killTransitionForExit(c);
        restoreTransitionAfterExit(c);
      }
    };
    const video = videoRef.current;
    const onWebkitBegin = () => setFs(true);
    const onWebkitEnd = () => {
      setFs(false);
      const c = containerRef.current;
      if (c) { killTransitionForExit(c); restoreTransitionAfterExit(c); }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    video?.addEventListener('webkitbeginfullscreen', onWebkitBegin);
    video?.addEventListener('webkitendfullscreen', onWebkitEnd);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
      video?.removeEventListener('webkitbeginfullscreen', onWebkitBegin);
      video?.removeEventListener('webkitendfullscreen', onWebkitEnd);
    };
  }, [containerRef, setFs]);

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Mouse click only: blur prevents focus-within keeping controls permanently visible.
    // Keyboard activation (detail=0) keeps focus so controls stay visible for keyboard users.
    if (e.detail > 0) (e.currentTarget as HTMLElement).blur();
    const doc = document as Document & {
      webkitFullscreenElement?: Element;
      webkitExitFullscreen?: () => void;
    };
    const container = containerRef.current as (HTMLDivElement & {
      webkitRequestFullscreen?: () => void;
    }) | null;
    const video = videoRef.current as (HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
    }) | null;

    if (document.fullscreenElement || doc.webkitFullscreenElement) {
      if (container) killTransitionForExit(container);
      (document.exitFullscreen ?? doc.webkitExitFullscreen)?.call(document);
      return;
    }

    if (container) maskForEntry(container);

    onPin();

    if (container?.requestFullscreen) {
      container.requestFullscreen();
    } else if (container?.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (video?.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    }
  };

  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) =>
    onDimensionsLoaded(computePreviewSize(e.currentTarget.videoWidth, e.currentTarget.videoHeight));

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    if (v.duration) setProgress(v.currentTime / v.duration);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const seekFromEvent = (clientX: number, bar: HTMLElement) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    v.currentTime = ratio * v.duration;
    setProgress(ratio);
  };

  const handleScrubStart = (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    e.stopPropagation();
    const bar = e.currentTarget;
    const isTouch = e.type === 'touchstart';
    const getX = (ev: MouseEvent | TouchEvent) =>
      isTouch ? ((ev as TouchEvent).touches[0]?.clientX ?? 0) : (ev as MouseEvent).clientX;
    seekFromEvent(
      isTouch ? ((e as React.TouchEvent).touches[0]?.clientX ?? 0) : (e as React.MouseEvent).clientX,
      bar
    );
    const moveEvent = isTouch ? 'touchmove' : 'mousemove';
    const stopEvent = isTouch ? 'touchend' : 'mouseup';
    const move = (ev: MouseEvent | TouchEvent) => seekFromEvent(getX(ev), bar);
    const stop = () => {
      window.removeEventListener(moveEvent, move);
      window.removeEventListener(stopEvent, stop);
      scrubCleanupRef.current = null;
    };
    scrubCleanupRef.current = () => {
      window.removeEventListener(moveEvent, move);
      window.removeEventListener(stopEvent, stop);
    };
    window.addEventListener(moveEvent, move);
    window.addEventListener(stopEvent, stop);
  };

  const handleSliderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      v.currentTime = Math.min(v.duration, v.currentTime + 5);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      v.currentTime = Math.max(0, v.currentTime - 5);
    } else if (e.key === 'Home') {
      e.preventDefault();
      v.currentTime = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      v.currentTime = v.duration;
    }
  };

  if (hasError) return <div className="project-thumb-error">Preview unavailable</div>;

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay loop muted playsInline preload="metadata"
        onLoadedMetadata={handleVideoLoad}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={() => setHasError(true)}
      />
      <div className="project-thumb-controls" onClick={(e) => e.stopPropagation()}>
        <button
          className="project-thumb-ctrl"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          tabIndex={isOpen ? 0 : -1}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <div
          className="project-thumb-progress"
          onMouseDown={handleScrubStart}
          onTouchStart={handleScrubStart}
          onKeyDown={handleSliderKeyDown}
          role="slider"
          tabIndex={isOpen ? 0 : -1}
          aria-label="Seek"
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${Math.round(progress * 100)}%`}
        >
          <div className="project-thumb-progress-fill" style={{ width: `${progress * 100}%` }} />
          <div className="project-thumb-progress-handle" style={{ left: `${progress * 100}%` }} />
        </div>
        <button
          className="project-thumb-ctrl"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          tabIndex={isOpen ? 0 : -1}
        >
          {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
        </button>
      </div>
    </>
  );
});
VideoControls.displayName = 'VideoControls';

// ─── Reducer ──────────────────────────────────────────────────────────────────

type State = {
  isOpen: boolean;
  isHovered: boolean;
  isMounted: boolean;
  isShown: boolean;
  previewStyle: PreviewStyle | null;
  isMouseActive: boolean;
};

type Action =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'HOVER' }
  | { type: 'UNHOVER' }
  | { type: 'DEACTIVATE' }
  | { type: 'MOUNT' }
  | { type: 'UNMOUNT' }
  | { type: 'SHOW' }
  | { type: 'HIDE' }
  | { type: 'SET_PREVIEW_STYLE'; style: PreviewStyle | null }
  | { type: 'SET_MOUSE_ACTIVE'; active: boolean };

const initialState: State = {
  isOpen: false,
  isHovered: false,
  isMounted: false,
  isShown: false,
  previewStyle: null,
  isMouseActive: true,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'OPEN':              return { ...state, isOpen: true };
    case 'CLOSE':             return { ...state, isOpen: false, isHovered: false };
    case 'HOVER':             return { ...state, isHovered: true };
    case 'UNHOVER':           return { ...state, isHovered: false };
    case 'DEACTIVATE':        return { ...state, isOpen: false, isHovered: false };
    case 'MOUNT':             return { ...state, isMounted: true };
    case 'UNMOUNT':           return { ...state, isMounted: false };
    case 'SHOW':              return { ...state, isShown: true };
    case 'HIDE':              return { ...state, isShown: false };
    case 'SET_PREVIEW_STYLE': return { ...state, previewStyle: action.style };
    case 'SET_MOUSE_ACTIVE':  return state.isMouseActive === action.active ? state : { ...state, isMouseActive: action.active };
    default: {
      const _: never = action;
      return state;
    }
  }
}

// ─── ProjectThumb ─────────────────────────────────────────────────────────────

type ProjectThumbProps = {
  slug: string;
  previewExt: string;
  animatedThumb?: boolean;
  alt: string;
  priority?: boolean;
};

const ProjectThumb = ({ slug, previewExt, animatedThumb = false, alt, priority = false }: ProjectThumbProps) => {
  const thumbSrc = `/projects/${slug}/thumbnail.webp`;
  const src = `/projects/${slug}/preview.${previewExt}`;
  const type = previewExt === 'mp4' ? 'video' : 'img';
  const id = React.useId();
  const coord = useCoordinator();
  const [state, dispatch] = React.useReducer(reducer, initialState);
  const { isOpen, isHovered, isMounted, isShown, previewStyle, isMouseActive } = state;

  const [imgError, setImgError] = React.useState(false);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = React.useState(false);
  const [isKeyboardClosing, setIsKeyboardClosing] = React.useState(false);
  const inactivityTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverLeaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const closingRef = React.useRef(false);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const thumbButtonRef = React.useRef<HTMLButtonElement>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);
  // Set to true when entering fullscreen so the focus effect skips focusing the
  // close button on exit (keyboard exit keeps focus on fs button naturally;
  // mouse exit blurs to body — both are correct without any explicit focus call).
  const enteredFullscreenRef = React.useRef(false);
  const previewLeaveTimeRef = React.useRef(0);
  const supportsHover = useMediaQuery('(hover: hover) and (pointer: fine)');

  const closePreview = React.useCallback((suppressHover = false) => {
    if (suppressHover) {
      suppressHoverUntilMouseMove = true;
      document.addEventListener('mousemove', () => { suppressHoverUntilMouseMove = false; }, { once: true });
    }
    dispatch({ type: 'CLOSE' });
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
  }, []);

  const handleThumbEnter = React.useCallback(() => {
    if (suppressHoverUntilMouseMove) return;
    // Block quick re-hover only when cursor is NOT coming from our own preview.
    // If closingRef is true the cursor came directly from the preview → allow immediately.
    if (!closingRef.current && Date.now() - previewLeaveTimeRef.current < HOVER_LEAVE_DELAY_MS) return;
    if (coord.isPinnedElsewhere(id)) return;
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    closingRef.current = false;
    coord.notifyActivated(id);
    dispatch({ type: 'HOVER' });
  }, [coord, id]);

  const handleThumbLeave = React.useCallback(() => {
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    hoverLeaveTimer.current = setTimeout(() => dispatch({ type: 'UNHOVER' }), HOVER_LEAVE_DELAY_MS);
  }, []);

  const handlePreviewLeave = React.useCallback(() => {
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    closingRef.current = true;
    previewLeaveTimeRef.current = Date.now();
    dispatch({ type: 'UNHOVER' });
  }, []);

  const handlePreviewMouseMove = React.useCallback(() => {
    dispatch({ type: 'SET_MOUSE_ACTIVE', active: true });
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(
      () => dispatch({ type: 'SET_MOUSE_ACTIVE', active: false }),
      INACTIVITY_DELAY_MS
    );
  }, []);

  const handlePreviewMouseEnter = React.useCallback(() => {
    if (closingRef.current) return;
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    dispatch({ type: 'HOVER' });
    handlePreviewMouseMove();
  }, [handlePreviewMouseMove]);

  // Fullscreen mouse activity is tracked via CSS custom property directly on the
  // element — completely decoupled from React state to avoid batching/deferral issues.
  const handleFullscreenChange = React.useCallback((isFs: boolean) => {
    setIsPreviewFullscreen(isFs);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    dispatch({ type: 'SET_MOUSE_ACTIVE', active: false });
    if (!isFs && !supportsHover) closePreview();
  }, [supportsHover, closePreview]);

  const toggleImgFullscreen = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.detail > 0) (e.currentTarget as HTMLElement).blur();
    const container = previewRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    if (document.fullscreenElement) {
      const el = previewRef.current;
      if (el) killTransitionForExit(el);
      document.exitFullscreen();
    } else {
      const el = previewRef.current;
      if (el) maskForEntry(el);
      coord.notifyActivated(id);
      dispatch({ type: 'OPEN' });
      if (container?.requestFullscreen) container.requestFullscreen();
      else if (container?.webkitRequestFullscreen) container.webkitRequestFullscreen();
    }
  }, [coord, id]);

  React.useEffect(() => {
    if (type !== 'img' || !isOpen) return;
    const onFsChange = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element };
      const isFs = !!(document.fullscreenElement || doc.webkitFullscreenElement);
      setIsPreviewFullscreen(isFs);
      const el = previewRef.current;
      if (!el) return;
      if (isFs) unmaskAfterEntry(el);
      else { killTransitionForExit(el); restoreTransitionAfterExit(el); }
      if (!isFs && !supportsHover) closePreview();
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, [type, isOpen, supportsHover, closePreview]);

  React.useEffect(() => {
    if (!isPreviewFullscreen) return;
    const el = previewRef.current;
    if (!el) return;
    let fsTimer: ReturnType<typeof setTimeout> | null = null;
    const show = () => { el.style.setProperty('--fs-active', '1'); el.style.cursor = 'default'; };
    const hide = () => { el.style.removeProperty('--fs-active'); el.style.cursor = ''; };
    const onFsMouseMove = () => {
      show();
      if (fsTimer) clearTimeout(fsTimer);
      fsTimer = setTimeout(hide, INACTIVITY_DELAY_MS);
    };
    document.addEventListener('mousemove', onFsMouseMove);
    return () => {
      document.removeEventListener('mousemove', onFsMouseMove);
      if (fsTimer) clearTimeout(fsTimer);
      hide();
    };
  }, [isPreviewFullscreen]);

  const handlePreviewTransitionEnd = React.useCallback((e: React.TransitionEvent) => {
    if (e.target !== e.currentTarget) return;
    if (!isShown) dispatch({ type: 'UNMOUNT' });
  }, [isShown]);

  const handleDimensionsLoaded = React.useCallback((style: PreviewStyle | null) => {
    dispatch({ type: 'SET_PREVIEW_STYLE', style });
  }, []);

  const handleImgLoad = React.useCallback((e: React.SyntheticEvent<HTMLImageElement>) =>
    dispatch({ type: 'SET_PREVIEW_STYLE', style: computePreviewSize(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight) }
  ), []);

  const handleImgError = React.useCallback(() => setImgError(true), []);

  const handleVideoPin = React.useCallback(() => {
    coord.notifyActivated(id);
    dispatch({ type: 'OPEN' });
  }, [coord, id]);

  React.useEffect(
    () =>
      coord.subscribe((activatedId) => {
        if (activatedId === id) return;
        if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
        dispatch({ type: 'DEACTIVATE' });
      }),
    [coord, id]
  );

  React.useEffect(() => {
    if (!isOpen || !isMounted) return;
    const thumbButton = thumbButtonRef.current;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      thumbButton?.focus();
    };
  }, [isOpen, isMounted]);

  React.useEffect(() => {
    if (isPreviewFullscreen) { enteredFullscreenRef.current = true; return; }
    if (!isOpen || !isMounted) {
      // Reset flag if the preview closes while still in fullscreen (e.g. another
      // project triggers DEACTIVATE), so the next open focuses the close button normally.
      enteredFullscreenRef.current = false;
      return;
    }
    if (enteredFullscreenRef.current) {
      // Exiting fullscreen: leave focus alone.
      // Keyboard exit → focus already on fs button (no blur happened) → controls stay visible ✓
      // Mouse exit → blur() was called in toggleFullscreen → focus on body → controls hide ✓
      enteredFullscreenRef.current = false;
      return;
    }
    (closeButtonRef.current ?? previewRef.current)?.focus();
  }, [isOpen, isMounted, isPreviewFullscreen]);

  React.useEffect(() => {
    if (!isOpen && !isHovered) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Dismiss hover-only preview on Tab/Escape.
      // Suppress mouseenter until the next real mousemove so the browser's synthetic
      // mouseenter (fired when the portal unmounts under the cursor) doesn't re-open
      // the next thumbnail's preview immediately.
      if (!isOpen && (e.key === 'Tab' || e.key === 'Escape')) {
        // Keep project-thumb-active alive during the close animation so the row
        // stays highlighted until :hover takes over (updated on next pointer event).
        setIsKeyboardClosing(true);
        suppressHoverUntilMouseMove = true;
        document.addEventListener('mousemove', () => { suppressHoverUntilMouseMove = false; }, { once: true });
        closePreview();
        return;
      }
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (isPreviewFullscreen) {
          const c = previewRef.current;
          if (c) killTransitionForExit(c);
        } else {
          closePreview();
        }
        return;
      }
      if (e.key !== 'Tab') return;
      const container = previewRef.current;
      if (!container) return;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>('button:not([tabindex="-1"]), [role="slider"][tabindex="0"]')
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      // If focus is outside the interactive controls (e.g. on body or the container
      // div itself after a mouse-triggered fullscreen), pull it in immediately.
      if (!container.contains(document.activeElement) || document.activeElement === container) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isHovered, isPreviewFullscreen, closePreview]);

  // Clear keyboard-closing flag once the portal has fully unmounted so that
  // project-thumb-active is no longer held artificially.
  React.useEffect(() => {
    if (!isMounted) setIsKeyboardClosing(false);
  }, [isMounted]);

  React.useEffect(() => {
    if (!isHovered || isOpen) return;
    const startY = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - startY) > SCROLL_DISMISS_PX) closePreview();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHovered, isOpen, closePreview]);

  React.useEffect(
    () => () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
      coord.clearPinnedIf(id);
    },
    [coord, id]
  );

  React.useEffect(() => {
    if (isOpen) coord.setPinned(id);
    else coord.clearPinnedIf(id);
  }, [isOpen, coord, id]);

  const isVisible = isOpen || (supportsHover && isHovered);

  React.useEffect(() => {
    if (!isVisible) { dispatch({ type: 'HIDE' }); return; }
    dispatch({ type: 'MOUNT' });
    const r = requestAnimationFrame(() => dispatch({ type: 'SHOW' }));
    return () => cancelAnimationFrame(r);
  }, [isVisible]);

  const preview = isMounted && createPortal(
    <div
      ref={previewRef}
      tabIndex={-1}
      className={cx(
        'project-thumb-preview',
        isShown && 'project-thumb-preview-visible',
        isOpen && 'project-thumb-preview-open',
        isMouseActive && 'project-thumb-preview-active',
        isVisible && 'project-thumb-preview-interactive'
      )}
      style={previewStyle || undefined}
      onMouseEnter={handlePreviewMouseEnter}
      onMouseLeave={handlePreviewLeave}
      onMouseMove={handlePreviewMouseMove}
      onTransitionEnd={handlePreviewTransitionEnd}
      onClick={() => dispatch({ type: 'OPEN' })}
      {...(isOpen
        ? { role: 'dialog' as const, 'aria-modal': true, 'aria-label': `${alt} preview` }
        : { 'aria-hidden': true as const })}
    >
      {type === 'video'
        ? <VideoControls src={src} poster={thumbSrc} isOpen={isOpen} containerRef={previewRef} onPin={handleVideoPin} onFullscreenChange={handleFullscreenChange} onDimensionsLoaded={handleDimensionsLoaded} />
        : imgError
          ? <div className="project-thumb-error">Preview unavailable</div>
          : <img src={src} alt={`Preview of ${alt}`} onLoad={handleImgLoad} onError={handleImgError} />
      }
      {isOpen && !isPreviewFullscreen && (
        <button
          ref={closeButtonRef}
          className="project-thumb-close"
          onClick={(e) => { e.stopPropagation(); closePreview(true); }}
          aria-label="Close preview"
        >
          <CloseIcon />
        </button>
      )}
      {type === 'img' && isVisible && (
        <button
          className="project-thumb-img-fs"
          onClick={toggleImgFullscreen}
          tabIndex={isOpen ? 0 : -1}
          aria-label={isPreviewFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isPreviewFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
        </button>
      )}
    </div>,
    document.body
  );

  return (
    <>
      <button
        ref={thumbButtonRef}
        className={cx('project-thumb', (isVisible || isKeyboardClosing) && 'project-thumb-active')}
        onClick={() => { coord.notifyActivated(id); dispatch({ type: 'OPEN' }); }}
        onMouseEnter={handleThumbEnter}
        onMouseLeave={handleThumbLeave}
        aria-label={`Preview ${alt}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        <Image
          src={thumbSrc}
          alt={`Thumbnail for ${alt}`}
          width={600}
          height={400}
          sizes="(max-width: 768px) calc(100vw - 44px), (max-width: 992px) 92vw, 300px"
          priority={priority}
          unoptimized={animatedThumb}
        />
      </button>
      {preview}
    </>
  );
};

export default ProjectThumb;
