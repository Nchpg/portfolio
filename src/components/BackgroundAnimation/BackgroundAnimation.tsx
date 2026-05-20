'use client';

import { useBackgroundAnimation, type AnimationProps } from './useBackgroundAnimation';
import './BackgroundAnimation.css';

type Props = Partial<AnimationProps>;

const DEFAULTS: AnimationProps = {
  lineColor: '#fdfdfd14',
  backgroundColor: '#212121',
  waveSpeedX: 0.0125,
  waveSpeedY: 0.011,
  waveAmpX: 40,
  waveAmpY: 20,
  xGap: 8,
  yGap: 4,
  friction: 0.9,
  tension: 0.011,
  maxCursorMove: 150,
};

const BackgroundAnimation = (props: Props) => {
  const merged: AnimationProps = { ...DEFAULTS, ...props };
  const { canvasRef, containerRef } = useBackgroundAnimation(merged);

  return (
    <div
      ref={containerRef}
      className="bg-waves"
      style={{ backgroundColor: merged.backgroundColor }}
    >
      <canvas ref={canvasRef} className="bg-waves__canvas" />
    </div>
  );
};

export default BackgroundAnimation;
