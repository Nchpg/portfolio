'use client';

import dynamic from 'next/dynamic';

export const CustomCursor = dynamic(() => import('./CustomCursor/CustomCursor'), { ssr: false });
export const FooterSpacerScene = dynamic(() => import('./FooterSpacerScene/FooterSpacerScene'), { ssr: false });
