import { getStoryBySlug, getStories } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

const BASE_URL = 'https://chatwizs.com';
const PUBLISHER_NAME = 'ChatWizs';
const DEFAULT_LOGO = `${BASE_URL}/logo-96x96.png`;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) return { title: 'Story Not Found' };

  const storyUrl = `${BASE_URL}/stories/${slug}`;
  const title = story.seoTitle || `${story.title} | ${PUBLISHER_NAME} Web Stories`;
  const description = story.metaDescription || story.description;

  return {
    title,
    description,
    alternates: { canonical: storyUrl },
    openGraph: {
      title: story.title,
      description,
      url: storyUrl,
      siteName: PUBLISHER_NAME,
      type: 'article',
      publishedTime: story.date,
      modifiedTime: story.lastModified || story.date,
      authors: [story.author],
      images: [{ url: story.posterImage, width: 640, height: 853, alt: story.title }],
    },
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
  };
}

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const stories = await getStories();
  return stories.map((story) => ({ slug: story.slug }));
}

export default async function WebStoryPage({ params }: Props) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story || !story.published) notFound();

  const storyUrl = `${BASE_URL}/stories/${story.slug}`;
  const logoUrl = story.publisherLogo || DEFAULT_LOGO;

  return (
    <>
      <amp-story
        standalone="true"
        title={story.title}
        publisher={PUBLISHER_NAME}
        publisher-logo-src={logoUrl}
        poster-portrait-src={story.posterImage}
        poster-square-src={story.squarePoster || story.posterImage}
        poster-landscape-src={story.landscapePoster || story.posterImage}
      >
        {(story.slides || []).map((slide, index) => (
          <amp-story-page id={`slide-${index + 1}`} key={slide.id} auto-advance-after="7s">
            <amp-story-grid-layer template="fill">
              <amp-img src={slide.image} width="720" height="1280" layout="responsive" alt={story.title} />
            </amp-story-grid-layer>
            <amp-story-grid-layer template="fill">
              <div style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%)' }}></div>
            </amp-story-grid-layer>
            {slide.text && (
              <amp-story-grid-layer template="vertical">
                <div style={{ alignSelf: 'end', padding: '24px', paddingBottom: '80px', color: 'white' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>{slide.text.slice(0, 180)}</h2>
                </div>
              </amp-story-grid-layer>
            )}
          </amp-story-page>
        ))}
      </amp-story>
    </>
  );
}
