import { getPosts } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

const BASE_URL = 'https://chatwizs.com';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: "${q}" | ChatWizs` : 'Search Articles | ChatWizs',
    description: q
      ? `Search results for "${q}" on ChatWizs. Find expert-verified articles on SEO, technology, and digital marketing.`
      : 'Search all expert-verified articles on ChatWizs.',
    robots: {
      index: false, // ✅ Search result pages should NOT be indexed
      follow: true,
    },
    alternates: {
      canonical: q ? `${BASE_URL}/search?q=${encodeURIComponent(q)}` : `${BASE_URL}/search`,
    },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q || '').trim().toLowerCase();

  const allPosts = await getPosts();
  const publishedPosts = allPosts.filter(p => p.published);

  // ✅ Full-text search across title, excerpt, tags, category, author
  const results = query
    ? publishedPosts.filter(post => {
        const searchable = [
          post.title,
          post.excerpt,
          post.metaDescription,
          post.category,
          post.author,
          ...(post.tags || []),
          ...(post.keyTakeaways || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return searchable.includes(query);
      })
    : [];

  // ✅ SearchResultsPage schema
  const jsonLd = query
    ? {
        '@context': 'https://schema.org',
        '@type': 'SearchResultsPage',
        name: `Search results for: ${q}`,
        url: `${BASE_URL}/search?q=${encodeURIComponent(q || '')}`,
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Search', item: `${BASE_URL}/search` },
          ],
        },
      }
    : null;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 0' }}>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
          <li><Link href="/" style={{ color: 'var(--primary)' }}>Home</Link></li>
          <li>/</li>
          <li aria-current="page">Search</li>
        </ol>
      </nav>

      <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
        {query ? `Search Results for "${q}"` : 'Search ChatWizs'}
      </h1>
      {query && (
        <p style={{ color: 'var(--muted-foreground)', marginBottom: '2rem' }}>
          Found {results.length} article{results.length !== 1 ? 's' : ''} matching your query.
        </p>
      )}

      {/* Search Box */}
      <form
        method="GET"
        action="/search"
        role="search"
        style={{ marginBottom: '3rem' }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '600px' }}>
          <input
            type="search"
            name="q"
            defaultValue={q || ''}
            placeholder="Search articles, topics, categories..."
            aria-label="Search ChatWizs articles"
            autoComplete="off"
            style={{
              flex: 1,
              padding: '0.875rem 1.25rem',
              borderRadius: 'var(--radius)',
              border: '2px solid var(--border)',
              fontSize: '1rem',
              fontFamily: 'inherit',
              outline: 'none',
              color: 'var(--foreground)',
              background: 'white',
              transition: 'border-color 0.2s',
            }}
          />
          <button
            type="submit"
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '0.875rem 1.75rem',
              borderRadius: 'var(--radius)',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              minHeight: '44px',
            }}
          >
            Search
          </button>
        </div>
      </form>

      {/* Results */}
      {!query && (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--accent)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '1.25rem', color: 'var(--muted-foreground)' }}>
            Type a keyword above to search all {publishedPosts.length} articles.
          </p>
        </div>
      )}

      {query && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--accent)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '1.25rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
            No results found for &quot;<strong>{q}</strong>&quot;.
          </p>
          <Link href="/blog" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Browse All Articles →
          </Link>
        </div>
      )}

      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {results.map(post => (
            <article
              key={post.id}
              className="glass-panel card-hover"
              style={{ display: 'flex', gap: '1.5rem', overflow: 'hidden', padding: 0, alignItems: 'stretch' }}
            >
              <Link
                href={`/blog/${post.slug}`}
                aria-hidden="true"
                tabIndex={-1}
                style={{ position: 'relative', width: '160px', flexShrink: 0, display: 'block', minHeight: '130px' }}
              >
                <Image src={post.coverImage || 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=800&q=80'} alt={post.title} fill style={{ objectFit: 'cover' }} sizes="160px" />
              </Link>
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    {post.category}
                  </span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <time style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', fontWeight: 600 }}>
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </time>
                </div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3 }}>
                  <Link href={`/blog/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {post.title}
                  </Link>
                </h2>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {post.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
