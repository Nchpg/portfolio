'use client';

import Image from 'next/image';
import React from 'react';
import { createPortal, flushSync } from 'react-dom';
import { CloseIcon, FullscreenIcon, ExitFullscreenIcon } from '../icons';
import { cx } from '../../utils/cx';
import { useCoordinator } from './ProjectThumbContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import {
  HOVER_LEAVE_DELAY_MS,
  INACTIVITY_DELAY_MS,
  TIMER_THROTTLE_MS,
  SCROLL_DISMISS_PX,
  PreviewStyle,
  computePreviewSize,
  maskForEntry,
  unmaskAfterEntry,
  killTransitionForExit,
  restoreTransitionAfterExit,
} from './shared';
import VideoControls from './VideoControls';

// Shared across all instances: suppresses synthetic mouseenter events that browsers
// fire when a portal is removed and the cursor happens to be over another thumbnail.
// Set to true on Tab navigation, cleared on the next real mousemove.
let suppressHoverUntilMouseMove = false;

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
  | { type: 'UNPIN' }
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
  isMouseActive: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'OPEN':              return { ...state, isOpen: true, isMouseActive: true };
    case 'CLOSE':             return { ...state, isOpen: false, isHovered: false };
    case 'UNPIN':             return { ...state, isOpen: false };
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

// ─── ProjectThumbWide ─────────────────────────────────────────────────────────

export type ProjectThumbWideProps = {
  src: string;
  thumbSrc: string;
  posterSrc?: string;
  type: 'video' | 'img';
  alt: string;
  animatedThumb: boolean;
  priority: boolean;
  forceClose?: boolean;
};

