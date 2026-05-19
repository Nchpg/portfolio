import React from 'react';
import { createPortal } from 'react-dom';
import {
  GithubIcon,
  ExternalLinkIcon,
  DocumentIcon,
  PlayIcon,
  PauseIcon,
  CloseIcon,
} from '../icons';
import { cx } from '../../utils/cx';
import type { LinkIcon, ProjectLinkItem } from '../../data/projects';
import { useCoordinator } from './ProjectThumbContext';
import './ProjectThumb.css';

export { ProjectThumbProvider } from './ProjectThumbContext';

const LINK_ICONS: Record<LinkIcon, React.ComponentType<{ size?: number }>> = {
  github: GithubIcon,
  link: ExternalLinkIcon,
  doc: DocumentIcon,
};

export const ProjectLink = ({ href, icon, label }: ProjectLinkItem) => {
  const Icon = LINK_ICONS[icon];
  return (
    <a className="project-link" href={href} target="_blank" rel="noreferrer">
      {Icon ? <Icon /> : null}
      <span>{label}</span>
    </a>
  );
};

const computePreviewSize = (
  naturalW: number,
  naturalH: number
): { width: string; height: string } | null => {
  if (!naturalW || !naturalH) return null;
  const maxW = window.innerWidth * 0.9;
  const maxH = window.innerHeight * 0.85;
  const ratio = naturalW / naturalH;
  let w = maxW;
  let h = maxW / ratio;
  if (h > maxH) {
    h = maxH;
    w = maxH * ratio;
  }
  return { width: `${w}px`, height: `${h}px` };
};

type ProjectThumbProps = { slug: string; previewExt: string; alt: string };

const ProjectThumb = ({ slug, previewExt, alt }: ProjectThumbProps) => {
  const thumbSrc = `/projects/${slug}/thumbnail.webp`;
  const src = `/projects/${slug}/preview.${previewExt}`;
  const type = previewExt === 'mp4' ? 'video' : 'img';
  const id = React.useId();
  const coord = useCoordinator();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [isShown, setIsShown] = React.useState(false);
  const [previewStyle, setPreviewStyle] = React.useState<{ width: string; height: string } | null>(
    null
  );
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const [isMouseActive, setIsMouseActive] = React.useState(true);
  const inactivityTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverLeaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const closingRef = React.useRef(false);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);
  const thumbButtonRef = React.useRef<HTMLButtonElement>(null);
  const previewRef = React.useRef<HTMLDivElement>(null);
  const scrubCleanupRef = React.useRef<(() => void) | null>(null);
  const [supportsHover, setSupportsHover] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    setSupportsHover(mq.matches);
    const handler = (e: MediaQueryListEvent) => setSupportsHover(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const closePreview = React.useCallback(() => {
    setIsOpen(false);
    setIsHovered(false);
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
  }, []);

  const handleThumbEnter = () => {
    if (coord.isPinnedElsewhere(id)) return;
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    closingRef.current = false;
    coord.notifyActivated(id);
    setIsHovered(true);
  };
  const handleThumbLeave = () => {
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    hoverLeaveTimer.current = setTimeout(() => setIsHovered(false), 200);
  };
  const handlePreviewEnter = () => {
    if (closingRef.current) return;
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    setIsHovered(true);
  };
  const handlePreviewLeave = () => {
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    closingRef.current = true;
    setIsHovered(false);
  };

  React.useEffect(
    () =>
      coord.subscribe((activatedId) => {
        if (activatedId === id) return;
        if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
        setIsHovered(false);
        setIsOpen(false);
      }),
    [coord, id]
  );

  React.useEffect(() => {
    if (!isOpen || !isMounted) return;
    closeButtonRef.current?.focus();
  }, [isOpen, isMounted]);

  React.useEffect(() => {
    if (!isOpen) return;
    const thumbButton = thumbButtonRef.current;
    return () => {
      thumbButton?.focus();
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePreview();
        return;
      }
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
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closePreview]);

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
      isTouch
        ? ((e as React.TouchEvent).touches[0]?.clientX ?? 0)
        : (e as React.MouseEvent).clientX,
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
    }
  };

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    if (v.duration) setProgress(v.currentTime / v.duration);
  };

  const handlePreviewMouseMove = () => {
    setIsMouseActive(true);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => setIsMouseActive(false), 2000);
  };

  React.useEffect(
    () => () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
      scrubCleanupRef.current?.();
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
    if (!isVisible) {
      setIsShown(false);
      return;
    }
    setIsMounted(true);
    const r = requestAnimationFrame(() => setIsShown(true));
    return () => cancelAnimationFrame(r);
  }, [isVisible]);

  const handlePreviewTransitionEnd = (e: React.TransitionEvent) => {
    if (e.target !== e.currentTarget) return;
    if (!isShown) setIsMounted(false);
  };

  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) =>
    setPreviewStyle(
      computePreviewSize(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)
    );
  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) =>
    setPreviewStyle(computePreviewSize(e.currentTarget.videoWidth, e.currentTarget.videoHeight));

  const preview =
    isMounted &&
    createPortal(
      <div
        ref={previewRef}
        className={cx(
          'project-thumb-preview',
          isShown && 'project-thumb-preview--visible',
          isOpen && 'project-thumb-preview--open',
          isMouseActive && 'project-thumb-preview--active'
        )}
        style={previewStyle || undefined}
        onMouseEnter={() => {
          handlePreviewEnter();
          handlePreviewMouseMove();
        }}
        onMouseLeave={handlePreviewLeave}
        onMouseMove={handlePreviewMouseMove}
        onTransitionEnd={handlePreviewTransitionEnd}
        onClick={() => setIsOpen(true)}
        {...(isOpen
          ? { role: 'dialog' as const, 'aria-modal': true, 'aria-label': `${alt} preview` }
          : { 'aria-hidden': true as const })}
      >
        {type === 'video' ? (
          <video
            ref={videoRef}
            src={src}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            onLoadedMetadata={handleVideoLoad}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : (
          <img src={src} alt={alt} onLoad={handleImgLoad} />
        )}
        {type === 'video' && (
          <div className="project-thumb-controls" onClick={(e) => e.stopPropagation()}>
            <button
              className="project-thumb-ctrl"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <div
              className="project-thumb-progress"
              onMouseDown={handleScrubStart}
              onTouchStart={handleScrubStart}
              onKeyDown={handleSliderKeyDown}
              role="slider"
              tabIndex={0}
              aria-label="Seek"
              aria-valuenow={Math.round(progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="project-thumb-progress-fill"
                style={{ width: `${progress * 100}%` }}
              />
              <div
                className="project-thumb-progress-handle"
                style={{ left: `${progress * 100}%` }}
              />
            </div>
          </div>
        )}
        {isOpen && (
          <button
            ref={closeButtonRef}
            className="project-thumb-close"
            onClick={(e) => {
              e.stopPropagation();
              closePreview();
            }}
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
        className={cx('project-thumb', isVisible && 'project-thumb--active')}
        onClick={() => {
          coord.notifyActivated(id);
          setIsOpen(true);
        }}
        onMouseEnter={handleThumbEnter}
        onMouseLeave={handleThumbLeave}
        aria-label={`Preview ${alt}`}
      >
        <img src={thumbSrc} alt="" loading="lazy" />
      </button>
      {preview}
    </>
  );
};

export default ProjectThumb;
