import { Metadata } from 'next';
import Link from 'next/link';

const BASE_URL = 'https://chatwizs.com';

export const metadata: Metadata = {
  title: 'About ChatWizs | Our Editorial Mission & Standards',
  description: 'ChatWizs publishes expert-verified articles on SEO, technology, and digital marketing. Learn about our editorial standards, EEAT compliance, and the team behind our content.',
  alternates: { canonical: `${BASE_URL}/about` },
  openGraph: {
    title: 'About ChatWizs | Our Editorial Mission & Standards',
    description: 'Expert-verified content built on transparency, experience, and trust.',
    url: `${BASE_URL}/about`,
    type: 'website',
  },
};

// ✅ EEAT: AboutPage + Organization JSON-LD for Google trust signals
const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      '@id': `${BASE_URL}/about#webpage`,
      url: `${BASE_URL}/about`,
      name: 'About ChatWizs',
      description: 'ChatWizs editorial mission, standards, and team.',
      isPartOf: { '@id': `${BASE_URL}/#website` },
      about: { '@id': `${BASE_URL}/#organization` },
      breadcrumb: { '@id': `${BASE_URL}/about#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${BASE_URL}/about#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
        { '@type': 'ListItem', position: 2, name: 'About', item: `${BASE_URL}/about` },
      ],
    },
  ],
};

const eatItems = [
  {
    icon: '✅',
    title: 'Experience',
    desc: 'Every author has documented, first-hand experience in their field — no generalist writers.',
  },
  {
    icon: '🎓',
    title: 'Expertise',
    desc: 'Articles are written by subject-matter experts with verifiable credentials and industry track records.',
  },
  {
    icon: '🏆',
    title: 'Authoritativeness',
    desc: 'We cite primary sources, government data, and industry-leading references exclusively.',
  },
  {
    icon: '🛡️',
    title: 'Trustworthiness',
    desc: 'All content is human-edited, fact-checked, and updated on a regular review cycle.',
  },
];

const editorialProcess = [
  { step: '01', title: 'Research & Outline', desc: 'Topic validated against search intent and data-backed demand signals.' },
  { step: '02', title: 'Expert Drafting', desc: 'Written by a qualified author with direct experience in the subject area.' },
  { step: '03', title: 'Editorial Review', desc: 'Senior editor reviews for accuracy, EEAT compliance, and factual integrity.' },
  { step: '04', title: 'Publish & Monitor', desc: 'Live monitoring for accuracy updates; reviewed every 90 days minimum.' },
];

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 0' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
          <li><Link href="/" style={{ color: 'var(--primary)' }}>Home</Link></li>
          <li>/</li>
          <li aria-current="page">About</li>
        </ol>
      </nav>

      <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>About ChatWizs</h1>
      <p style={{ color: 'var(--muted-foreground)', fontSize: '1.125rem', marginBottom: '3rem', lineHeight: 1.7 }}>
        Expert-verified content for the modern web — built on transparency, experience, and trust.
      </p>

      {/* Mission */}
      <section id="mission" className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Our Mission</h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.0625rem', lineHeight: 1.8 }}>
          ChatWizs is dedicated to providing high-quality, research-backed insights into SEO, technology,
          and digital marketing. In an era of AI-generated content, we stand for{' '}
          <strong>human expertise</strong> and full editorial accountability. Every article we publish
          must pass our 4-stage editorial process before going live.
        </p>
      </section>

      {/* EEAT */}
      <section id="editorial-standards" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ marginBottom: '1.25rem', fontSize: '1.5rem' }}>Editorial Standards (Google EEAT Compliant)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {eatItems.map(item => (
            <div key={item.title} className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{item.icon}</span>
              <div>
                <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '0.25rem' }}>{item.title}</strong>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9375rem', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial Process */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ marginBottom: '1.25rem', fontSize: '1.5rem' }}>Our 4-Stage Editorial Process</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
          {editorialProcess.map(p => (
            <div key={p.step} className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--primary)', opacity: 0.2, lineHeight: 1, marginBottom: '0.75rem' }}>{p.step}</div>
              <strong style={{ display: 'block', marginBottom: '0.5rem' }}>{p.title}</strong>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', margin: 0, lineHeight: 1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Corrections Policy */}
      <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem', borderLeft: '4px solid var(--primary)' }}>
        <h2 style={{ marginBottom: '0.75rem', fontSize: '1.25rem' }}>Corrections & Feedback Policy</h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9375rem', lineHeight: 1.7, margin: 0 }}>
          We promptly correct factual errors upon verification. If you spot an inaccuracy,{' '}
          <Link href="/contact" style={{ color: 'var(--primary)', fontWeight: 700 }}>contact our editorial team</Link>.
          Corrections are noted inline on the affected article with a timestamp. See our full{' '}
          <Link href="/editorial-policy" style={{ color: 'var(--primary)', fontWeight: 700 }}>Editorial Guidelines</Link> and{' '}
          <Link href="/fact-checking-policy" style={{ color: 'var(--primary)', fontWeight: 700 }}>Fact-Checking Policy</Link>.
        </p>
      </section>

      {/* Contact CTA */}
      <section style={{ textAlign: 'center', padding: '2.5rem', background: 'var(--accent)', borderRadius: 'var(--radius)' }}>
        <h2 style={{ marginBottom: '0.75rem', fontSize: '1.5rem' }}>Get in Touch</h2>
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>
          For editorial inquiries, corrections, or collaboration opportunities.
        </p>
        <Link
          href="/contact"
          style={{ display: 'inline-block', background: 'var(--primary)', color: 'white', padding: '0.875rem 2rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}
        >
          Contact Us →
        </Link>
      </section>
    </div>
  );
}
