import { getPosts } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const BASE_URL = 'https://chatwizs.com';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPosts();
  const authorSlugs = Array.from(
    new Set(
      posts
        .filter(p => p.published && p.author)
        .map(p => p.author.toLowerCase().replace(/ /g, '-'))
    )
  );
  return authorSlugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getPosts();
  const authorName = posts.find(
    p => p.author.toLowerCase().replace(/ /g, '-') === slug
  )?.author;

  if (!authorName) return { title: 'Author Not Found' };

  return {
    title: `${authorName} | Author at ChatWizs`,
    description: `Read all expert articles by ${authorName} on ChatWizs. Verified author with documented expertise in SEO, technology, and digital marketing.`,
    alternates: { canonical: `${BASE_URL}/author/${slug}` },
    openGraph: {
      title: `${authorName} | ChatWizs Author`,
      description: `Expert articles by ${authorName}`,
      url: `${BASE_URL}/author/${slug}`,
      type: 'profile',
    },
  };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const allPosts = await getPosts();

  // Find author data from their posts
  const authorPost = allPosts.find(
    p => p.published && p.author && p.author.toLowerCase().replace(/ /g, '-') === slug
  );

  if (!authorPost) notFound();

  const authorName = authorPost.author;
  const authorPosts = allPosts
    .filter(p => p.published && p.author?.toLowerCase().replace(/ /g, '-') === slug)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // ✅ EEAT: ProfilePage + Person schema — Google recommends ProfilePage wrapper for author pages
  // https://developers.google.com/search/docs/appearance/structured-data/person
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${BASE_URL}/author/${slug}#webpage`,
        url: `${BASE_URL}/author/${slug}`,
        name: `${authorName} — Author Profile`,
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${BASE_URL}/author/${slug}#breadcrumb` },
        mainEntity: { '@id': `${BASE_URL}/author/${slug}#person` },
        dateCreated: authorPosts[authorPosts.length - 1]?.date || '2024-01-01',
        dateModified: authorPosts[0]?.lastModified || authorPosts[0]?.date || new Date().toISOString(),
      },
      {
        '@type': 'Person',
        '@id': `${BASE_URL}/author/${slug}#person`,
        name: authorName,
        url: `${BASE_URL}/author/${slug}`,
        image: {
          '@type': 'ImageObject',
          url: authorPost.authorImage || `${BASE_URL}/logo-96x96.png`,
          width: 200,
          height: 200,
        },
        jobTitle: authorPost.authorJobTitle || 'Content Specialist',
        description: authorPost.authorBio || `${authorName} is a contributor at ChatWizs.`,
        worksFor: {
          '@type': 'Organization',
          '@id': `${BASE_URL}/#organization`,
          name: 'ChatWizs',
        },
        ...(authorPost.authorSocials && Object.values(authorPost.authorSocials).filter(Boolean).length > 0 ? {
          sameAs: [
            authorPost.authorSocials?.twitter,
            authorPost.authorSocials?.linkedin,
            authorPost.authorSocials?.website,
          ].filter(Boolean)
        } : {}),
        ...(authorPost.authorAlumniOf?.length
          ? {
              alumniOf: authorPost.authorAlumniOf.map(a => ({
                '@type': 'EducationalOrganization',
                name: a.name,
                sameAs: a.sameAs,
              })),
            }
          : {}),
        ...(authorPost.authorKnowsAbout?.length
          ? {
              knowsAbout: authorPost.authorKnowsAbout.map(k => ({
                '@type': 'Thing',
                name: k.name,
                sameAs: k.sameAs,
              })),
            }
          : {}),
        ...(authorPost.authorAwards?.length ? { award: authorPost.authorAwards } : {}),
        ...(authorPost.authorExperienceYears ? { hasOccupation: { '@type': 'Occupation', name: authorPost.authorJobTitle || 'Content Specialist', experienceRequirements: `${authorPost.authorExperienceYears}+ years` } } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${BASE_URL}/author/${slug}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Authors', item: `${BASE_URL}/author` },
          { '@type': 'ListItem', position: 3, name: authorName, item: `${BASE_URL}/author/${slug}` },
        ],
      },
    ],
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 0' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
          <li><Link href="/" style={{ color: 'var(--primary)' }}>Home</Link></li>
          <li>/</li>
          <li><Link href="/blog" style={{ color: 'var(--primary)' }}>Blog</Link></li>
          <li>/</li>
          <li aria-current="page">{authorName}</li>
        </ol>
      </nav>

      {/* Author Profile Card */}
      <section className="glass-panel" style={{ padding: '2.5rem', marginBottom: '3rem', display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '3px solid var(--primary)' }}>
          <Image
            src={authorPost.authorImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80'}
            alt={`${authorName} profile photo`}
            fill
            style={{ objectFit: 'cover' }}
            sizes="120px"
            priority
          />
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
            {authorName}
          </h1>
          {authorPost.authorJobTitle && (
            <p style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>
              {authorPost.authorJobTitle}
            </p>
          )}
          {authorPost.authorBio && (
            <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
              {authorPost.authorBio}
            </p>
          )}

          {/* Social Links */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {authorPost.authorSocials?.twitter && (
              <a href={authorPost.authorSocials.twitter} target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                𝕏 Twitter ↗
              </a>
            )}
            {authorPost.authorSocials?.linkedin && (
              <a href={authorPost.authorSocials.linkedin} target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
                LinkedIn ↗
              </a>
            )}
            {authorPost.authorSocials?.website && (
              <a href={authorPost.authorSocials.website} target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
                Portfolio ↗
              </a>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>{authorPosts.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 700, textTransform: 'uppercase' }}>Articles</div>
            </div>
            {authorPost.authorExperienceYears && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)' }}>{authorPost.authorExperienceYears}+</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 700, textTransform: 'uppercase' }}>Yrs Experience</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Expertise Areas */}
      {authorPost.authorKnowsAbout && authorPost.authorKnowsAbout.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '1rem' }}>Areas of Expertise</h2>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {authorPost.authorKnowsAbout.map((k) => (
              k.sameAs ? (
                <a key={k.name} href={k.sameAs} target="_blank" rel="noopener noreferrer" style={{ background: 'var(--accent)', border: '1px solid var(--border)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none' }}>
                  {k.name} ↗
                </a>
              ) : (
                <span key={k.name} style={{ background: 'var(--accent)', border: '1px solid var(--border)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 700 }}>
                  {k.name}
                </span>
              )
            ))}
          </div>
        </section>
      )}

      {/* ✅ Education & Alma Mater — E-E-A-T Authority Signal */}
      {authorPost.authorAlumniOf && authorPost.authorAlumniOf.length > 0 && (
        <section className="glass-panel" style={{ padding: '2rem', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            🎓 Education &amp; Background
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {authorPost.authorAlumniOf.map((a) => (
              <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: 'var(--accent)', borderRadius: '10px' }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>🏛️</span>
                <div>
                  {a.sameAs ? (
                    <a href={a.sameAs} target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: 'var(--primary)', textDecoration: 'none', fontSize: '1rem' }}>
                      {a.name} ↗
                    </a>
                  ) : (
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{a.name}</span>
                  )}
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Educational Institution</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ✅ Professional Awards — E-E-A-T Authoritativeness Signal */}
      {authorPost.authorAwards && authorPost.authorAwards.length > 0 && (
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            🏆 Awards &amp; Recognitions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {authorPost.authorAwards.map((award, i) => (
              <div key={i} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'linear-gradient(135deg, #fef9c3, #fef3c7)', border: '1px solid #fde047' }}>
                <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>🏆</span>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#854d0e', lineHeight: 1.4 }}>{award}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
          Articles by {authorName} ({authorPosts.length})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {authorPosts.map(post => (
            <article key={post.id} className="glass-panel card-hover" style={{ display: 'flex', gap: '1.5rem', overflow: 'hidden', padding: 0, alignItems: 'stretch' }}>
              <Link href={`/blog/${post.slug}`} aria-hidden="true" tabIndex={-1}
                style={{ position: 'relative', width: '180px', flexShrink: 0, display: 'block', minHeight: '140px' }}>
                <Image src={post.coverImage || 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=800&q=80'} alt="" fill style={{ objectFit: 'cover' }} sizes="180px" />
              </Link>
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>
                  {post.category}
                </span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3 }}>
                  <Link href={`/blog/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {post.title}
                  </Link>
                </h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {post.excerpt}
                </p>
                <div style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>
                  {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  {post.readingTime && ` · ${post.readingTime} min read`}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
