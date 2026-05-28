import { describe, it, expect } from "vitest";
import {
  ANIMATION_DEFAULTS,
  PIXEL_BUDGET_TOUCH,
  PIXEL_BUDGET_MOUSE,
  MAX_DPR,
  TRIG_TABLE_SIZE,
  FRAME_MS_60FPS,
  MOUSE_LERP_FACTOR,
  MAX_MOUSE_VELOCITY,
} from "./constants";

describe("animation constants", () => {
  it("PIXEL_BUDGET_TOUCH is less than PIXEL_BUDGET_MOUSE", () => {
    expect(PIXEL_BUDGET_TOUCH).toBeLessThan(PIXEL_BUDGET_MOUSE);
  });

  it("MAX_DPR is a reasonable cap", () => {
    expect(MAX_DPR).toBeGreaterThanOrEqual(1);
    expect(MAX_DPR).toBeLessThanOrEqual(4);
  });

  it("TRIG_TABLE_SIZE is a power of two (required for bitmask)", () => {
    expect(TRIG_TABLE_SIZE & (TRIG_TABLE_SIZE - 1)).toBe(0);
  });

  it("FRAME_MS_60FPS matches 60fps target", () => {
    expect(FRAME_MS_60FPS).toBeCloseTo(1000 / 60, 1);
  });

  it("MOUSE_LERP_FACTOR is between 0 and 1", () => {
    expect(MOUSE_LERP_FACTOR).toBeGreaterThan(0);
    expect(MOUSE_LERP_FACTOR).toBeLessThan(1);
  });

  it("MAX_MOUSE_VELOCITY is positive", () => {
    expect(MAX_MOUSE_VELOCITY).toBeGreaterThan(0);
  });

  it("ANIMATION_DEFAULTS has all required keys", () => {
    const required = [
      "lineColor",
      "waveSpeedX",
      "waveSpeedY",
      "waveAmpX",
      "waveAmpY",
      "xGap",
      "yGap",
      "friction",
      "tension",
      "maxCursorMove",
    ];
    for (const key of required) {
      expect(ANIMATION_DEFAULTS).toHaveProperty(key);
    }
  });

  it("friction is between 0 and 1 (damping factor)", () => {
    expect(ANIMATION_DEFAULTS.friction).toBeGreaterThan(0);
    expect(ANIMATION_DEFAULTS.friction).toBeLessThan(1);
  });
});
