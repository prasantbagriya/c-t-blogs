import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getPosts, savePost, deletePost } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { isValidSession } from '@/lib/auth';

export const dynamic = 'force-dynamic'; // ✅ Prevent Next.js static caching

// ✅ Secure checkAuth: validates cryptographic session token (not === 'true')
async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  return isValidSession(token);
}

export async function GET() {
  if (!await checkAuth()) {
    console.error('[API] /api/admin/posts - 401 Unauthorized. Token invalid or missing.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const posts = await getPosts();
    return NextResponse.json(posts);
  } catch (error) {
    console.error('[API] /api/admin/posts - Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const post = await request.json();
    if (!post || !post.id || !post.title) {
      return NextResponse.json({ error: 'Invalid post data' }, { status: 400 });
    }
    await savePost(post);
    revalidatePath('/blog');
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save post' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await deletePost(id);
    revalidatePath('/admin');
    revalidatePath('/blog');
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
