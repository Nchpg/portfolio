import React from 'react';
import ReactDOM from 'react-dom';
import {
  GithubIcon,
  ExternalLinkIcon,
  DocumentIcon,
  PlayIcon,
  PauseIcon,
  CloseIcon,
} from '../icons';
import { cx } from '../../utils/cx';
import './ProjectThumb.css';

const LINK_ICONS = {
  github: GithubIcon,
  link: ExternalLinkIcon,
  doc: DocumentIcon,
};

export const ProjectLink = ({ href, icon, label }) => {
  const Icon = LINK_ICONS[icon];
  return (
    <a className="project-link" href={href} target="_blank" rel="noreferrer">
      {Icon ? <Icon /> : null}
      <span>{label}</span>
    </a>
  );
};

const computePreviewSize = (naturalW, naturalH) => {
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

// Cross-instance coordination: exposes the "currently pinned" id and a pub/sub
// for "another thumb just claimed activity, close yourself if you're not it".
// All shared state lives in a ref inside the provider - no module-level mutables,
// no window events. HMR-safe (state resets when the provider re-mounts).
const ProjectThumbContext = React.createContext(null);

export const ProjectThumbProvider = ({ children }) => {
  const stateRef = React.useRef({ pinnedId: null, listeners: new Set() });
  const api = React.useMemo(
    () => ({
      isPinnedElsewhere: (id) => {
        const p = stateRef.current.pinnedId;
        return p !== null && p !== id;
      },
      setPinned: (id) => {
        stateRef.current.pinnedId = id;
      },
      clearPinnedIf: (id) => {
        if (stateRef.current.pinnedId === id) stateRef.current.pinnedId = null;
      },
      notifyActivated: (id) => stateRef.current.listeners.forEach((cb) => cb(id)),
      subscribe: (cb) => {
        stateRef.current.listeners.add(cb);
        return () => stateRef.current.listeners.delete(cb);
      },
    }),
    []
  );
  return <ProjectThumbContext.Provider value={api}>{children}</ProjectThumbContext.Provider>;
};

const useCoordinator = () => {
  const ctx = React.useContext(ProjectThumbContext);
  if (!ctx) throw new Error('ProjectThumb must be inside <ProjectThumbProvider>');
  return ctx;
};

const ProjectThumb = ({ slug, previewExt, alt }) => {
  const thumbSrc = `/projects/${slug}/thumbnail.webp`;
  const src = `/projects/${slug}/preview.${previewExt}`;
  const type = previewExt === 'mp4' ? 'video' : 'img';
  const id = React.useId();
  const coord = useCoordinator();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [isShown, setIsShown] = React.useState(false);
  const [previewStyle, setPreviewStyle] = React.useState(null);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const [isMouseActive, setIsMouseActive] = React.useState(true);
  const inactivityTimer = React.useRef(null);
  const hoverLeaveTimer = React.useRef(null);
  const videoRef = React.useRef(null);
  // Once the user has actually left the preview (mouseLeave fired), suppress
  // any mouseEnter that bubbles back during the fade-out - the fading element
  // can still sit under the cursor and would otherwise re-open the hover.
  const closingRef = React.useRef(false);

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
  const supportsHover =
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const togglePlay = (e) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const seekFromEvent = (clientX, bar) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    v.currentTime = ratio * v.duration;
    setProgress(ratio);
  };

  const handleScrubStart = (e) => {
    e.stopPropagation();
    const bar = e.currentTarget;
    const isTouch = e.type === 'touchstart';
    const getX = (ev) => (isTouch ? ev.touches[0].clientX : ev.clientX);
    seekFromEvent(getX(e), bar);
    const move = (ev) => seekFromEvent(getX(ev), bar);
    const stop = () => {
      window.removeEventListener(isTouch ? 'touchmove' : 'mousemove', move);
      window.removeEventListener(isTouch ? 'touchend' : 'mouseup', stop);
    };
    window.addEventListener(isTouch ? 'touchmove' : 'mousemove', move);
    window.addEventListener(isTouch ? 'touchend' : 'mouseup', stop);
  };

  const handleTimeUpdate = (e) => {
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
      coord.clearPinnedIf(id);
    },
    [coord, id]
  );

  React.useEffect(() => {
    if (isOpen) coord.setPinned(id);
    else coord.clearPinnedIf(id);
  }, [isOpen, coord, id]);

  const isVisible = isOpen || (supportsHover && isHovered);

  // Mount/unmount the preview around its CSS opacity+scale transition:
  // - on open: mount first (renders at opacity 0), then add --visible next frame
  //   so the browser has a starting style to transition from.
  // - on close: drop --visible to fade out; the actual unmount happens on
  //   transitionend (handler below). No magic timeout.
  React.useEffect(() => {
    if (isVisible) {
      setIsMounted(true);
      const r = requestAnimationFrame(() => setIsShown(true));
      return () => cancelAnimationFrame(r);
    }
    setIsShown(false);
  }, [isVisible]);

  const handlePreviewTransitionEnd = (e) => {
    if (e.target !== e.currentTarget) return; // ignore bubbled child transitions
    if (!isShown) setIsMounted(false);
  };

  const handleImgLoad = (e) =>
    setPreviewStyle(
      computePreviewSize(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)
    );
  const handleVideoLoad = (e) =>
    setPreviewStyle(computePreviewSize(e.currentTarget.videoWidth, e.currentTarget.videoHeight));

  const preview =
    isMounted &&
    ReactDOM.createPortal(
      <div
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
        aria-hidden="true"
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
          <img src={src} alt="" onLoad={handleImgLoad} />
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
              role="slider"
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
            className="project-thumb-close"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setIsHovered(false);
              if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
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
      <div
        className={cx('project-thumb', isVisible && 'project-thumb--active')}
        onClick={() => {
          coord.notifyActivated(id);
          setIsOpen(true);
        }}
        onMouseEnter={handleThumbEnter}
        onMouseLeave={handleThumbLeave}
      >
        <img src={thumbSrc} alt={alt} loading="lazy" />
      </div>
      {preview}
    </>
  );
};

export default ProjectThumb;
