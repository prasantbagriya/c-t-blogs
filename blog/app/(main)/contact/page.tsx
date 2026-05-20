import { Metadata } from 'next';
import Link from 'next/link';

const BASE_URL = 'https://chatwizs.com';
const LAST_UPDATED = '2026-05-14';

export const metadata: Metadata = {
  title: 'Contact Us | ChatWizs',
  description: 'Get in touch with the ChatWizs editorial and support team. We welcome story pitches, corrections, and feedback.',
  alternates: { canonical: `${BASE_URL}/contact` },
  robots: { index: true, follow: false },
};

export default function ContactPage() {
  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${BASE_URL}/contact`,
    url: `${BASE_URL}/contact`,
    name: 'Contact ChatWizs',
    description: 'Contact the ChatWizs editorial and support team.',
    dateModified: LAST_UPDATED,
    isPartOf: { '@id': `${BASE_URL}/#website` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Contact', item: `${BASE_URL}/contact` },
      ],
    },
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 0' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }} />

      <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '0.5rem' }}>
          <li><Link href="/" style={{ color: 'var(--primary)' }}>Home</Link></li>
          <li>/</li>
          <li aria-current="page">Contact</li>
        </ol>
      </nav>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Contact Us</h1>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <p style={{ marginBottom: '2rem', fontSize: '1.125rem' }}>Have a question or feedback? We value our community's input and respond to every message.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Editorial Inquiries</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.925rem' }}>
              For story pitches or content corrections:<br />
              <a href="mailto:editorial@chatwizs.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>editorial@chatwizs.com</a>
            </p>
          </div>
          <div>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Technical Support</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.925rem' }}>
              For site issues or feedback:<br />
              <a href="mailto:support@chatwizs.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>support@chatwizs.com</a>
            </p>
          </div>
        </div>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
          <h2 style={{ marginBottom: '1rem' }}>ChatWizs HQ</h2>
          <p style={{ color: 'var(--muted-foreground)' }}>
            ChatWizs Headquarters<br />
            Bandra Kurla Complex, Bandra East<br />
            Mumbai, Maharashtra 400051<br />
            India
          </p>
        </div>
      </div>
    </div>
  );
}
