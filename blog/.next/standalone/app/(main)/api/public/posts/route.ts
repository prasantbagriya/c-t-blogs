import { NextResponse } from 'next/server';
import { getPosts } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const allPosts = await getPosts();
    const publishedPosts = allPosts
      .filter(p => p.published)
      .sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return allPosts.indexOf(b) - allPosts.indexOf(a);
      });
    return NextResponse.json(publishedPosts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
