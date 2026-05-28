import type { ReactNode } from 'react';
import { Suspense } from 'react';
import type { Viewport } from 'next';
import './globals.css';
import { inter, bebasNeue } from './fonts';
import { ThemeProvider } from '../context/ThemeContext';
import PageLoader from '../components/PageLoader/PageLoader';
import { CustomCursor, BackgroundAnimationRoot } from '../components/ClientWidgets';
import { SITE_URL, CONTACT_EMAIL } from '../utils/env';

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}})();`;

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: 'Nathan Champagne',
      jobTitle: 'AI & Software Engineer',
      url: SITE_URL,
      email: CONTACT_EMAIL,
      image: `${SITE_URL}/og-image.jpg`,
      address: { '@type': 'PostalAddress', addressLocality: 'Paris', addressCountry: 'FR' },
      alumniOf: { '@type': 'EducationalOrganization', name: 'EPITA' },
      sameAs: ['https://www.linkedin.com/in/nathan-champagne/', 'https://github.com/Nchpg'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Nathan Champagne Portfolio',
      author: { '@id': `${SITE_URL}/#person` },
    },
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f7f2' },
    { media: '(prefers-color-scheme: dark)', color: '#212121' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      suppressHydrationWarning
      className={`${inter.variable} ${bebasNeue.variable}`}
    >
      <head>
        <link rel="dns-prefetch" href="https://www.linkedin.com" />
        <link rel="dns-prefetch" href="https://github.com" />
        <link rel="dns-prefetch" href="https://cloud.umami.is" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
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
        <ThemeProvider>
          <BackgroundAnimationRoot />
          <PageLoader />
          <CustomCursor />
          <Suspense>{children}</Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
