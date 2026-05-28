import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";
import { SITE_URL, CONTACT_EMAIL } from "../../utils/env";
import { inter, bebasNeue } from "../fonts";
import { ThemeProvider } from "../../context/ThemeContext";
import PageLoader from "../../components/PageLoader/PageLoader";
import {
  CustomCursor,
  BackgroundAnimationRoot,
} from "../../components/ClientWidgets";

const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Nathan Champagne",
      jobTitle: "AI & Software Engineer",
      url: SITE_URL,
      email: CONTACT_EMAIL,
      image: `${SITE_URL}/og-image.jpg`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Paris",
        addressCountry: "FR",
      },
      alumniOf: { "@type": "EducationalOrganization", name: "EPITA" },
      sameAs: [
        "https://www.linkedin.com/in/nathan-champagne/",
        "https://github.com/Nchpg",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Nathan Champagne Portfolio",
      author: { "@id": `${SITE_URL}/#person` },
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#212121" },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  const title = t("title");
  const description = t("description");

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: "%s | Nathan Champagne",
    },
    description,
    keywords: [
      "AI Engineer",
      "Software Engineer",
      "Nathan Champagne",
      "Machine Learning",
      "Computer Vision",
      "Portfolio",
    ],
    authors: [{ name: "Nathan Champagne" }],
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    alternates: {
      canonical: locale === "en" ? SITE_URL : `${SITE_URL}/fr`,
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: "/favicon.png",
      apple: "/favicon.png",
    },
    openGraph: {
      type: "website",
      url: locale === "en" ? SITE_URL : `${SITE_URL}/fr`,
      locale: locale === "fr" ? "fr_FR" : "en_US",
      siteName: "Nathan Champagne",
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
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/og-image.jpg`],
    },
    other: {
      "geo.region": "FR-IDF",
      "geo.placename": "Paris, France",
      "geo.position": "48.8566;2.3522",
      ICBM: "48.8566, 2.3522",
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
    <html
      lang={locale}
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
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <BackgroundAnimationRoot />
            <PageLoader />
            <CustomCursor />
            <Suspense>{children}</Suspense>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
