import type { Metadata, Viewport } from 'next';
import './globals.css';
import { inter, bebasNeue } from './fonts';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nathanchampagne.dev';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#212121' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Nathan Champagne - AI & Software Engineer Portfolio',
    template: '%s | Nathan Champagne',
  },
  description:
    'Portfolio of Nathan Champagne - AI & Software Engineer based in Paris, France. Projects in machine learning, computer vision, and software development.',
  keywords: [
    'AI Engineer',
    'Software Engineer',
    'Nathan Champagne',
    'Machine Learning',
    'Computer Vision',
    'Portfolio',
  ],
  authors: [{ name: 'Nathan Champagne' }],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    locale: 'en_US',
    siteName: 'Nathan Champagne',
    title: 'Nathan Champagne - AI & Software Engineer Portfolio',
    description:
      'Portfolio of Nathan Champagne - AI & Software Engineer based in Paris, France. Projects in machine learning, computer vision, and software development.',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Nathan Champagne - AI & Software Engineer Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nathan Champagne - AI & Software Engineer Portfolio',
    description:
      'Portfolio of Nathan Champagne - AI & Software Engineer based in Paris, France. Projects in machine learning, computer vision, and software development.',
    images: [`${siteUrl}/og-image.jpg`],
  },
  other: {
    'geo.region': 'FR-IDF',
    'geo.placename': 'Paris, France',
    'geo.position': '48.8566;2.3522',
    ICBM: '48.8566, 2.3522',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: 'Nathan Champagne',
      jobTitle: 'AI & Software Engineer',
      description:
        'Portfolio of Nathan Champagne - AI & Software Engineer based in Paris, France. Projects in machine learning, computer vision, and software development.',
      url: siteUrl,
      email: 'nathan.champagne@epita.fr',
      image: `${siteUrl}/og-image.jpg`,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Paris',
        addressCountry: 'FR',
      },
      alumniOf: {
        '@type': 'EducationalOrganization',
        name: 'EPITA',
      },
      knowsAbout: [
        'Machine Learning',
        'Reinforcement Learning',
        'Computer Vision',
        'Deep Learning',
        'Generative AI',
        'Full-Stack Development',
        'Python',
        'React',
        'C++',
        'C#',
        'Unity',
      ],
      sameAs: ['https://www.linkedin.com/in/nathan-champagne/', 'https://github.com/Nchpg'],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Nathan Champagne Portfolio',
      description: 'Portfolio of Nathan Champagne - AI & Software Engineer based in Paris, France.',
      author: { '@id': `${siteUrl}/#person` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
