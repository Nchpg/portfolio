'use client';

import { useTheme } from '../../context/ThemeContext';
import BackgroundAnimation from './BackgroundAnimation';

const ANIM_DARK = { lineColor: 'rgba(253,253,253,0.08)' };
const ANIM_LIGHT = { lineColor: 'rgba(26,26,26,0.20)' };

const BackgroundAnimationRoot = () => {
  const { theme } = useTheme();
  return <BackgroundAnimation {...(theme === 'light' ? ANIM_LIGHT : ANIM_DARK)} />;
};

export default BackgroundAnimationRoot;
