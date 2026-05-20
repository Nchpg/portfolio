'use client';

import Image from 'next/image';
import React from 'react';
import { createPortal } from 'react-dom';
import { PlayIcon, PauseIcon, CloseIcon } from '../icons';
import { cx } from '../../utils/cx';
import { useCoordinator } from './ProjectThumbContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import './ProjectThumb.css';

const HOVER_LEAVE_DELAY_MS = 200;
const INACTIVITY_DELAY_MS = 2000;

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

// ─── VideoControls ────────────────────────────────────────────────────────────
// Isolated in React.memo so progress updates (60fps) don't re-render the parent.

type VideoControlsProps = {
  src: string;
  poster: string;
  isOpen: boolean;
  onDimensionsLoaded: (style: PreviewStyle | null) => void;
};

const VideoControls = React.memo(({ src, poster, isOpen, onDimensionsLoaded }: VideoControlsProps) => {
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const [hasError, setHasError] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const scrubCleanupRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => () => { scrubCleanupRef.current?.(); }, []);

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
    case 'OPEN':               return { ...state, isOpen: true };
    case 'CLOSE':              return { ...state, isOpen: false, isHovered: false };
    case 'HOVER':              return { ...state, isHovered: true };
    case 'UNHOVER':            return { ...state, isHovered: false };
    case 'DEACTIVATE':         return { ...state, isOpen: false, isHovered: false };
    case 'MOUNT':              return { ...state, isMounted: true };
    case 'UNMOUNT':            return { ...state, isMounted: false };
    case 'SHOW':               return { ...state, isShown: true };
    case 'HIDE':               return { ...state, isShown: false };
    case 'SET_PREVIEW_STYLE':  return { ...state, previewStyle: action.style };
    case 'SET_MOUSE_ACTIVE':   return { ...state, isMouseActive: action.active };
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
  const inactivityTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverLeaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const closingRef = React.useRef(false);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const thumbButtonRef = React.useRef<HTMLButtonElement>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const supportsHover = useMediaQuery('(hover: hover) and (pointer: fine)');

  const closePreview = React.useCallback(() => {
    dispatch({ type: 'CLOSE' });
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
  }, []);

  const handleThumbEnter = React.useCallback(() => {
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

  const handlePreviewEnter = React.useCallback(() => {
    if (closingRef.current) return;
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    dispatch({ type: 'HOVER' });
  }, []);

  const handlePreviewLeave = React.useCallback(() => {
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    closingRef.current = true;
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
    handlePreviewEnter();
    handlePreviewMouseMove();
  }, [handlePreviewEnter, handlePreviewMouseMove]);

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
    closeButtonRef.current?.focus();
  }, [isOpen, isMounted]);


  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closePreview(); return; }
      if (e.key !== 'Tab') return;
      const container = previewRef.current;
      if (!container) return;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>('button, [role="slider"][tabindex]')
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closePreview]);

  React.useEffect(() => {
    if (!isOpen || !isMounted) return;
    const preview = previewRef.current;
    const thumbButton = thumbButtonRef.current;
    const siblings = Array.from(document.body.children).filter(el => el !== preview);
    siblings.forEach(el => el.setAttribute('inert', ''));
    return () => {
      siblings.forEach(el => el.removeAttribute('inert'));
      thumbButton?.focus();
    };
  }, [isOpen, isMounted]);

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
      className={cx(
        'project-thumb-preview',
        isShown && 'project-thumb-preview-visible',
        isOpen && 'project-thumb-preview-open',
        isMouseActive && 'project-thumb-preview-active'
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
        ? <VideoControls src={src} poster={thumbSrc} isOpen={isOpen} onDimensionsLoaded={handleDimensionsLoaded} />
        : imgError
          ? <div className="project-thumb-error">Preview unavailable</div>
          : <img src={src} alt={`Preview of ${alt}`} onLoad={handleImgLoad} onError={handleImgError} />
      }
      {isOpen && (
        <button
          ref={closeButtonRef}
          className="project-thumb-close"
          onClick={(e) => { e.stopPropagation(); closePreview(); }}
          aria-label="Close preview"
        >
          <CloseIcon />
        </button>
      )}
    </div>,
    document.body
  );

  return (
    <>
      <button
        ref={thumbButtonRef}
        className={cx('project-thumb', isVisible && 'project-thumb-active')}
        onClick={() => { coord.notifyActivated(id); dispatch({ type: 'OPEN' }); }}
        onMouseEnter={handleThumbEnter}
        onMouseLeave={handleThumbLeave}
        aria-label={`Preview ${alt}`}
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
