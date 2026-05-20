import { getPosts } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const BASE_URL = 'https://chatwizs.com';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  // Convert slug to display name: "digital-marketing" → "Digital Marketing"
  const categoryName = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    title: `${categoryName} — Expert Articles & Guides | ChatWizs`,
    description: `Browse ${categoryName} expert articles on ChatWizs. All content is research-backed, fact-checked, and built for 2026 Google search standards.`,
    alternates: {
      canonical: `${BASE_URL}/category/${slug}`,
      types: {
        'application/rss+xml': `${BASE_URL}/feed.xml`,
      },
    },
    openGraph: {
      title: `${categoryName} Insights | ChatWizs`,
      description: `Expert-verified ${categoryName} articles, guides, and strategies.`,
      url: `${BASE_URL}/category/${slug}`,
      siteName: 'ChatWizs',
      type: 'website',
      locale: 'en_US',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPosts();
  const categories = Array.from(
    new Set(posts.map(p => (p.category || 'general').toLowerCase().replace(/ /g, '-')))
  );
  return categories.map(slug => ({ slug }));
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();

  const allPosts = await getPosts();
  const posts = allPosts
    .filter(p => p.published && (p.category || '').toLowerCase().replace(/ /g, '-') === slug.toLowerCase())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const categoryName = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  // ✅ CollectionPage + ItemList schema for rich results
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${BASE_URL}/category/${slug}#webpage`,
        url: `${BASE_URL}/category/${slug}`,
        name: `${categoryName} — ChatWizs`,
        description: `Expert-verified ${categoryName} articles on ChatWizs.`,
        inLanguage: 'en-US',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        breadcrumb: { '@id': `${BASE_URL}/category/${slug}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${BASE_URL}/category/${slug}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
          { '@type': 'ListItem', position: 3, name: categoryName, item: `${BASE_URL}/category/${slug}` },
        ],
      },
      // ✅ ItemList schema — helps Google understand the page is a content list
      {
        '@type': 'ItemList',
        '@id': `${BASE_URL}/category/${slug}#list`,
        name: `${categoryName} Articles`,
        numberOfItems: posts.length,
        itemListElement: posts.slice(0, 10).map((post, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${BASE_URL}/blog/${post.slug}`,
          name: post.title,
        })),
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem', fontSize: '0.875rem' }}>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '0.5rem', color: 'var(--muted-foreground)', fontWeight: 600 }}>
          <li><Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link></li>
          <li style={{ color: '#94a3b8' }}>/</li>
          <li><Link href="/blog" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Blog</Link></li>
          <li style={{ color: '#94a3b8' }}>/</li>
          <li aria-current="page" style={{ color: 'var(--foreground)' }}>{categoryName}</li>
        </ol>
      </nav>

      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent)', border: '1px solid var(--border)', padding: '0.375rem 1rem', borderRadius: '20px', fontSize: '0.8125rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          Category
        </div>
        <h1 style={{ fontSize: '2.75rem', marginBottom: '1rem', letterSpacing: '-0.03em', fontWeight: 900, lineHeight: 1.1 }}>
          {categoryName}
        </h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.125rem', maxWidth: '600px', lineHeight: 1.6 }}>
          {posts.length} expert-verified article{posts.length !== 1 ? 's' : ''} on {categoryName.toLowerCase()}. All content is fact-checked and built for 2026 Google search standards.
        </p>
      </section>

      {posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted-foreground)', background: 'var(--muted)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '1.25rem' }}>No articles found in this category yet.</p>
          <Link href="/blog" style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--primary)', fontWeight: 700 }}>Browse All Articles →</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          {posts.map((post) => (
            <article
              key={post.id}
              className="glass-panel card-hover"
              style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              itemScope
              itemType="https://schema.org/BlogPosting"
            >
              <Link href={`/blog/${post.slug}`} aria-hidden="true" tabIndex={-1} style={{ position: 'relative', width: '100%', height: '200px', display: 'block' }}>
                <Image
                  src={post.coverImage || 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=800&q=80'}
                  alt={post.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </Link>
              <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                  <time dateTime={post.date} itemProp="datePublished">
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </time>
                  {post.readingTime && (
                    <>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span>{post.readingTime} min read</span>
                    </>
                  )}
                </div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '0.875rem', lineHeight: 1.3, fontWeight: 800 }} itemProp="headline">
                  <Link href={`/blog/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{post.title}</Link>
                </h2>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9375rem', marginBottom: '1.5rem', flex: 1, lineHeight: 1.6 }}>{post.excerpt}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto' }}>
                  <span style={{ color: '#475569', fontWeight: 700 }} itemProp="author">{post.author}</span>
                  <Link href={`/blog/${post.slug}`} aria-label={`Read article: ${post.title}`} style={{ color: 'var(--primary)', fontWeight: 800, textDecoration: 'none' }}>Read More →</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
