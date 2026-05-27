import type { MetadataRoute } from 'next';
import { SITE_URL } from '../utils/env';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
      alternates: {
        languages: {
          'x-default': baseUrl,
          en: baseUrl,
          fr: `${baseUrl}/fr`,
        },
      },
      images: [`${baseUrl}/og-image.jpg`],
    },
    {
      url: `${baseUrl}/fr`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
      alternates: {
        languages: {
          'x-default': baseUrl,
          en: baseUrl,
          fr: `${baseUrl}/fr`,
        },
      },
    },
    {
      url: `${baseUrl}/projects/ocr-sudoku/report.pdf`,
      lastModified: new Date('2024-06-01'),
      changeFrequency: 'never',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/projects/ms402/report.pdf`,
      lastModified: new Date('2024-06-01'),
      changeFrequency: 'never',
      priority: 0.3,
    },
  ];
}
