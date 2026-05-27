import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '../../i18n/routing';
import { SITE_URL } from '../../utils/env';
import LocaleHtml from '../../components/LocaleHtml';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  const title = t('title');
  const description = t('description');

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: '%s | Nathan Champagne',
    },
    description,
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
      canonical: locale === 'en' ? SITE_URL : `${SITE_URL}/fr`,
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
      url: locale === 'en' ? SITE_URL : `${SITE_URL}/fr`,
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      siteName: 'Nathan Champagne',
      title,
      description,
      images: [
        {
          url: `${SITE_URL}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/og-image.jpg`],
    },
    other: {
      'geo.region': 'FR-IDF',
      'geo.placename': 'Paris, France',
      'geo.position': '48.8566;2.3522',
      ICBM: '48.8566, 2.3522',
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <LocaleHtml locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}
