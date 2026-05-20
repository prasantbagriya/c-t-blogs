import { promises as fs } from 'fs';
import path from 'path';
import { existsSync, readFileSync } from 'fs';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaDescription: string;
  seoTitle?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  keywords?: string;
  coverImage: string;
  videoUrl?: string;
  author: string;
  authorBio: string;
  authorImage: string;
  authorJobTitle: string; 
  authorExperienceYears?: number; 
  authorAwards?: string[]; 
  authorAlumniOf?: { name: string; sameAs: string }[]; 
  authorSocials: {
    twitter?: string;
    linkedin?: string;
    website?: string; 
  };
  date: string;
  lastModified?: string;
  category: string;
  tags: string[];
  published: boolean;
  readingTime?: number;
  seoScore?: number;
  isSponsored?: boolean;
  isAiAssisted?: boolean;
  factCheckedBy?: string;
  factCheckerRole?: string; 
  authorKnowsAbout?: { name: string; sameAs: string }[]; 
  keyTakeaways?: string[];
  sources?: { title: string; url: string; type: 'primary' | 'secondary' }[]; 
  researchMethodology?: string; 
  reviewCycleDays?: number;
  nextReviewDate?: string;
  faqs?: { question: string; answer: string }[]; 
  searchIntent?: 'informational' | 'transactional' | 'commercial' | 'navigational'; 
  isPillarPage?: boolean;
  semanticMentions?: { name: string; sameAs: string }[]; 
  integrityHash?: string;
  isNoIndex?: boolean;             // ✅ GSC: Exclude from search index (noindex, nofollow)
  corrections?: { date: string; note: string }[]; // ✅ GSC: Transparent editorial corrections log
  // ✅ GEO SEO 2026: Geographic & language targeting signals
  targetRegion?: string;           // e.g. 'IN', 'US', 'GB' (ISO 3166-1 alpha-2)
  targetLanguage?: string;         // e.g. 'en-IN', 'hi-IN', 'en-US'
  geoCoordinates?: { lat: number; lng: number }; // Precise location (for LocalBusiness schema)
  speakableContent?: boolean;      // Flag for Google Assistant / AI Overview speakable optimization
  contentScope?: 'global' | 'india' | 'regional'; // Geographic content scope
  inLanguage?: string;             // BCP 47 language code e.g. 'en-IN'
}


export interface StorySlide {
  id: string;
  image: string;
  video?: string;
  text?: string;
}

export interface WebStory {
  id: string;
  title: string;               
  slug: string;
  description: string;         
  category: string;            
  tags: string[];              
  posterImage: string;         
  squarePoster?: string;       
  landscapePoster?: string;    
  videoUrl?: string;
  date: string;                
  lastModified?: string;       
  author: string;
  authorBio?: string;          
  authorImage?: string;        
  authorSocials?: {            
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  publisherLogo: string;       
  slides: StorySlide[];
  published: boolean;
  seoTitle?: string;           
  metaDescription?: string;    
  isSponsored?: boolean;       
  textLength?: number;         
  isNoIndex?: boolean;         // ✅ GSC: Exclude story from search index
}

// ✅ ULTRA-STABLE PATHS
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'posts.json');
const STORIES_PATH = path.join(DATA_DIR, 'stories.json');
const AUTHORS_PATH = path.join(DATA_DIR, 'authors.json');
const CATEGORIES_PATH = path.join(DATA_DIR, 'categories.json');

// Cache posts in memory to avoid disk I/O on every request
// We refresh this cache every 10 seconds to balance speed and sync
let cachedPosts: Post[] | null = null;
let cachedStories: WebStory[] | null = null;
let cachedAuthors: import('./types').AuthorProfile[] | null = null;
let cachedCategories: import('./types').Category[] | null = null;
let lastReadPosts = 0;
let lastReadStories = 0;
let lastReadAuthors = 0;
let lastReadCategories = 0;
const CACHE_WINDOW = 10000; // 10 seconds

async function fastWrite(filePath: string, data: any) {
  try {
    const json = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, json, 'utf-8');
    // Clear specific cache to force next read to be fresh
    if (filePath === DB_PATH) {
      cachedPosts = null;
      lastReadPosts = 0;
    } else if (filePath === STORIES_PATH) {
      cachedStories = null;
      lastReadStories = 0;
    } else if (filePath === AUTHORS_PATH) {
      cachedAuthors = null;
      lastReadAuthors = 0;
    } else if (filePath === CATEGORIES_PATH) {
      cachedCategories = null;
      lastReadCategories = 0;
    }
  } catch (err) {
    console.error('CRITICAL WRITE ERROR:', err);
  }
}