const ProjectThumbWide = ({ src, thumbSrc, posterSrc, type, alt, animatedThumb, priority, forceClose }: ProjectThumbWideProps) => {
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
  const fullscreenFromHoverRef = React.useRef(false);
  const isOpenRef = React.useRef(isOpen);
  React.useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
  const previewLeaveTimeRef = React.useRef(0);
  const lastPreviewTimerSetRef = React.useRef(0);
  const previewLeaveListenerRef = React.useRef<((e: MouseEvent) => void) | null>(null);
  const thumbLeaveListenerRef = React.useRef<((e: MouseEvent) => void) | null>(null);
  const supportsHover = useMediaQuery('(hover: hover) and (pointer: fine)');

  const cancelPreviewLeaveListener = React.useCallback(() => {
    if (previewLeaveListenerRef.current) {
      document.removeEventListener('mouseover', previewLeaveListenerRef.current, true);
      previewLeaveListenerRef.current = null;
    }
  }, []);

  const cancelThumbLeaveListener = React.useCallback(() => {
    if (thumbLeaveListenerRef.current) {
      document.removeEventListener('mouseover', thumbLeaveListenerRef.current, true);
      thumbLeaveListenerRef.current = null;
    }
  }, []);

  const closePreview = React.useCallback((suppressHover = false) => {
    cancelPreviewLeaveListener();
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    if (suppressHover) {
      suppressHoverUntilMouseMove = true;
      document.addEventListener('mousemove', () => { suppressHoverUntilMouseMove = false; }, { once: true });
    }
    dispatch({ type: 'CLOSE' });
  }, [cancelPreviewLeaveListener]);

  const handleThumbEnter = () => {
    if (suppressHoverUntilMouseMove) return;
    // Block quick re-hover only when cursor is NOT coming from our own preview.
    // If closingRef is true the cursor came directly from the preview → allow immediately.
    if (!closingRef.current && Date.now() - previewLeaveTimeRef.current < HOVER_LEAVE_DELAY_MS) return;
    if (coord.isPinnedElsewhere(id)) return;
    cancelPreviewLeaveListener();
    cancelThumbLeaveListener();
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    closingRef.current = false;
    coord.notifyActivated(id);
    dispatch({ type: 'HOVER' });
  };

  const handleThumbLeave = () => {
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    // Watch for the cursor entering a different row: unhover immediately so the
    // old row highlight doesn't linger while the new row's CSS :hover is already active.
    // The 200ms fallback timer still covers the case where cursor goes to the preview
    // (which is not a .project-row) or to empty space.
    const thisRow = thumbButtonRef.current?.closest('.project-row') ?? null;
    const onOtherRowEnter = (e: MouseEvent) => {
      const row = (e.target as Element | null)?.closest('.project-row');
      if (row && row !== thisRow) {
        document.removeEventListener('mouseover', onOtherRowEnter, true);
        thumbLeaveListenerRef.current = null;
        if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
        dispatch({ type: 'UNHOVER' });
      }
    };
    thumbLeaveListenerRef.current = onOtherRowEnter;
    document.addEventListener('mouseover', onOtherRowEnter, true);
    hoverLeaveTimer.current = setTimeout(() => {
      cancelThumbLeaveListener();
      dispatch({ type: 'UNHOVER' });
    }, HOVER_LEAVE_DELAY_MS);
  };

  const handlePreviewLeave = () => {
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    if (isOpen) return; // pinned — only close button / Escape can dismiss
    closingRef.current = true;
    previewLeaveTimeRef.current = Date.now();
    cancelPreviewLeaveListener();
    // Delay CLOSE until cursor enters a different .project-row so A's deactivation
    // transition starts simultaneously with B's CSS :hover transition.
    const thisRow = thumbButtonRef.current?.closest('.project-row') ?? null;
    const onNextRowEnter = (e: MouseEvent) => {
      const row = (e.target as Element | null)?.closest('.project-row');
      if (row && row !== thisRow) {
        document.removeEventListener('mouseover', onNextRowEnter, true);
        previewLeaveListenerRef.current = null;
        if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
        dispatch({ type: 'CLOSE' });
      }
    };
    previewLeaveListenerRef.current = onNextRowEnter;
    document.addEventListener('mouseover', onNextRowEnter, true);
    // Fallback: cursor went to empty space or same-row area (not another .project-row).
    // Shorter than the original 300ms but still long enough for cursor to travel
    // from the preview back to the thumbnail without triggering a close+reopen flash.
    hoverLeaveTimer.current = setTimeout(() => {
      cancelPreviewLeaveListener();
      dispatch({ type: 'CLOSE' });
    }, HOVER_LEAVE_DELAY_MS);
  };

  const handlePreviewMouseMove = () => {
    dispatch({ type: 'SET_MOUSE_ACTIVE', active: true });
    const now = Date.now();
    if (now - lastPreviewTimerSetRef.current > TIMER_THROTTLE_MS) {
      lastPreviewTimerSetRef.current = now;
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(
        () => dispatch({ type: 'SET_MOUSE_ACTIVE', active: false }),
        INACTIVITY_DELAY_MS
      );
    }
  };

  const handlePreviewMouseEnter = () => {
    if (closingRef.current) return;
    cancelPreviewLeaveListener();
    cancelThumbLeaveListener();
    if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
    dispatch({ type: 'HOVER' });
    handlePreviewMouseMove();
  };

  const handleFullscreenChange = React.useCallback((isFs: boolean) => {
    setIsPreviewFullscreen(isFs);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    dispatch({ type: 'SET_MOUSE_ACTIVE', active: false });
    if (!isFs) {
      if (fullscreenFromHoverRef.current) {
        fullscreenFromHoverRef.current = false;
        dispatch({ type: 'UNPIN' });
      } else if (!supportsHover && !isOpenRef.current) {
        closePreview();
      }
    }
  }, [supportsHover, closePreview]);

  const toggleImgFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.detail > 0) (e.currentTarget as HTMLElement).blur();
    const container = previewRef.current as (HTMLDivElement & { webkitRequestFullscreen?: () => void }) | null;
    if (document.fullscreenElement) {
      const el = previewRef.current;
      if (el) killTransitionForExit(el);
      document.exitFullscreen();
    } else {
      fullscreenFromHoverRef.current = !isOpen;
      const el = previewRef.current;
      if (el) maskForEntry(el);
      coord.notifyActivated(id);
      dispatch({ type: 'OPEN' });
      if (container?.requestFullscreen) container.requestFullscreen();
      else if (container?.webkitRequestFullscreen) container.webkitRequestFullscreen();
    }
  };

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
      if (!isFs) {
        if (fullscreenFromHoverRef.current) {
          fullscreenFromHoverRef.current = false;
          dispatch({ type: 'UNPIN' });
        } else if (!supportsHover) {
          closePreview();
        }
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, [type, isOpen, supportsHover, closePreview]);

  // Fullscreen cursor tracking via CSS custom property
  React.useEffect(() => {
    if (!isPreviewFullscreen) return;
    const el = previewRef.current;
    if (!el) return;
    let fsTimer: ReturnType<typeof setTimeout> | null = null;
    let fsLastTimerSet = 0;
    const show = () => { el.style.setProperty('--fs-active', '1'); el.style.cursor = 'default'; };
    const hide = () => { el.style.removeProperty('--fs-active'); el.style.cursor = ''; };
    const onFsMouseMove = () => {
      show();
      const now = Date.now();
      if (now - fsLastTimerSet > TIMER_THROTTLE_MS) {
        fsLastTimerSet = now;
        if (fsTimer) clearTimeout(fsTimer);
        fsTimer = setTimeout(hide, INACTIVITY_DELAY_MS);
      }
    };
    document.addEventListener('mousemove', onFsMouseMove);
    return () => {
      document.removeEventListener('mousemove', onFsMouseMove);
      if (fsTimer) clearTimeout(fsTimer);
      hide();
    };
  }, [isPreviewFullscreen]);

  const handlePreviewTransitionEnd = (e: React.TransitionEvent) => {
    if (e.target !== e.currentTarget) return;
    if (!isShown) dispatch({ type: 'UNMOUNT' });
  };

  const handleDimensionsLoaded = React.useCallback((style: PreviewStyle | null) => {
    dispatch({ type: 'SET_PREVIEW_STYLE', style });
  }, []);

  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) =>
    dispatch({ type: 'SET_PREVIEW_STYLE', style: computePreviewSize(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight) });

  const handleImgError = () => setImgError(true);

  const handleVideoPin = React.useCallback(() => {
    fullscreenFromHoverRef.current = !isOpen;
    coord.notifyActivated(id);
    dispatch({ type: 'OPEN' });
  }, [coord, id, isOpen]);

  // Start inactivity timer as soon as the preview becomes active (hover or pin).
  // Covers: cursor staying on thumbnail without entering preview, and touch (no mouse events).
  // handlePreviewMouseMove resets this timer whenever the cursor moves on the preview.
  React.useEffect(() => {
    if (!isHovered && !isOpen) return;
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(
      () => dispatch({ type: 'SET_MOUSE_ACTIVE', active: false }),
      INACTIVITY_DELAY_MS
    );
    return () => { if (inactivityTimer.current) clearTimeout(inactivityTimer.current); };
  }, [isHovered, isOpen]);

  React.useEffect(
    () =>
      coord.subscribe((activatedId) => {
        if (activatedId === id) return;
        cancelThumbLeaveListener();
        if (hoverLeaveTimer.current) clearTimeout(hoverLeaveTimer.current);
        dispatch({ type: 'DEACTIVATE' });
      }),
    [coord, id, cancelThumbLeaveListener]
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
      if (thumbButton?.isConnected) thumbButton.focus();
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
      if (!isOpen && e.key === 'Escape') {
        suppressHoverUntilMouseMove = true;
        document.addEventListener('mousemove', () => { suppressHoverUntilMouseMove = false; }, { once: true });
        flushSync(() => {
          closePreview();
          dispatch({ type: 'HIDE' });
          dispatch({ type: 'UNMOUNT' });
        });
        return;
      }
      if (!isOpen && e.key === 'Tab') {
        // Tab in hover mode: keep row highlighted during close animation so it
        // stays active until :hover takes over on the next pointer event.
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
          // Remove portal instantly (no 250ms fade-out) so it doesn't overlap
          // with another row's :hover. Row transition plays normally.
          // HIDE resets isShown so the next open gets its fade-in back.
          flushSync(() => {
            closePreview(true);
            dispatch({ type: 'HIDE' });
            dispatch({ type: 'UNMOUNT' });
          });
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
      cancelPreviewLeaveListener();
      cancelThumbLeaveListener();
      coord.clearPinnedIf(id);
    },
    [coord, id, cancelPreviewLeaveListener, cancelThumbLeaveListener]
  );

  React.useEffect(() => {
    if (isOpen) coord.setPinned(id);
    else coord.clearPinnedIf(id);
  }, [isOpen, coord, id]);

  // Graceful close when the entry switches to narrow mode while a portal is open
  React.useEffect(() => {
    if (forceClose) closePreview();
  }, [forceClose, closePreview]);

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
        ? <VideoControls src={src} poster={posterSrc} isOpen={isOpen} preload="none" containerRef={previewRef} onPin={handleVideoPin} onFullscreenChange={handleFullscreenChange} onDimensionsLoaded={handleDimensionsLoaded} />
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
        {thumbSrc.endsWith('.mp4') ? (
          <video
            src={thumbSrc}
            autoPlay
            loop
            muted
            playsInline
            width={600}
            height={400}
          />
        ) : (
          <Image
            src={thumbSrc}
            alt={`Thumbnail for ${alt}`}
            width={600}
            height={400}
            sizes="(max-width: 768px) calc(100vw - 44px), (max-width: 992px) 92vw, 300px"
            priority={priority}
          />
        )}
      </button>
      {preview}
    </>
  );
};

export default React.memo(ProjectThumbWide);
