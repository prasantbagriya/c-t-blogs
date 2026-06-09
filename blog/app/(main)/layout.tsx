import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import Link from 'next/link';
import Copyright from './Copyright';
import MobileNav from '@/components/MobileNav';
import SliderInitializer from '@/components/SliderInitializer';
import GlobalNavbar from '@/components/GlobalNavbar';
import GlobalFooter from '@/components/GlobalFooter';

// FIX: Load ONLY the font weights actually used (400,600,700,800)
// Reduces font payload by ~40% vs loading all weights
// This directly improves LCP score on mobile
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  // FIX: Only include weights used in the UI (audit showed 300/500/900 not used)
  weight: ['400', '600', '700', '800'],
  fallback: ['system-ui', '-apple-system', 'Helvetica Neue', 'sans-serif'],
  adjustFontFallback: true, // FIX: reduces CLS from font swap
});

export const metadata: Metadata = {
  metadataBase: new URL('https://chatwizs.com'),
  title: {
    default: "ChatWizs | Expert Insights & SEO Optimized Content",
    template: "%s | ChatWizs",
  },
  description: "Expert-verified articles on SEO, technology, and digital marketing. Built for Google 2026 policy compliance with full EEAT signals.",
  keywords: ["blog", "seo", "technology", "digital marketing", "core web vitals", "eeat", "google 2026", "web development"],
  authors: [{ name: "ChatWizs Editorial Team", url: 'https://chatwizs.com/about' }],
  creator: 'ChatWizs',
  publisher: 'ChatWizs',
  category: 'Technology',
  alternates: {
    canonical: '/',
    // ✅ GEO SEO 2026: hreflang signals for India English audience
    // Since there's only one language version, we signal the target region via metadata
    languages: {
      'en-IN': 'https://chatwizs.com',
      'x-default': 'https://chatwizs.com',
    },
    types: {
      'application/rss+xml': '/feed.xml',
      'application/atom+xml': '/feed.xml',
    },
  },
  openGraph: {
    title: "ChatWizs | Expert Insights & SEO Optimized Content",
    description: "Expert-verified articles with full EEAT compliance, structured data, and Core Web Vitals optimization.",
    type: "website",
    url: 'https://chatwizs.com',
    siteName: 'ChatWizs',
    // ✅ GEO SEO: en_IN locale signals India-targeted English content to Google
    locale: 'en_IN',
    alternateLocale: ['en_US'],
    images: [{ url: 'https://chatwizs.com/og-image.jpg', width: 1200, height: 630, alt: 'ChatWizs — Expert Insights & SEO Optimized Content' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChatWizs',
    description: 'Expert-verified content optimized for Google search.',
    creator: '@chatwizs',
    site: '@chatwizs',
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'YQfd5rzgI0gkUOhQkfJYQl66T_IBpiy85WOk8H0OzH0',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1d4ed8' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  // FIX: Allow user scaling (accessibility requirement for Lighthouse)
  userScalable: true,
  // FIX: Prevents viewport resize on keyboard open (reduces CLS on mobile)
  interactiveWidget: 'resizes-content',
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = 'https://chatwizs.com';

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'NewsMediaOrganization'],
        '@id': `${baseUrl}/#organization`,
        name: 'ChatWizs',
        alternateName: 'ChatWizs Blog',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/logo.png`,
          width: 512,
          height: 512,
          caption: 'ChatWizs Logo',
        },
        foundingDate: '2024-01-01',
        founder: {
          '@type': 'Person',
          name: 'ChatWizs Team',
          url: `${baseUrl}/about`,
        },
        contactPoint: [
          {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: 'support@chatwizs.com',
            availableLanguage: ['English'],
            // ✅ GEO SEO: India contact point signal
            areaServed: 'IN',
          },
          {
            '@type': 'ContactPoint',
            contactType: 'editorial',
            email: 'editorial@chatwizs.com',
            availableLanguage: ['English'],
          },
        ],
        // ✅ GEO SEO 2026: Geographic headquarters location coordinates signal
        location: {
          '@type': 'Place',
          name: 'ChatWizs Headquarters',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Bandra Kurla Complex, Bandra East',
            addressLocality: 'Mumbai',
            addressRegion: 'Maharashtra',
            postalCode: '400051',
            addressCountry: 'IN',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: '19.0596',
            longitude: '72.8683',
          },
        },
        // ✅ GEO SEO 2026: Geographic entity signals for India targeting
        areaServed: [
          { '@type': 'Country', name: 'India', sameAs: 'https://www.wikidata.org/wiki/Q668' },
          { '@type': 'Country', name: 'United States', sameAs: 'https://www.wikidata.org/wiki/Q30' },
        ],
        audience: {
          '@type': 'Audience',
          audienceType: 'Digital Marketing Professionals, SEO Experts, Technology Enthusiasts',
          geographicArea: {
            '@type': 'Country',
            name: 'India',
          },
        },
        publishingPrinciples: `${baseUrl}/about#editorial-standards`,
        ownershipFundingInfo: `${baseUrl}/about#mission`,
        actionableFeedbackPolicy: `${baseUrl}/contact`,
        correctionsPolicy: `${baseUrl}/about#editorial-standards`,
        ethicsPolicy: `${baseUrl}/about#editorial-standards`,
        verificationFactCheckingPolicy: `${baseUrl}/about#editorial-standards`,
        sameAs: [
          'https://x.com/prasantbagriya',
          'https://www.instagram.com/prasantbagriya/',
          'https://www.facebook.com/chatwizs/',
          'https://www.linkedin.com/company/chatwizs/',
          'https://www.youtube.com/@ChatWizsOffical'
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'ChatWizs',
        description: 'Expert-verified articles on SEO, technology, and digital marketing.',
        publisher: { '@id': `${baseUrl}/#organization` },
        // ✅ GEO SEO 2026: BCP-47 language code signals India English audience
        inLanguage: 'en-IN',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      // ✅ GEO SEO 2026: Speakable WebPage for AI Overview & Google Assistant eligibility
      {
        '@type': 'WebPage',
        '@id': `${baseUrl}/#homepage`,
        url: baseUrl,
        name: 'ChatWizs | Expert Insights & SEO Optimized Content',
        isPartOf: { '@id': `${baseUrl}/#website` },
        about: { '@id': `${baseUrl}/#organization` },
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '.hero-p', '.post-excerpt'],
        },
        // ✅ GEO SEO: inLanguage with BCP-47 India English
        inLanguage: 'en-IN',
      },
    ],
  };

  return (
    <html lang="en-IN" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* ✅ GEO SEO 2026: Classic geographic metadata tags for regional target engines */}
        <meta name="geo.region" content="IN-MH" />
        <meta name="geo.placename" content="Mumbai, India" />
        <meta name="geo.position" content="19.0596;72.8683" />
        <meta name="ICBM" content="19.0596, 72.8683" />

        {/* ✅ Preconnect: Reduces connection latency for external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <style dangerouslySetInnerHTML={{
          __html: `
          :root {
            --primary: #1d4ed8;
            --background: #ffffff;
            --foreground: #0f172a;
            --muted-foreground: #334155;
            --header-height: 60px;
            --radius: 0.75rem;
            --border: #e5e7eb;
          }
          .hero-h1 { font-size: 3.5rem; margin-bottom: 1rem; letter-spacing: -0.05em; line-height: 1.1; font-weight: 800; }
          .hero-p { font-size: 1.125rem; color: var(--muted-foreground); max-width: 600px; margin: 0 auto; }
          @media (max-width: 768px) { .hero-h1 { font-size: 2.25rem; } .hero-p { font-size: 1rem; } }
          
          body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; background: var(--background); color: var(--foreground); -webkit-font-smoothing: antialiased; text-rendering: optimizeSpeed; }
          .container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 1.25rem; }

          .hero-skeleton { text-align: center; padding: 3rem 0; min-height: 200px; contain: layout paint; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
          main { min-height: 80vh; }
          .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
          .sr-only:focus { position: static; width: auto; height: auto; overflow: visible; clip: auto; white-space: normal; }

        ` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <link rel="alternate" type="application/rss+xml" title="ChatWizs RSS Feed" href="/feed.xml" />
        {/* ✅ Google Analytics (gtag.js) - Unified & Non-blocking */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var loaded = false;
              function loadGTM() {
                if (loaded) return;
                loaded = true;
                window.dataLayer = window.dataLayer || [];
                window.gtag = window.gtag || function(){ dataLayer.push(arguments); };
                var s = document.createElement('script');
                s.async = true;
                s.src = 'https://www.googletagmanager.com/gtag/js?id=G-P9267BP0W6';
                s.onload = function() {
                  gtag('js', new Date());
                  gtag('config', 'G-P9267BP0W6', { send_page_view: true });
                };
                document.head.appendChild(s);
              }
              var schedule = function(cb) { return setTimeout(cb, 4000); };
              window.addEventListener('load', function() { schedule(loadGTM); });
              window.addEventListener('scroll', loadGTM, { once: true, passive: true });
              window.addEventListener('pointerdown', loadGTM, { once: true, passive: true });
            })();
          `
        }} />

        {/* ✅ Google AdSense (Auto Ads) - lazyOnload = loads after page idle
             FIX: Changed from afterInteractive to lazyOnload to prevent CLS
             CLS impact: AdSense injecting ads during scroll causes layout shift
        */}
        {process.env.NEXT_PUBLIC_ADSENSE_PID && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PID}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}

        <Script id="inp-guard" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
          try {
            let idleTimeout;
            const handleInteraction = () => {
              document.body.classList.add('user-interacting');
              clearTimeout(idleTimeout);
              idleTimeout = setTimeout(() => document.body.classList.remove('user-interacting'), 150);
            };
            window.addEventListener('scroll', handleInteraction, { passive: true });
            window.addEventListener('touchstart', handleInteraction, { passive: true });
            window.addEventListener('click', handleInteraction, { passive: true });
          } catch (e) {}
        ` }} />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <SliderInitializer />
        <a href="#main-content" className="sr-only" style={{ top: '1rem', left: '1rem', zIndex: 9999, background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius)', textDecoration: 'none' }}>
          Skip to content
        </a>
        <GlobalNavbar />
        <main id="main-content" className="container pt-32 relative z-0">
          {children}
        </main>
        <GlobalFooter />
      </body>
    </html>
  );
}
