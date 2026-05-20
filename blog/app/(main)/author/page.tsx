import { getPosts } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

const BASE_URL = 'https://chatwizs.com';

export const metadata: Metadata = {
  title: 'Our Editorial Experts & Writers | ChatWizs',
  description: 'Meet the team of SEO experts, technology analysts, and digital marketers behind ChatWizs. Human-edited, fact-checked, and E-E-A-T verified content.',
  alternates: { canonical: `${BASE_URL}/author` },
  openGraph: {
    title: 'ChatWizs Editorial Team & Experts',
    description: 'Human expertise and full editorial accountability behind every article we publish.',
    url: `${BASE_URL}/author`,
    type: 'website',
  },
};

export const revalidate = 3600; // Cache for 1 hour

export default async function AuthorsIndexPage() {
  const posts = await getPosts();

  // ✅ Extract unique authors with their latest details from published posts
  const uniqueAuthorsMap = new Map<string, {
    name: string;
    slug: string;
    bio: string;
    image: string;
    jobTitle: string;
    experienceYears?: number;
    knowsAbout?: { name: string; sameAs: string }[];
    articleCount: number;
  }>();

  posts.forEach(post => {
    if (!post.published || !post.author) return;
    
    const authorKey = post.author.trim();
    const slug = authorKey.toLowerCase().replace(/ /g, '-');
    const existing = uniqueAuthorsMap.get(authorKey);
    
    if (existing) {
      existing.articleCount += 1;
    } else {
      uniqueAuthorsMap.set(authorKey, {
        name: authorKey,
        slug,
        bio: post.authorBio || `${authorKey} is a key contributor to the ChatWizs team, writing high-quality guides and insights.`,
        image: post.authorImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
        jobTitle: post.authorJobTitle || 'Editorial Contributor',
        experienceYears: post.authorExperienceYears,
        knowsAbout: post.authorKnowsAbout,
        articleCount: 1,
      });
    }
  });

  const authorsList = Array.from(uniqueAuthorsMap.values());

  // ✅ Author Directory/Hub Schema for Google trust signals
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/author#webpage`,
        url: `${BASE_URL}/author`,
        name: 'ChatWizs Editorial Experts',
        description: 'Meet the expert editorial contributors and writers at ChatWizs.',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${BASE_URL}/author#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${BASE_URL}/author#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Authors', item: `${BASE_URL}/author` },
        ],
      },
    ],
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 0' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
          <li><Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link></li>
          <li>/</li>
          <li aria-current="page" style={{ color: 'var(--foreground)' }}>Authors</li>
        </ol>
      </nav>

      <section style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent)', border: '1px solid var(--border)', padding: '0.375rem 1rem', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>
          E-E-A-T Certified Team
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.05em', lineHeight: 1.1 }}>
          Meet Our <span style={{ color: 'var(--primary)', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Expert Contributors</span>
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto', lineHeight: 1.7 }}>
          At ChatWizs, we believe in 100% transparent and expert-backed information. Meet the experienced specialists, developers, and strategists behind our articles.
        </p>
      </section>

      {authorsList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--muted)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '1.25rem', color: 'var(--muted-foreground)' }}>No authors listed yet. Check back soon!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
          {authorsList.map(author => (
            <article
              key={author.name}
              className="glass-panel card-hover"
              style={{
                display: 'flex',
                gap: '1.5rem',
                padding: '2rem',
                alignItems: 'flex-start',
                background: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
              }}
              itemScope
              itemType="https://schema.org/Person"
            >
              <Link
                href={`/author/${author.slug}`}
                style={{
                  position: 'relative',
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '3px solid var(--primary)',
                  display: 'block',
                }}
              >
                <Image
                  src={author.image}
                  alt={`${author.name} profile`}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="90px"
                  itemProp="image"
                />
              </Link>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.25rem' }} itemProp="name">
                  <Link href={`/author/${author.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {author.name}
                  </Link>
                </h2>
                <div
                  style={{
                    color: 'var(--primary)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    marginBottom: '0.75rem',
                  }}
                  itemProp="jobTitle"
                >
                  {author.jobTitle}
                </div>
                <p
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {author.bio}
                </p>

                {author.knowsAbout && author.knowsAbout.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {author.knowsAbout.slice(0, 3).map(k => (
                      <span key={k.name} style={{ background: 'var(--accent)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
                        {k.name}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <span style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                    ✍️ <strong>{author.articleCount}</strong> Article{author.articleCount !== 1 ? 's' : ''} Published
                  </span>
                  <Link
                    href={`/author/${author.slug}`}
                    style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none' }}
                  >
                    View Bio & Articles →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
