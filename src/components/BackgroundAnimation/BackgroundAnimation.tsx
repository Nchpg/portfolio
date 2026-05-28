"use client";

import React from "react";
import {
  useBackgroundAnimation,
  type AnimationProps,
} from "./useBackgroundAnimation";
import { ANIMATION_DEFAULTS as DEFAULTS } from "./constants";
import "./BackgroundAnimation.css";

type Props = Partial<AnimationProps>;

const BackgroundAnimation = React.memo((props: Props) => {
  const merged: AnimationProps = { ...DEFAULTS, ...props };
  const { canvasRef, containerRef } = useBackgroundAnimation(merged);

  return (
    <div ref={containerRef} className="bg-waves">
      <canvas ref={canvasRef} className="bg-waves-canvas" />
    </div>
  );
});
BackgroundAnimation.displayName = "BackgroundAnimation";

export default BackgroundAnimation;
