import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | ChatWizs',
  description: 'The page you are looking for does not exist. Return to ChatWizs for expert articles on SEO and technology.',
  // ✅ CRITICAL: 404 pages MUST be noindex
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
      {/* ✅ No JSON-LD on 404 — it would confuse Google's entity graph */}
      <div
        style={{
          fontSize: '6rem',
          fontWeight: 900,
          background: 'linear-gradient(120deg, var(--primary), #818cf8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.05em',
          lineHeight: 1,
          marginBottom: '1.5rem',
        }}
        aria-hidden="true"
      >
        404
      </div>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page Not Found</h1>
      <p style={{ color: 'var(--muted-foreground)', maxWidth: '500px', margin: '0 auto 3rem', fontSize: '1.0625rem', lineHeight: 1.7 }}>
        The content you are looking for doesn&apos;t exist or has been moved.
        Try heading back to our homepage for more expert insights.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/" className="btn btn-primary">
          Back to Home
        </Link>
        <Link href="/blog" className="btn" style={{ border: '1px solid var(--border)', background: 'transparent' }}>
          Browse Articles
        </Link>
      </div>
    </div>
  );
}
