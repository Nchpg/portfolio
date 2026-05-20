import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nathan Champagne Portfolio',
    short_name: 'N.Champagne',
    description: 'AI & Software Engineer based in Paris, France.',
    start_url: '/',
    display: 'standalone',
    background_color: '#212121',
    theme_color: '#212121',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
