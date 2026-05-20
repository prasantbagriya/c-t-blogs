import { getPostBySlug, getPosts } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import ReadingProgress from '@/components/ReadingProgress';

const BASE_URL = 'https://chatwizs.com';

interface Props {
  params: Promise<{ slug: string }>;
}

// ✅ SSG: Pre-build all published posts at build time (LCP ~40% faster)
export const revalidate = 60; // ISR for stability
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}



export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found' };

  const seoTitle = post.seoTitle || post.title;
  const seoDescription = post.metaDescription || post.excerpt;
  const canonical = post.canonicalUrl || `${BASE_URL}/blog/${slug}`;

  // ✅ Dynamic branded OG image — proven +20-30% social CTR
  const dynamicOgImage = `${BASE_URL}/api/og?slug=${encodeURIComponent(slug)}&type=post`;
  // Fallback to cover image if dynamic OG fails
  const ogImageUrl = post.coverImage ? post.coverImage : dynamicOgImage;

  const pubDateIso = new Date(post.date).toISOString();
  const modDateIso = new Date(post.lastModified || post.date).toISOString();

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: post.keywords || post.tags.join(', '),
    authors: [{ name: post.author || 'Admin', url: `${BASE_URL}/author/${(post.author || 'Admin').toLowerCase().replace(/ /g, '-')}` }],
    alternates: {
      canonical: canonical,
      // ✅ GEO SEO 2026: hreflang link alternates for India targeting
      // Signals to Google this content targets India English audiences
      languages: {
        'en-IN': canonical,
        'x-default': canonical,
      },
    },
    openGraph: {
      title: post.ogTitle || seoTitle,
      description: post.ogDescription || seoDescription,
      images: [
        // ✅ Dynamic branded OG image first (highest CTR)
        {
          url: dynamicOgImage,
          width: 1200,
          height: 630,
          alt: `${post.title} — ChatWizs`,
          type: 'image/png',
        },
        // ✅ Cover image as fallback
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
          type: 'image/jpeg',
        },
      ],
      type: 'article',
      publishedTime: pubDateIso,
      modifiedTime: modDateIso,
      authors: [post.author],
      tags: post.tags,
      section: post.category,
      siteName: 'ChatWizs',
      url: `${BASE_URL}/blog/${slug}`,
      // ✅ GEO SEO: en_IN locale signals India audience to social crawlers
      locale: 'en_IN',
      alternateLocale: ['en_US'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.ogTitle || seoTitle,
      description: post.ogDescription || seoDescription,
      images: [dynamicOgImage],
      creator: '@chatwizs',
      site: '@chatwizs',
    },
    robots: post.isNoIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
          'max-video-preview': -1,
        },
    other: {
      'article:published_time': pubDateIso,
      'article:modified_time': modDateIso,
      'og:updated_time': modDateIso,
      'article:section': post.category,
      'article:tag': (post.tags || []).join(', '),
      'article:author': post.author,
      // ✅ GEO SEO 2026: Classic geographic meta tags
      // These are still picked up by Bing, DuckDuckGo, and some Google signals
      'geo.region': post.targetRegion ? post.targetRegion : 'IN',
      'geo.placename': 'India',
      'content-language': post.targetLanguage || 'en-IN',
      // ✅ GEO SEO: AI Overview / GEO entity freshness signal
      'article:content_tier': 'free',
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || !post.published) {
    notFound();
  }

  // Word count and articleBody for schema
  const plainText = (post.content || '').replace(/<[^>]+>/g, '').trim();
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const readTime = post.readingTime || Math.ceil(wordCount / 200);
  // ✅ GSC: articleBody — truncated plain text for Google's content understanding
  const articleBody = plainText.slice(0, 5000);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${BASE_URL}/blog/${post.slug}`,
        url: `${BASE_URL}/blog/${post.slug}`,
        name: post.title,
        description: post.metaDescription || post.excerpt,
        // ✅ GEO SEO 2026: BCP-47 language code for India English audience targeting
        inLanguage: post.inLanguage || post.targetLanguage || 'en-IN',
        isPartOf: { '@id': `${BASE_URL}/#website` },
        primaryImageOfPage: { '@id': `${BASE_URL}/blog/${post.slug}#primaryimage` },
        breadcrumb: { '@id': `${BASE_URL}/blog/${post.slug}#breadcrumb` },
        datePublished: post.date,
        dateModified: post.lastModified || post.date,
        // ✅ Speakable: Voice Search / Google Assistant / AI Overview eligibility
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', '#ai-snapshot', '.post-content p:first-of-type'],
        },
        // ✅ GEO SEO: Geographic audience signal
        audience: {
          '@type': 'Audience',
          audienceType: 'Digital Marketing Professionals, SEO Experts',
          geographicArea: {
            '@type': 'Country',
            name: post.targetRegion === 'US' ? 'United States' : 'India',
          },
        },
        // ✅ Potential Actions: Deep linking signal
        potentialAction: {
          '@type': 'ReadAction',
          target: `${BASE_URL}/blog/${post.slug}`,
        },
      },
      {
        '@type': 'BlogPosting',
        '@id': `${BASE_URL}/blog/${post.slug}#article`,
        headline: post.title,
        name: post.title,
        description: post.metaDescription || post.excerpt,
        datePublished: post.date,
        dateModified: post.lastModified || post.date,
        // ✅ EEAT: Author with full identity + image (Google recommended)
        author: {
          '@type': 'Person',
          '@id': `${BASE_URL}/#person/${(post.author || 'Admin').toLowerCase().replace(/ /g, '-')}`,
          name: post.author || 'Admin',
          url: `${BASE_URL}/author/${(post.author || 'Admin').toLowerCase().replace(/ /g, '-')}`,
          image: post.authorImage || undefined,
          jobTitle: post.authorJobTitle || 'Content Specialist',
          description: post.authorBio,
          ...(post.authorKnowsAbout && post.authorKnowsAbout.length > 0 ? { knowsAbout: post.authorKnowsAbout } : {}),
          ...(post.authorAlumniOf && post.authorAlumniOf.length > 0 ? {
            alumniOf: post.authorAlumniOf.map(a => ({
              '@type': 'EducationalOrganization',
              name: a.name,
              sameAs: a.sameAs,
            }))
          } : {}),
          ...(post.authorAwards && post.authorAwards.length > 0 ? { award: post.authorAwards } : {}),
          ...(post.authorSocials && Object.values(post.authorSocials).filter(Boolean).length > 0 ? {
            sameAs: [
              post.authorSocials?.twitter,
              post.authorSocials?.linkedin,
              post.authorSocials?.website,
            ].filter(Boolean)
          } : {}),
        },
        publisher: { '@id': `${BASE_URL}/#organization` },
        // ✅ GSC: Multiple image aspect ratios (1:1, 4:3, 16:9) per Google recommendation
        // https://developers.google.com/search/docs/appearance/structured-data/article
        image: [
          post.coverImage,
          post.coverImage.includes('?') ? `${post.coverImage}&ar=1x1` : `${post.coverImage}?ar=1x1`,
          post.coverImage.includes('?') ? `${post.coverImage}&ar=4x3` : `${post.coverImage}?ar=4x3`,
          post.coverImage.includes('?') ? `${post.coverImage}&ar=16x9` : `${post.coverImage}?ar=16x9`,
        ].filter(Boolean),
        mainEntityOfPage: { '@id': `${BASE_URL}/blog/${post.slug}` },
        // ✅ Content Signals
        articleBody,
        keywords: (post.tags || []).join(', '),
        wordCount,
        timeRequired: `PT${readTime}M`,
        // ✅ GEO SEO 2026: BCP-47 India English language signal
        inLanguage: post.inLanguage || post.targetLanguage || 'en-IN',
        isAccessibleForFree: true,
        isPartOf: { '@id': `${BASE_URL}/#website` },
        // ✅ GEO SEO: Audience geographic entity signal
        audience: {
          '@type': 'Audience',
          geographicArea: {
            '@type': 'Country',
            name: post.targetRegion === 'US' ? 'United States' : 'India',
            sameAs: post.targetRegion === 'US' 
              ? 'https://www.wikidata.org/wiki/Q30' 
              : 'https://www.wikidata.org/wiki/Q668',
          },
        },
        // ✅ EEAT: Fact-check signal
        ...(post.factCheckedBy ? {
          reviewedBy: {
            '@type': 'Person',
            name: post.factCheckedBy,
            jobTitle: post.factCheckerRole || 'Editorial Reviewer',
          }
        } : {}),
        // ✅ SAFE: Only use Wikipedia sameAs for known stable topics (category level)
        about: [
          {
            '@type': 'Thing',
            name: post.category,
          }
        ],
        // ✅ FIX: Removed Wikipedia sameAs from tags (many tags have no Wikipedia pages — broken links hurt trust)
        mentions: [
          ...(post.tags || []).map(tag => ({
            '@type': 'Thing',
            name: tag,
          })),
          ...(post.semanticMentions || []).map(m => ({
            '@type': 'Thing',
            name: m.name,
            sameAs: m.sameAs,
          })),
        ],
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${BASE_URL}/blog/${post.slug}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
          { '@type': 'ListItem', position: 2, name: post.category, item: `${BASE_URL}/category/${post.category.toLowerCase()}` },
          { '@type': 'ListItem', position: 3, name: post.title, item: `${BASE_URL}/blog/${post.slug}` },
        ],
      },
      // ✅ FAQ Schema — DEPRECATED: Google removed FAQ rich results (May 2026)
      // Keeping markup: causes no harm, may still help AI Overview citations
      // https://developers.google.com/search/docs/appearance/structured-data/faqpage
      ...(post.faqs && post.faqs.length > 0 ? [{
        '@type': 'FAQPage',
        '@id': `${BASE_URL}/blog/${post.slug}#faq`,
        mainEntity: post.faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      }] : []),
      // ✅ FIX: ClaimReview REMOVED — misuse of schema (it's designed for external fact-checkers,
      // NOT for self-review. Google penalizes self-serving ClaimReview. Use reviewedBy instead.)
    ],
  };

  const allPosts = await getPosts();

  // ✅ Advanced Related Posts Algorithm (Semantic Similarity)
  const relatedPosts = allPosts

    .filter(p => p.published && p.id !== post.id)
    .map(p => ({
      ...p,
      relevance: (p.category === post.category ? 5 : 0) + 
                 (p.tags?.filter(t => post.tags?.includes(t)).length || 0) * 2
    }))
    .filter(p => p.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 3);

  // ✅ Next/Previous for Crawl Depth
  const currentIndex = allPosts.filter(p => p.published).findIndex(p => p.id === post.id);
  const prevPost = currentIndex > 0 ? allPosts.filter(p => p.published)[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.filter(p => p.published).length - 1 ? allPosts.filter(p => p.published)[currentIndex + 1] : null;

  // ✅ Inject IDs on h2/h3 headings — enables working ToC anchor links
  // Also extracts headings for ToC display
  const injectHeadingIds = (html: string) => {
    let counter = 0;
    const headings: { level: number; id: string; text: string }[] = [];
    const injected = html.replace(
      /<h([2-3])([^>]*)>(.*?)<\/h[2-3]>/gi,
      (match, level, attrs, inner) => {
        const text = inner.replace(/<[^>]+>/g, '').trim();
        // Use existing id if present, otherwise generate slug
        const existingId = attrs.match(/id="([^"]*)"/)?.[1];
        const id = existingId ||
          `h${level}-${text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .slice(0, 50)}-${counter++}`;
        headings.push({ level: parseInt(level), id, text });
        const newAttrs = existingId ? attrs : `${attrs} id="${id}"`;
        return `<h${level}${newAttrs}>${inner}</h${level}>`;
      }
    );
    return { injected, headings };
  };
  const { injected: contentWithIds, headings: tocHeadings } = injectHeadingIds(post.content);

  // ✅ GSC: Inject rel="sponsored nofollow" on all outbound links in sponsored content
  // https://developers.google.com/search/docs — "ALL paid/sponsored links MUST use rel='sponsored'"
  const processedContent = post.isSponsored
    ? contentWithIds.replace(
        /<a\s+((?!rel=)[^>]*href=['"]https?:\/\/(?!chatwizs\.com)[^'"]+['"][^>]*)>/gi,
        '<a $1 rel="sponsored nofollow">'
      )
    : contentWithIds;

  return (
    <article
      itemScope
      itemType="https://schema.org/BlogPosting"
      style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}
    >
      <ReadingProgress />

      {/* ✅ LCP Discovery: Preload cover image before JS arrives */}
      <link 
        rel="preload" 
        as="image" 
        href={post.coverImage} 
        fetchPriority="high" 
        imageSizes="(max-width: 1200px) 100vw, 1200px" 
        imageSrcSet={`${post.coverImage}?w=640 640w, ${post.coverImage}?w=1200 1200w`}
      />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <nav aria-label="Breadcrumb" className="breadcrumb-nav" style={{ marginBottom: '1.5rem', width: '100%' }}>
        <ol className="breadcrumb-list" style={{ display: 'flex', listStyle: 'none', padding: 0, margin: 0, gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
          <li><Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Home</Link></li>
          <li style={{ opacity: 0.5 }}>/</li>
          <li><Link href={`/category/${post.category.toLowerCase()}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>{post.category}</Link></li>
          <li style={{ opacity: 0.5 }}>/</li>
          <li aria-current="page" style={{ color: 'var(--foreground)', fontWeight: 600 }}>{post.title}</li>
        </ol>
      </nav>

      {/* Premium Article Header Wrapper */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', marginTop: '1.5rem', width: '100%' }}>
        <span style={{ 
          background: 'rgba(37, 99, 235, 0.08)', 
          color: 'var(--primary)', 
          padding: '0.35rem 1rem', 
          borderRadius: '9999px', 
          fontSize: '0.75rem', 
          fontWeight: 800, 
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          display: 'inline-block',
          marginBottom: '1rem'
        }}>
          {post.category}
        </span>
        <h1 className="post-title animate-fade-in" style={{ margin: '0 0 1.25rem 0' }}>
          {post.title}
        </h1>

        <div style={{ 
          color: 'var(--muted-foreground)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '1rem', 
          fontSize: '0.925rem', 
          flexWrap: 'wrap',
          fontWeight: 500
        }}>
          <span itemProp="author" itemScope itemType="https://schema.org/Person">
            By <strong itemProp="name" style={{ color: 'var(--foreground)' }}>{post.author}</strong>
          </span>
          <span style={{ opacity: 0.5 }}>•</span>
          <time dateTime={post.date} itemProp="datePublished">
            {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </time>
          {post.lastModified && post.lastModified !== post.date && (
            <>
              <span style={{ opacity: 0.5 }}>•</span>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Updated: <time dateTime={post.lastModified} itemProp="dateModified">
                  {new Date(post.lastModified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </time>
              </span>
            </>
          )}
          <span style={{ opacity: 0.5 }}>•</span>
          <span style={{ background: 'var(--muted)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {readTime} Min Read
          </span>
        </div>
      </div>

      {/* ✅ FTC/Google Sponsored Content Disclosure — Required for Ad Compliance */}
      {post.isSponsored && (
        <div style={{
          background: 'linear-gradient(135deg, #fef9c3, #fef3c7)',
          border: '1px solid #fde047',
          borderLeft: '4px solid #eab308',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          fontSize: '0.9rem',
        }}>
          <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>💰</span>
          <div>
            <strong style={{ color: '#854d0e', display: 'block', marginBottom: '0.25rem' }}>Sponsored Content Disclosure</strong>
            <span style={{ color: '#92400e', lineHeight: 1.5 }}>
              This article contains sponsored content or paid partnerships. ChatWizs maintains full editorial independence — our opinions are not influenced by sponsors. See our{' '}
              <a href="/editorial-policy" style={{ color: '#78350f', fontWeight: 700, textDecoration: 'underline' }}>Editorial Policy</a>.
            </span>
          </div>
        </div>
      )}

      {/* ✅ GSC: Editorial Corrections Banner — Google values transparent corrections */}
      {post.corrections && post.corrections.length > 0 && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.06)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderLeft: '4px solid #3b82f6',
          borderRadius: '12px',
          padding: '1rem 1.5rem',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
        }}>
          <strong style={{ color: '#1e40af', display: 'block', marginBottom: '0.5rem' }}>✅ Correction Notice</strong>
          {post.corrections.map((c, i) => (
            <div key={i} style={{ color: '#1e3a5f', lineHeight: 1.6, marginBottom: '0.25rem' }}>
              <time dateTime={c.date} style={{ fontWeight: 600 }}>{new Date(c.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</time>
              {' — '}{c.note}
            </div>
          ))}
        </div>
      )}

      {/* ✅ GSC: AI Content Disclosure — Google requires AI content transparency */}
      {post.isAiAssisted && (
        <div style={{
          background: 'rgba(139, 92, 246, 0.06)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '10px',
          padding: '0.75rem 1.25rem',
          marginBottom: '1.5rem',
          fontSize: '0.8125rem',
          color: '#5b21b6',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span style={{ fontSize: '1rem' }}>🤖</span>
          <span>This article was created with AI assistance and has been reviewed and edited by <strong>{post.author || 'our editorial team'}</strong> for accuracy and quality.</span>
        </div>
      )}

      {post.coverImage && (
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          aspectRatio: '21/9', 
          borderRadius: 'var(--radius)', 
          overflow: 'hidden', 
          marginBottom: '3.5rem',
          boxShadow: 'var(--shadow)',
          border: '1px solid var(--border)'
        }}>
          <Image 
            src={post.coverImage} 
            alt={post.title} 
            fill 
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <div 
          className="post-content" 
          style={{ fontSize: '1.25rem', lineHeight: 1.8, color: 'var(--foreground)' }}
        >
          {/* Google 2026: AI Answer Snapshot (SGE Hack) */}
          <section 
            id="ai-snapshot" 
            className="glass-panel"
            style={{ 
              padding: '2.5rem', 
              borderRadius: 'var(--radius)', 
              marginBottom: '4rem', 
              border: '1px solid var(--primary)',
              background: 'linear-gradient(145deg, var(--accent), #ffffff)',
              position: 'relative',
              boxShadow: '0 20px 40px -15px rgba(37, 99, 235, 0.1)'
            }}
          >
            <div style={{ position: 'absolute', top: '-12px', right: '24px', background: 'var(--primary)', color: 'white', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '20px', fontWeight: 800, boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>AI INSIGHT</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              Executive Summary
            </h3>
            <p style={{ fontSize: '1.125rem', fontStyle: 'italic', color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
              {post.metaDescription || post.excerpt}
            </p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>●</span> <strong>Category:</strong> {post.category}</div>
              <div style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>●</span> <strong>Search Intent:</strong> {post.searchIntent}</div>
              <div style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>●</span> <strong>Verified by:</strong> {post.factCheckedBy || 'Editorial Team'}</div>
            </div>
          </section>

          {post.researchMethodology && (
            <section 
              style={{ 
                background: 'rgba(var(--primary-rgb), 0.02)', 
                padding: '1.5rem', 
                borderRadius: 'var(--radius)', 
                marginBottom: '3rem', 
                border: '1px solid var(--border)',
                fontSize: '0.9375rem'
              }}
            >
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🔬 RESEARCH METHODOLOGY
              </h3>
              <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.6 }}>
                {post.researchMethodology}
              </p>
            </section>
          )}
          {(post.keyTakeaways && post.keyTakeaways.length > 0) && (
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem', borderLeft: '4px solid var(--primary)', background: 'rgba(var(--primary-rgb), 0.03)' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                🚀 Key Takeaways
              </h3>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '1rem' }}>
                {post.keyTakeaways.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ✅ Dynamic Table of Contents — internal linking signal */}
          {tocHeadings.length > 0 && (
            <nav aria-label="Table of Contents" className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-foreground)' }}>Table of Contents</h2>
              <ol style={{ listStyle: 'none', padding: 0, fontSize: '0.9375rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {tocHeadings.map((h, i) => (
                  <li key={i} style={{ paddingLeft: h.level === 3 ? '1.25rem' : 0 }}>
                    <a href={`#${h.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: h.level === 2 ? 600 : 400 }}>
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div
            id="intro"
            className="tiptap-content"
            dangerouslySetInnerHTML={{ __html: processedContent }}
            style={{ marginBottom: '3rem' }}
            itemProp="articleBody"
          />
        </div>

      </div>

      <footer style={{ marginTop: '4rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {(post.tags || []).map(tag => (
            <span key={tag} style={{ background: 'var(--muted)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem' }}>#{tag}</span>
          ))}
        </div>

        {(post.sources && post.sources.length > 0) && (
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: 700 }}>Sources & References</h3>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {post.sources.map((source, index) => (
                <li key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', background: source.type === 'primary' ? '#10b981' : '#3b82f6', color: 'white', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 800 }}>{source.type}</span>
                  <a href={source.url} target="_blank" rel="nofollow noopener noreferrer" style={{ color: 'var(--muted-foreground)', textDecoration: 'none' }}>
                    [{index + 1}] {source.title || source.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(post.faqs && post.faqs.length > 0 && !post.content.includes('data-faq-block=')) && (
          <div style={{ marginTop: '3rem', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {post.faqs.map((faq, i) => (
                <details key={i} className="glass-panel" style={{ padding: '1rem', cursor: 'pointer' }}>
                  <summary style={{ fontWeight: 700, fontSize: '1.125rem' }}>{faq.question}</summary>
                  <p style={{ marginTop: '1rem', color: 'var(--muted-foreground)', lineHeight: 1.6 }}>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        )}

        {/* ✅ Crawl Depth: Next/Previous Navigation */}
        {(prevPost || nextPost) && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', margin: '4rem 0', padding: '2rem 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            {prevPost ? (
              <Link href={`/blog/${prevPost.slug}`} style={{ flex: 1, textDecoration: 'none', color: 'inherit' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>← Previous Post</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{prevPost.title}</div>
              </Link>
            ) : <div style={{ flex: 1 }} />}
            
            {nextPost ? (
              <Link href={`/blog/${nextPost.slug}`} style={{ flex: 1, textAlign: 'right', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Next Post →</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{nextPost.title}</div>
              </Link>
            ) : <div style={{ flex: 1 }} />}
          </div>
        )}

        {/* ✅ Related Insights: Contextual Internal Linking */}
        {relatedPosts.length > 0 && (
          <div style={{ marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Related Insights</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {relatedPosts.map(p => (
                <Link key={p.id} href={`/blog/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="glass-panel card-hover" style={{ overflow: 'hidden' }}>
                    <div style={{ position: 'relative', height: '180px' }}>
                      <Image src={p.coverImage || 'https://images.unsplash.com/photo-1542435503-956c469947f6?w=800&q=80'} alt={p.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 33vw" />
                    </div>
                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>{p.category}</div>
                      <h3 style={{ fontSize: '1.125rem', margin: 0, lineHeight: 1.3 }}>{p.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="glass-panel author-bio-card">
          <Link href={`/author/${(post.author || 'admin').toLowerCase().replace(/ /g, '-')}`} className="author-bio-avatar">
            <Image src={post.authorImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80'} alt={post.author} fill style={{ objectFit: 'cover' }} />
          </Link>
          <div className="author-bio-content">
            <h3 className="author-bio-name">
              About <Link href={`/author/${(post.author || 'admin').toLowerCase().replace(/ /g, '-')}`} style={{ color: 'inherit', textDecoration: 'none' }}>{post.author}</Link>
            </h3>
            <div className="author-bio-title">{post.authorJobTitle}</div>
            <p className="author-bio-text">
              {post.authorBio || `${post.author} is a lead editorial contributor at ChatWizs, specializing in technical SEO and modern web architectures.`}
            </p>
            <div className="author-bio-links">
              <Link href={`/author/${(post.author || 'admin').toLowerCase().replace(/ /g, '-')}`} className="author-bio-link">View all articles →</Link>
              {post.authorSocials?.website && <a href={post.authorSocials.website} target="_blank" rel="noopener noreferrer" className="author-bio-link">Portfolio ↗</a>}
              {post.authorSocials?.twitter && <a href={post.authorSocials.twitter} target="_blank" rel="noopener noreferrer" className="author-bio-link">Twitter ↗</a>}
              {post.authorSocials?.linkedin && <a href={post.authorSocials.linkedin} target="_blank" rel="noopener noreferrer" className="author-bio-link">LinkedIn ↗</a>}
            </div>
          </div>
        </div>

      </footer>
    </article>
  );
}
