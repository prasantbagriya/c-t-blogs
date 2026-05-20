import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getStories, saveStory, deleteStory } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { isValidSession } from '@/app/(main)/api/auth/login/route';

// ✅ Secure checkAuth: validates cryptographic session token
async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  return isValidSession(token);
}

export async function GET() {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const stories = await getStories();
  return NextResponse.json(stories);
}

export async function POST(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const story = await request.json();
    if (!story || !story.id || !story.title) {
      return NextResponse.json({ error: 'Invalid story data' }, { status: 400 });
    }
    await saveStory(story);
    revalidatePath('/stories');
    revalidatePath('/');
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save story' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await deleteStory(id);
    revalidatePath('/admin/stories');
    revalidatePath('/stories');
    revalidatePath('/');

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 });
  }
}
