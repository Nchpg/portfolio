'use client';

import React from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { BP } from '../../utils/breakpoints';
import ProjectThumbNarrow from './ProjectThumbNarrow';
import ProjectThumbWide from './ProjectThumbWide';
import './ProjectThumb.css';

type ProjectThumbProps = {
  slug: string;
  previewExt: string;
  animatedThumb?: boolean;
  alt: string;
  priority?: boolean;
  mountDelay?: number;
};

const ProjectThumb = ({ slug, previewExt, animatedThumb = false, alt, priority = false, mountDelay = 0 }: ProjectThumbProps) => {
  const thumbSrc = `/projects/${slug}/thumbnail.webp`;
  const type = previewExt === 'mp4' ? 'video' : 'img';

  const isMobile  = useMediaQuery(`(max-width: ${BP.xs}px)`);
  const isTabletS = useMediaQuery(`(max-width: ${BP.md}px)`);
  const isNarrow  = useMediaQuery(`(max-width: ${BP.lg}px)`);

  const videoWidth = isMobile ? 640 : isTabletS ? 960 : 1280;
  const src = previewExt === 'mp4'
    ? `/projects/${slug}/preview-${videoWidth}.mp4`
    : `/projects/${slug}/preview.${previewExt}`;

  // Keep wide mounted briefly when switching to narrow so its close animation plays.
  // 300ms > 250ms CSS transition on .project-thumb-preview.
  const [animatingOutWide, setAnimatingOutWide] = React.useState(false);
  React.useEffect(() => {
    if (!isNarrow) { setAnimatingOutWide(false); return; }
    setAnimatingOutWide(true);
    const t = setTimeout(() => setAnimatingOutWide(false), 300);
    return () => clearTimeout(t);
  }, [isNarrow]);

  const showWide = !isNarrow || animatingOutWide;

  if (showWide) {
    return (
      <ProjectThumbWide
        src={src}
        thumbSrc={thumbSrc}
        type={type}
        alt={alt}
        animatedThumb={animatedThumb}
        priority={priority}
        forceClose={isNarrow}
        mountDelay={mountDelay}
      />
    );
  }
  return <ProjectThumbNarrow src={src} thumbSrc={thumbSrc} type={type} alt={alt} />;
};

export default ProjectThumb;
