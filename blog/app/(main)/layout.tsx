import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import Script from "next/script";
import Link from 'next/link';
import Copyright from './Copyright';
import MobileNav from '@/components/MobileNav';
import SliderInitializer from '@/components/SliderInitializer';

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
  fallback: ['system-ui', '-apple-system', 'sans-serif'],
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
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
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
          'https://twitter.com/chatwizs',
          'https://linkedin.com/company/chatwizs',
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
          body > header { position: sticky; top: 0; z-index: 100; height: var(--header-height); background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); }
          .hero-skeleton { text-align: center; padding: 3rem 0; min-height: 200px; contain: layout paint; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
          main { min-height: 80vh; }
          .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
          .sr-only:focus { position: static; width: auto; height: auto; overflow: visible; clip: auto; white-space: normal; }
          .desktop-nav { display: flex; gap: 1.5rem; list-style: none; align-items: center; margin: 0; padding: 0; }
          .mobile-nav-btn { display: none; }
          @media (max-width: 768px) { .desktop-nav { display: none; } .mobile-nav-btn { display: flex; } }
        ` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <link rel="alternate" type="application/rss+xml" title="ChatWizs RSS Feed" href="/feed.xml" />
        {/* ✅ Google Analytics (gtag.js) */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-1DRLZ66BX0" 
          strategy="afterInteractive" 
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1DRLZ66BX0');
          `}
        </Script>

        {/* ✅ Google AdSense (Auto Ads) - Enabled via env variable */}
        {process.env.NEXT_PUBLIC_ADSENSE_PID && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
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
        <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 100, margin: 0 }}>
          <nav className="container" aria-label="Main Navigation" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 'var(--header-height)' }}>
            <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--foreground)', textDecoration: 'none' }} aria-label="ChatWizs Home">
              Chat<span style={{ color: 'var(--primary)' }}>Wizs</span>
            </Link>
            {/* ✅ Admin link REMOVED from public header — security + no user value */}
            {/* Desktop Nav */}
            <ul className="desktop-nav" role="list">
              <li><Link href="/" style={{ fontWeight: 600, color: 'var(--foreground)', textDecoration: 'none' }}>Home</Link></li>
              <li><Link href="/blog" style={{ fontWeight: 600, color: 'var(--foreground)', textDecoration: 'none' }}>Blog</Link></li>
              <li><Link href="/stories" style={{ fontWeight: 600, color: 'var(--foreground)', textDecoration: 'none' }}>Stories</Link></li>
              <li><Link href="/about" style={{ fontWeight: 600, color: 'var(--foreground)', textDecoration: 'none' }}>About</Link></li>
              <li><Link href="/search" style={{ fontWeight: 600, color: 'var(--foreground)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }} aria-label="Search articles">🔍 Search</Link></li>
              <li><Link href="/contact" style={{ fontSize: '0.875rem', color: 'white', background: 'var(--primary)', padding: '0.5rem 1.25rem', borderRadius: '6px', fontWeight: 700, textDecoration: 'none' }}>Contact</Link></li>
            </ul>
            {/* Mobile Nav — hamburger */}
            <div className="mobile-nav-btn">
              <MobileNav />
            </div>
          </nav>
        </header>
        <main id="main-content" className="container">
          {children}
        </main>
        <footer style={{ borderTop: '1px solid var(--border)', marginTop: '3rem', background: 'var(--muted)' }}>
          <div className="container" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
            <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--foreground)', textDecoration: 'none', display: 'inline-block', marginBottom: '1.25rem' }}>
              Chat<span style={{ color: 'var(--primary)' }}>Wizs</span>
            </Link>
            <nav aria-label="Footer Navigation" style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap', marginBottom: '1.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
              <Link href="/about" style={{ color: 'var(--muted-foreground)', textDecoration: 'none' }}>About Us</Link>
              <Link href="/blog" style={{ color: 'var(--muted-foreground)', textDecoration: 'none' }}>Blog</Link>
              <Link href="/stories" style={{ color: 'var(--muted-foreground)', textDecoration: 'none' }}>Web Stories</Link>
              <Link href="/editorial-policy" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Editorial Guidelines</Link>
              <Link href="/fact-checking-policy" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Fact-Checking</Link>
              <Link href="/privacy" style={{ color: 'var(--muted-foreground)', textDecoration: 'none' }}>Privacy</Link>
              <Link href="/contact" style={{ color: 'var(--muted-foreground)', textDecoration: 'none' }}>Contact</Link>
              <Link href="/terms" style={{ color: 'var(--muted-foreground)', textDecoration: 'none' }}>Terms</Link>
            </nav>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8125rem' }}>
              <Copyright /> Expert-verified content built for Google&apos;s EEAT standards.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
