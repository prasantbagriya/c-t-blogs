import { Metadata } from 'next';

const BASE_URL = 'https://chatwizs.com';
const LAST_UPDATED = '2026-05-14';

export const metadata: Metadata = {
  title: 'Privacy Policy | ChatWizs',
  description: 'ChatWizs Privacy Policy — How we handle user data, cookies, and comply with GDPR, CCPA, and Google Privacy standards.',
  alternates: { canonical: `${BASE_URL}/privacy` },
  robots: { index: true, follow: false }, // Privacy pages: indexed but links not followed
};

export default function PrivacyPage() {
  const privacyJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${BASE_URL}/privacy`,
    url: `${BASE_URL}/privacy`,
    name: 'Privacy Policy — ChatWizs',
    description: 'ChatWizs privacy policy and data handling practices.',
    dateModified: LAST_UPDATED,
    isPartOf: { '@id': `${BASE_URL}/#website` },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: `${BASE_URL}/privacy` },
      ],
    },
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 0' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyJsonLd) }} />

      <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '0.5rem' }}>
          <li><a href="/" style={{ color: 'var(--primary)' }}>Home</a></li>
          <li>/</li>
          <li aria-current="page">Privacy Policy</li>
        </ol>
      </nav>

      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '3rem' }}>
        Last updated: <time dateTime={LAST_UPDATED}>{new Date(LAST_UPDATED).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
      </p>

      <div className="glass-panel" style={{ padding: '2rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>1. Information We Collect</h2>
          <p style={{ color: 'var(--muted-foreground)' }}>We do not collect personal information unless explicitly provided by you (e.g., contact form submissions). We use privacy-respecting analytics to monitor site performance and reader experience improvements.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>2. Cookies</h2>
          <p style={{ color: 'var(--muted-foreground)' }}>Our site uses minimal, strictly-necessary cookies. We do not use third-party advertising cookies or tracking pixels. By using our site, you consent to our use of essential cookies.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>3. Third-Party Services</h2>
          <p style={{ color: 'var(--muted-foreground)' }}>We may use Google Analytics (with IP anonymization enabled) to understand site traffic patterns. No personally identifiable information is shared with third parties for advertising purposes.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>4. Your Rights (GDPR / CCPA)</h2>
          <p style={{ color: 'var(--muted-foreground)' }}>You have the right to access, correct, or delete any personal data we hold about you. EU residents have additional rights under GDPR. California residents have rights under CCPA. Contact us at <a href="mailto:privacy@chatwizs.com" style={{ color: 'var(--primary)' }}>privacy@chatwizs.com</a> to exercise your rights.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>5. AI Content Disclosure</h2>
          <p style={{ color: 'var(--muted-foreground)' }}>In compliance with Google&apos;s 2026 content policies, all AI-assisted content on ChatWizs is clearly labeled. All published articles are reviewed, edited, and approved by human subject-matter experts before publication.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>6. Policy Updates</h2>
          <p style={{ color: 'var(--muted-foreground)' }}>We will notify users of significant changes to this policy by updating the &quot;Last updated&quot; date at the top of this page. Continued use of ChatWizs constitutes acceptance of the updated policy.</p>
        </section>
        <section>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>7. Contact</h2>
          <p style={{ color: 'var(--muted-foreground)' }}>For privacy concerns, contact us at: <a href="mailto:privacy@chatwizs.com" style={{ color: 'var(--primary)', fontWeight: 600 }}>privacy@chatwizs.com</a></p>
        </section>
      </div>
    </div>
  );
}
