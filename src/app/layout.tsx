import type { Metadata, Viewport } from 'next';
import './globals.css';
import { inter, bebasNeue } from './fonts';
import PageLoader from '../components/PageLoader/PageLoader';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nathanchampagne.dev';
const siteTitle = 'Nathan Champagne - AI & Software Engineer Portfolio';
const siteDescription =
  'Portfolio of Nathan Champagne - AI & Software Engineer based in Paris, France. Projects in machine learning, computer vision, and software development.';

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
    default: siteTitle,
    template: '%s | Nathan Champagne',
  },
  description: siteDescription,
  keywords: [
    'AI Engineer',
    'Software Engineer',
    'Nathan Champagne',
    'Machine Learning',
    'Computer Vision',
    'Portfolio',
  ],
  authors: [{ name: 'Nathan Champagne' }],
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
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
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
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
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="2e50db68-faa2-4c05-ad9c-1b73580ee2a4"
        />
      </head>
      <body suppressHydrationWarning>
        <PageLoader />
        {children}
      </body>
    </html>
  );
}
