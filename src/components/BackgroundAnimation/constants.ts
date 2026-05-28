export const ANIMATION_DEFAULTS = {
  lineColor: "#fdfdfd14",
  waveSpeedX: 0.0125,
  waveSpeedY: 0.011,
  waveAmpX: 40,
  waveAmpY: 20,
  xGap: 8,
  yGap: 4,
  friction: 0.9,
  tension: 0.011,
  maxCursorMove: 150,
} as const;

export const PIXEL_BUDGET_TOUCH = 300_000;
export const PIXEL_BUDGET_MOUSE = 750_000;
export const MAX_DPR = 2;
export const CANVAS_MARGIN = 80;
export const FIXED_SCALE = 1.4;
export const NOISE_STEP = 4;
export const DATA_STRIDE = 8;
export const TRIG_TABLE_SIZE = 4096;
export const FRAME_MS_60FPS = 16.66;
export const MOUSE_LERP_FACTOR = 0.1;
export const MAX_MOUSE_VELOCITY = 100;
export const AVG_WORK_DECAY = 0.9;
export const FRAME_WORK_HIGH_MS = 14;
export const FRAME_WORK_LOW_MS = 7;
export const MAX_DRAW_STEP = 4;
export const MAX_GRID_POINTS = 120_000;