async function loadData<T>(filePath: string): Promise<T[]> {
  const now = Date.now();
  
  // Use memory cache if available and fresh
  if (filePath === DB_PATH && lastReadPosts >= now - CACHE_WINDOW) return cachedPosts as unknown as T[];
  if (filePath === STORIES_PATH && lastReadStories >= now - CACHE_WINDOW) return cachedStories as unknown as T[];
  if (filePath === AUTHORS_PATH && lastReadAuthors >= now - CACHE_WINDOW) return cachedAuthors as unknown as T[];
  if (filePath === CATEGORIES_PATH && lastReadCategories >= now - CACHE_WINDOW) return cachedCategories as unknown as T[];

  try {
    // If file doesn't exist, return empty (don't create here to save I/O)
    if (!existsSync(filePath)) return [];
    
    const raw = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(raw || '[]');
    
    if (filePath === DB_PATH) {
      cachedPosts = data;
      lastReadPosts = now;
    }
    if (filePath === STORIES_PATH) {
      cachedStories = data;
      lastReadStories = now;
    }
    if (filePath === AUTHORS_PATH) {
      cachedAuthors = data;
      lastReadAuthors = now;
    }
    if (filePath === CATEGORIES_PATH) {
      cachedCategories = data;
      lastReadCategories = now;
    }
    
    return data;
  } catch (err) {
    return [];
  }
}

export async function getStories(): Promise<WebStory[]> {
  return await loadData<WebStory>(STORIES_PATH);
}

export async function getStoryBySlug(slug: string): Promise<WebStory | undefined> {
  const stories = await getStories();
  return stories.find(s => s.slug.toLowerCase() === slug.toLowerCase());
}

export async function saveStory(story: WebStory) {
  const stories = await getStories();
  const index = stories.findIndex(s => s.id === story.id);
  if (index > -1) stories[index] = story;
  else stories.push(story);
  await fastWrite(STORIES_PATH, stories);
}

export async function deleteStory(id: string) {
  const stories = await getStories();
  const filtered = stories.filter(s => s.id !== id);
  await fastWrite(STORIES_PATH, filtered);
}

export async function getPosts(): Promise<Post[]> {
  return await loadData<Post>(DB_PATH);
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const posts = await getPosts();
  return posts.find(p => p.slug.toLowerCase() === slug.toLowerCase());
}

export async function savePost(post: Post) {
  const posts = await getPosts();
  const index = posts.findIndex(p => p.id === post.id);
  const updatedPost = { ...post, lastModified: new Date().toISOString().split('T')[0] };
  if (index > -1) posts[index] = updatedPost;
  else posts.push(updatedPost);
  await fastWrite(DB_PATH, posts);
}

export async function deletePost(id: string) {
  const posts = await getPosts();
  const filtered = posts.filter(p => p.id !== id);
  await fastWrite(DB_PATH, filtered);
}

// AUTHORS
export async function getAuthors(): Promise<import('./types').AuthorProfile[]> {
  return await loadData<import('./types').AuthorProfile>(AUTHORS_PATH);
}

export async function getAuthorById(id: string): Promise<import('./types').AuthorProfile | undefined> {
  const authors = await getAuthors();
  return authors.find(a => a.id === id);
}

export async function saveAuthor(author: import('./types').AuthorProfile) {
  const authors = await getAuthors();
  const index = authors.findIndex(a => a.id === author.id);
  if (index > -1) authors[index] = author;
  else authors.push(author);
  await fastWrite(AUTHORS_PATH, authors);
}

export async function deleteAuthor(id: string) {
  const authors = await getAuthors();
  const filtered = authors.filter(a => a.id !== id);
  await fastWrite(AUTHORS_PATH, filtered);
}

// CATEGORIES
export async function getCategories(): Promise<import('./types').Category[]> {
  return await loadData<import('./types').Category>(CATEGORIES_PATH);
}

export async function getCategoryById(id: string): Promise<import('./types').Category | undefined> {
  const categories = await getCategories();
  return categories.find(c => c.id === id);
}

export async function saveCategory(category: import('./types').Category) {
  const categories = await getCategories();
  const index = categories.findIndex(c => c.id === category.id);
  if (index > -1) categories[index] = category;
  else categories.push(category);
  await fastWrite(CATEGORIES_PATH, categories);
}

export async function deleteCategory(id: string) {
  const categories = await getCategories();
  const filtered = categories.filter(c => c.id !== id);
  await fastWrite(CATEGORIES_PATH, filtered);
}
