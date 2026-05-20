'use client';

import { useBackgroundAnimation, type AnimationProps } from './useBackgroundAnimation';
import { ANIMATION_DEFAULTS as DEFAULTS } from './constants';
import './BackgroundAnimation.css';

type Props = Partial<AnimationProps>;

const BackgroundAnimation = (props: Props) => {
  const merged: AnimationProps = { ...DEFAULTS, ...props };
  const { canvasRef, containerRef } = useBackgroundAnimation(merged);

  return (
    <div
      ref={containerRef}
      className="bg-waves"
      style={{ backgroundColor: merged.backgroundColor }}
    >
      <canvas ref={canvasRef} className="bg-waves-canvas" />
    </div>
  );
};

export default BackgroundAnimation;
