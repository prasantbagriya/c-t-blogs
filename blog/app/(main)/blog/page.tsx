import { getPosts } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

const BASE_URL = 'https://chatwizs.com';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // ISR: re-generate blog list every 60 seconds

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || '1', 10));
  const pageSuffix = currentPage > 1 ? ` — Page ${currentPage}` : '';

  return {
    title: `Blog | ChatWizs Expert Insights on SEO & Technology${pageSuffix}`,
    description: `Explore expert-verified articles on SEO, technology, and digital marketing. All content is fact-checked, research-backed, and built for Google 2026 standards.${pageSuffix}`,
    alternates: {
      canonical: currentPage > 1 ? `${BASE_URL}/blog?page=${currentPage}` : `${BASE_URL}/blog`,
      types: { 'application/rss+xml': `${BASE_URL}/feed.xml` },
    },
    openGraph: {
      title: `ChatWizs Blog — Expert SEO & Tech Insights${pageSuffix}`,
      description: 'Expert-verified articles on SEO, technology, and digital marketing.',
      url: `${BASE_URL}/blog`,
      siteName: 'ChatWizs',
      type: 'website',
      locale: 'en_US',
    },
  };
}

export default async function BlogIndexPage({ searchParams }: Props) {
  const { page } = await searchParams;
  const allPosts = await getPosts();
  
  // Sort by date DESC, then by array position DESC
  const publishedPosts = [...allPosts]
    .filter(p => p && p.published)
    .sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      if (dateB !== dateA) return dateB - dateA;
      return allPosts.indexOf(b) - allPosts.indexOf(a);
    });

  const categories = ['All', ...Array.from(new Set(publishedPosts.map(p => p.category)))];

  // ✅ Advanced Pagination Configuration
  const currentPage = Math.max(1, parseInt(page || '1', 10));
  const postsPerPage = 6;
  const totalPosts = publishedPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const paginatedPosts = publishedPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  // ✅ Blog + ItemList JSON-LD schema for rich results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        '@id': `${BASE_URL}/blog#blog`,
        url: `${BASE_URL}/blog`,
        name: 'ChatWizs Blog',
        description: 'Expert-verified articles on SEO, technology, and digital marketing.',
        inLanguage: 'en-IN',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        publisher: { '@id': `${BASE_URL}/#organization` },
        blogPost: paginatedPosts.map(post => ({
          '@type': 'BlogPosting',
          '@id': `${BASE_URL}/blog/${post.slug}#article`,
          headline: post.title,
          url: `${BASE_URL}/blog/${post.slug}`,
          datePublished: post.date,
          dateModified: post.lastModified || post.date,
          author: {
            '@type': 'Person',
            name: post.author,
            url: `${BASE_URL}/author/${(post.author || '').toLowerCase().replace(/ /g, '-')}`,
          },
          image: post.coverImage,
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${BASE_URL}/blog#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
        ],
      },
    ],
  };

  return (
    <div className="animate-fade-in">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '0.5rem' }}>
          <li><Link href="/" style={{ color: 'var(--primary)' }}>Home</Link></li>
          <li>/</li>
          <li aria-current="page">Blog</li>
        </ol>
      </nav>

      <section style={{ marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.05em', lineHeight: 1.1 }}>
          Explore <span style={{ color: 'var(--primary)', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sovereign Intelligence</span>
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.25rem', maxWidth: '700px', lineHeight: 1.6 }}>
          Expert-verified insights across {categories.length - 1} high-authority categories. Optimized for 2026 search landscapes.
        </p>
      </section>

      <nav aria-label="Blog Categories" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
        {categories.map(cat => (
          <Link
            key={cat}
            href={cat === 'All' ? '/blog' : `/category/${cat.toLowerCase().replace(/ /g, '-')}`}
            className="card-hover"
            style={{
              padding: '0.6rem 1.5rem',
              borderRadius: '9999px',
              border: '1px solid var(--border)',
              fontSize: '0.8125rem',
              fontWeight: 800,
              color: cat === 'All' ? 'white' : 'var(--foreground)',
              background: cat === 'All' ? 'var(--primary)' : 'white',
              textDecoration: 'none',
              boxShadow: cat === 'All' ? '0 10px 15px -3px rgba(37, 99, 235, 0.25)' : 'none',
              letterSpacing: '0.05em'
            }}
          >
            {cat.toUpperCase()}
          </Link>
        ))}
      </nav>

      {paginatedPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem', background: 'var(--accent)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>No articles available in this node.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '3rem' }}>
            {paginatedPosts.map((post) => (
              <article key={post.id} className="glass-panel card-hover" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fff' }}>
                <Link href={`/blog/${post.slug}`} style={{ position: 'relative', width: '100%', height: '240px', display: 'block' }}>
                  <Image src={post.coverImage || 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=800&q=80'} alt={post.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 33vw" />
                </Link>
                <div style={{ padding: '2.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '1.25rem', fontSize: '0.75rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                     <span>{new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                     <span style={{ opacity: 0.3 }}>|</span>
                     <span>{post.readingTime || 5} MIN READ</span>
                  </div>
                  <h2 style={{ fontSize: '1.75rem', marginBottom: '1.25rem', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.03em' }}>
                    <Link href={`/blog/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{post.title}</Link>
                  </h2>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem', flex: 1, lineHeight: 1.6, marginBottom: '2rem' }}>{post.excerpt}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', position: 'relative' }}>
                        <Image src={post.authorImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&q=80'} alt={post.author} fill style={{ objectFit: 'cover' }} />
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{post.author}</span>
                    </div>
                    <Link href={`/blog/${post.slug}`} style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none', fontSize: '0.875rem' }}>Read Article →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* ✅ High-Performance Premium Pagination controls */}
          {totalPages > 1 && (
            <nav aria-label="Pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '5rem' }}>
              {currentPage > 1 ? (
                <Link
                  href={`/blog?page=${currentPage - 1}`}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    background: 'white',
                    color: 'var(--foreground)',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                  }}
                  className="card-hover"
                >
                  ← Previous
                </Link>
              ) : (
                <span
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    background: '#f1f5f9',
                    color: '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'not-allowed',
                  }}
                >
                  ← Previous
                </span>
              )}

              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--muted-foreground)' }}>
                Page {currentPage} of {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Link
                  href={`/blog?page=${currentPage + 1}`}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    background: 'white',
                    color: 'var(--foreground)',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                  }}
                  className="card-hover"
                >
                  Next →
                </Link>
              ) : (
                <span
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    background: '#f1f5f9',
                    color: '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'not-allowed',
                  }}
                >
                  Next →
                </span>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
