'use client';

import React from 'react';
import { PlayIcon, PauseIcon, FullscreenIcon, ExitFullscreenIcon } from '../icons';
import {
  maskForEntry,
  unmaskAfterEntry,
  killTransitionForExit,
  restoreTransitionAfterExit,
} from './shared';

export type VideoControlsProps = {
  src: string;
  poster: string;
  isOpen: boolean;
  isHovered: boolean;
  shouldPlay: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onPin: () => void;
  onFullscreenChange: (isFs: boolean) => void;
  onDimensionsLoaded: (w: number, h: number) => void;
};

const VideoControls = React.memo(({ src, poster, isOpen, isHovered, shouldPlay, containerRef, onPin, onFullscreenChange, onDimensionsLoaded }: VideoControlsProps) => {
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const progressContainerRef = React.useRef<HTMLDivElement>(null);
  const lastPctRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const el = progressContainerRef.current;
    if (!el) return;
    el.setAttribute('aria-valuenow', '0');
    el.setAttribute('aria-valuetext', '0%');
  }, []);

  const updateProgressUI = React.useCallback((ratio: number) => {
    const pctRounded = Math.round(ratio * 100);
    const container = progressContainerRef.current;
    if (container) {
      container.style.setProperty('--progress', `${ratio * 100}%`);
      if (lastPctRef.current !== pctRounded) {
        lastPctRef.current = pctRounded;
        container.setAttribute('aria-valuenow', pctRounded.toString());
        container.setAttribute('aria-valuetext', `${pctRounded}%`);
      }
    }
  }, []);

  const setFs = React.useCallback((isFs: boolean) => {
    setIsFullscreen(isFs);
    onFullscreenChange(isFs);
  }, [onFullscreenChange]);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const scrubCleanupRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    const v = videoRef.current;
    if (v) setIsPlaying(!v.paused);
  }, []);

  React.useEffect(() => () => { scrubCleanupRef.current?.(); }, []);

  React.useEffect(() => {
    if (!isHovered) return;
    const v = videoRef.current;
    if (v) v.currentTime = 0;
  }, [isHovered]);

  const autoPausedRef = React.useRef(false);
  React.useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (isOpen || shouldPlay) {
      if (autoPausedRef.current) { v.play().catch(() => {}); autoPausedRef.current = false; }
    } else {
      if (!v.paused) { v.pause(); autoPausedRef.current = true; }
    }
  }, [shouldPlay, isOpen]);

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
      (document.exitFullscreen ?? doc.webkitExitFullscreen)?.call(document).catch?.(() => {});
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
    onDimensionsLoaded(e.currentTarget.videoWidth, e.currentTarget.videoHeight);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    if (v.duration) updateProgressUI(v.currentTime / v.duration);
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
    updateProgressUI(ratio);
  };

  const handleScrubStart = (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
    e.stopPropagation();
    const bar = e.currentTarget;
    const isTouch = e.type === 'touchstart';
    const getX = (ev: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) =>
      isTouch
        ? ((ev as TouchEvent | React.TouchEvent).touches[0]?.clientX ?? 0)
        : (ev as MouseEvent | React.MouseEvent).clientX;

    let pendingX = getX(e);
    seekFromEvent(pendingX, bar);

    const moveEvent = isTouch ? 'touchmove' : 'mousemove';
    const stopEvent = isTouch ? 'touchend' : 'mouseup';
    let rafId = 0;

    const move = (ev: MouseEvent | TouchEvent) => {
      pendingX = getX(ev);
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        seekFromEvent(pendingX, bar);
        rafId = 0;
      });
    };

    const stop = () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener(moveEvent, move);
      window.removeEventListener(stopEvent, stop);
      scrubCleanupRef.current = null;
    };

    scrubCleanupRef.current = stop;
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
        {/* eslint-disable-next-line jsx-a11y/role-has-required-aria-props */}
        <div
          ref={progressContainerRef}
          className="project-thumb-progress"
          onMouseDown={handleScrubStart}
          onTouchStart={handleScrubStart}
          onKeyDown={handleSliderKeyDown}
          role="slider"
          tabIndex={isOpen ? 0 : -1}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="project-thumb-progress-fill" />
          <div className="project-thumb-progress-handle" />
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

export default VideoControls;
