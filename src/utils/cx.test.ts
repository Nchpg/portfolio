import { describe, it, expect } from "vitest";
import { cx } from "./cx";

describe("cx", () => {
  it("joins truthy strings", () => {
    expect(cx("a", "b", "c")).toBe("a b c");
  });

  it("filters out false", () => {
    expect(cx("a", false, "b")).toBe("a b");
  });

  it("filters out null", () => {
    expect(cx("a", null, "b")).toBe("a b");
  });

  it("filters out undefined", () => {
    expect(cx("a", undefined, "b")).toBe("a b");
  });

  it("returns empty string when all values are falsy", () => {
    expect(cx(false, null, undefined)).toBe("");
  });

  it("handles a single class", () => {
    expect(cx("only")).toBe("only");
  });

  it("handles conditional class patterns", () => {
    const isActive = true;
    const isDisabled = false;
    expect(
      cx("btn", isActive && "btn--active", isDisabled && "btn--disabled"),
    ).toBe("btn btn--active");
  });
});
