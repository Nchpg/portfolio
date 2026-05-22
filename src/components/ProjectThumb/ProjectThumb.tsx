'use client';

import React from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import ProjectThumbNarrow from './ProjectThumbNarrow';
import ProjectThumbWide from './ProjectThumbWide';
import './ProjectThumb.css';

type ProjectThumbProps = {
  slug: string;
  previewExt: string;
  animatedThumb?: boolean;
  alt: string;
  priority?: boolean;
};

const ProjectThumb = ({ slug, previewExt, animatedThumb = false, alt, priority = false }: ProjectThumbProps) => {
  const thumbSrc = `/projects/${slug}/thumbnail.webp`;
  const src = `/projects/${slug}/preview.${previewExt}`;
  const type = previewExt === 'mp4' ? 'video' : 'img';
  const isNarrow = useMediaQuery('(max-width: 992px)');

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
      />
    );
  }
  return <ProjectThumbNarrow src={src} thumbSrc={thumbSrc} type={type} alt={alt} />;
};

export default ProjectThumb;
