import { Metadata } from 'next';

const BASE_URL = 'https://chatwizs.com';
const LAST_UPDATED = '2026-05-14';

export const metadata: Metadata = {
  title: 'Terms of Service | ChatWizs',
  description: 'ChatWizs Terms of Service — rules and guidelines for using our website, content, and services.',
  alternates: { canonical: `${BASE_URL}/terms` },
  robots: { index: true, follow: false },
};

export default function TermsPage() {
  const termsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${BASE_URL}/terms`,
    url: `${BASE_URL}/terms`,
    name: 'Terms of Service — ChatWizs',
    description: 'ChatWizs terms of service and usage guidelines.',
    dateModified: LAST_UPDATED,
    isPartOf: { '@id': `${BASE_URL}/#website` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Terms of Service', item: `${BASE_URL}/terms` },
      ],
    },
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 0' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(termsJsonLd) }} />

      <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '0.5rem' }}>
          <li><a href="/" style={{ color: 'var(--primary)' }}>Home</a></li>
          <li>/</li>
          <li aria-current="page">Terms of Service</li>
        </ol>
      </nav>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Terms of Service</h1>
      <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '3rem' }}>
        Last updated: <time dateTime={LAST_UPDATED}>{new Date(LAST_UPDATED).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
      </p>

      <div className="glass-panel" style={{ padding: '2rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>1. Acceptance of Terms</h2>
          <p style={{ color: 'var(--muted-foreground)' }}>By accessing ChatWizs, you agree to be bound by these terms of service and all applicable laws and regulations. If you do not agree with any part of these terms, you may not use our services.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>2. Content Accuracy</h2>
          <p style={{ color: 'var(--muted-foreground)' }}>The materials on ChatWizs are provided for general information purposes only. While we strive for accuracy and employ expert fact-checkers, we do not warrant the absolute accuracy or completeness of all materials.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>3. Intellectual Property</h2>
          <p style={{ color: 'var(--muted-foreground)' }}>All content published on ChatWizs — including articles, images, and web stories — is the intellectual property of ChatWizs or its content contributors. Reproduction without written permission is prohibited.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>4. AI Content Policy</h2>
          <p style={{ color: 'var(--muted-foreground)' }}>All AI-assisted content on ChatWizs is reviewed and approved by human experts before publication, in compliance with Google&apos;s 2026 Helpful Content guidelines.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>5. Limitation of Liability</h2>
          <p style={{ color: 'var(--muted-foreground)' }}>In no event shall ChatWizs be liable for any damages arising out of the use or inability to use the materials on our website. Use of this site is at your own risk.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>6. Contact</h2>
          <p style={{ color: 'var(--muted-foreground)' }}>Questions about these terms? Contact us at: <a href="mailto:legal@chatwizs.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>legal@chatwizs.com</a></p>
        </section>
      </div>
    </div>
  );
}
