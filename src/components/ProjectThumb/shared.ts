export const HOVER_LEAVE_DELAY_MS = 200;
export const INACTIVITY_DELAY_MS = 2000;
export const SCROLL_DISMISS_PX = 80;

export const NOOP = () => {};

export type PreviewStyle = { width: string; height: string };

export const computePreviewSize = (naturalW: number, naturalH: number): PreviewStyle | null => {
  if (!naturalW || !naturalH) return null;
  const maxW = window.innerWidth * 0.9;
  const maxH = window.innerHeight * 0.85;
  const ratio = naturalW / naturalH;
  let w = maxW;
  let h = maxW / ratio;
  if (h > maxH) { h = maxH; w = maxH * ratio; }
  return { width: `${w}px`, height: `${h}px` };
};

export function maskForEntry(el: HTMLElement) {
  el.style.transition = 'none';
  el.style.opacity = '0';
  void el.offsetHeight;
}

export function unmaskAfterEntry(el: HTMLElement) {
  el.style.opacity = '';
  requestAnimationFrame(() => { el.style.transition = ''; });
}

export function killTransitionForExit(el: HTMLElement) {
  el.style.transition = 'none';
  void el.offsetHeight;
}

export function restoreTransitionAfterExit(el: HTMLElement) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { el.style.transition = ''; });
  });
}
