import { getStories, WebStory } from '@/lib/db';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

const BASE_URL = 'https://chatwizs.com';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Web Stories | ChatWizs',
  description: 'Discover visual Web Stories on SEO, technology, and digital trends. Bite-sized expert insights powered by Google Web Stories.',
  alternates: { canonical: `${BASE_URL}/stories` },
  openGraph: {
    title: 'Web Stories | ChatWizs',
    description: 'Visual Web Stories — SEO, technology, and digital trends.',
    type: 'website',
    url: `${BASE_URL}/stories`,
    siteName: 'ChatWizs',
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
};

export default async function StoriesIndexPage() {
  let stories: WebStory[] = [];
  try {
    const allStories = await getStories();
    stories = (allStories || []).filter(s => s.published);
  } catch (error) {
    console.error('Error loading stories:', error);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${BASE_URL}/stories#webpage`,
    url: `${BASE_URL}/stories`,
    name: 'Web Stories — ChatWizs',
    description: 'Visual Web Stories on SEO, technology, and digital trends.',
    isPartOf: { '@id': `${BASE_URL}/#website` },
    inLanguage: 'en-US',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Stories', item: `${BASE_URL}/stories` },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: stories.length,
      itemListElement: stories.map((story, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${BASE_URL}/stories/${story.slug}`,
        name: story.title,
        image: story.posterImage,
      })),
    },
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '0.5rem', fontWeight: 600 }}>
          <li><Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link></li>
          <li style={{ color: '#94a3b8' }}>/</li>
          <li aria-current="page" style={{ color: 'var(--foreground)' }}>Stories</li>
        </ol>
      </nav>
      <section style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', letterSpacing: '-0.03em' }}>Web Stories</h1>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.125rem' }}>{stories.length} visual stories — swipe through expert SEO and tech insights.</p>
      </section>
      {stories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted-foreground)' }}>
          <p style={{ fontSize: '1.25rem' }}>No stories published yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
          {stories.map((story) => (
            <Link key={story.id} href={`/stories/${story.slug}`} className="card-hover" style={{ display: 'block', position: 'relative', aspectRatio: '3/4', borderRadius: 'var(--radius)', overflow: 'hidden', textDecoration: 'none' }}>
              <Image src={story.posterImage || 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=800&q=80'} alt="" fill style={{ objectFit: 'cover' }} sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, 200px" />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem 1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.92), rgba(0,0,0,0.3) 60%, transparent)' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.2, color: 'white', margin: 0 }}>{story.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
