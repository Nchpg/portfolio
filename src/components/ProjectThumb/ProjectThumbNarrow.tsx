'use client';

import React from 'react';
import { FullscreenIcon, ExitFullscreenIcon } from '../icons';
import { cx } from '../../utils/cx';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import {
  INACTIVITY_DELAY_MS,
  NOOP,
  unmaskAfterEntry,
  killTransitionForExit,
  restoreTransitionAfterExit,
} from './shared';
import VideoControls from './VideoControls';

export type ProjectThumbNarrowProps = {
  src: string;
  thumbSrc: string;
  type: 'video' | 'img';
  alt: string;
};

const ProjectThumbNarrow = ({ src, thumbSrc, type, alt }: ProjectThumbNarrowProps) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [controlsActive, setControlsActive] = React.useState(false);
  const justActivatedRef = React.useRef(false);
  const mouseTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);
  const supportsHover = useMediaQuery('(hover: hover) and (pointer: fine)');

  // Img fullscreen listener
  React.useEffect(() => {
    if (type !== 'img') return;
    const onFsChange = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element };
      const isFs = !!(document.fullscreenElement || doc.webkitFullscreenElement);
      setIsFullscreen(isFs);
      const el = containerRef.current;
      if (!el) return;
      if (isFs) unmaskAfterEntry(el);
      else { killTransitionForExit(el); restoreTransitionAfterExit(el); }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, [type]);

  // Fullscreen cursor tracking via CSS custom property
  React.useEffect(() => {
    if (!isFullscreen) return;
    const el = containerRef.current;
    if (!el) return;
    let fsTimer: ReturnType<typeof setTimeout> | null = null;
    const show = () => { el.style.setProperty('--fs-active', '1'); el.style.cursor = 'default'; };
    const hide = () => { el.style.removeProperty('--fs-active'); el.style.cursor = ''; };
    const onMove = () => {
      show();
      if (fsTimer) clearTimeout(fsTimer);
      fsTimer = setTimeout(hide, INACTIVITY_DELAY_MS);
    };
    document.addEventListener('mousemove', onMove);
    return () => {
      document.removeEventListener('mousemove', onMove);
      if (fsTimer) clearTimeout(fsTimer);
      hide();
    };
  }, [isFullscreen]);

  // Auto-hide controls after 3s of inactivity
  React.useEffect(() => {
    if (!controlsActive) return;
    const timer = setTimeout(() => setControlsActive(false), 3000);
    return () => clearTimeout(timer);
  }, [controlsActive]);

  // Hide controls when tapping outside
  React.useEffect(() => {
    if (!controlsActive) return;
    const onOutside = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setControlsActive(false);
      }
    };
    document.addEventListener('pointerdown', onOutside);
    return () => document.removeEventListener('pointerdown', onOutside);
  }, [controlsActive]);

  const handleMouseActivity = React.useCallback(() => {
    if (!supportsHover) return;
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty('--narrow-active', '1');
    el.style.setProperty('--narrow-pe', 'auto');
    if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
    mouseTimerRef.current = setTimeout(() => {
      el.style.removeProperty('--narrow-active');
      el.style.removeProperty('--narrow-pe');
    }, INACTIVITY_DELAY_MS);
  }, [supportsHover]);

  React.useEffect(() => () => {
    if (mouseTimerRef.current) clearTimeout(mouseTimerRef.current);
  }, []);

  const toggleImgFullscreen = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.detail > 0) (e.currentTarget as HTMLElement).blur();
    const container = containerRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      if (container?.requestFullscreen) container.requestFullscreen();
      else if (container?.webkitRequestFullscreen) container.webkitRequestFullscreen();
    }
  }, []);

  // First touch tap shows controls; stopPropagation prevents children from receiving it
  const handlePointerDownCapture = React.useCallback((e: React.PointerEvent) => {
    if (supportsHover) return;
    if (!controlsActive) {
      e.stopPropagation();
      justActivatedRef.current = true;
      setControlsActive(true);
    }
  }, [supportsHover, controlsActive]);

  // Absorbs the synthetic click that follows pointerdown on the first tap
  const handleClickCapture = React.useCallback((e: React.MouseEvent) => {
    if (justActivatedRef.current) {
      justActivatedRef.current = false;
      e.stopPropagation();
    }
  }, []);

  // Clears flag if scroll cancels the gesture (no click will follow)
  const handlePointerCancelCapture = React.useCallback(() => {
    justActivatedRef.current = false;
  }, []);

  return (
    <div
      ref={containerRef}
      className={cx('project-thumb', 'project-thumb-narrow', controlsActive && 'project-thumb-narrow-active')}
      onMouseEnter={handleMouseActivity}
      onMouseMove={handleMouseActivity}
      onPointerDownCapture={handlePointerDownCapture}
      onPointerCancelCapture={handlePointerCancelCapture}
      onClickCapture={handleClickCapture}
    >
      {type === 'video' ? (
        <VideoControls
          src={src}
          poster={thumbSrc}
          isOpen={true}
          containerRef={containerRef}
          onPin={NOOP}
          onFullscreenChange={setIsFullscreen}
          onDimensionsLoaded={NOOP}
        />
      ) : imgError ? (
        <div className="project-thumb-error">Preview unavailable</div>
      ) : (
        <>
          <img src={src} alt={`Preview of ${alt}`} onError={() => setImgError(true)} />
          <button
            className="project-thumb-img-fs"
            onClick={toggleImgFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
          </button>
        </>
      )}
    </div>
  );
};

export default ProjectThumbNarrow;
