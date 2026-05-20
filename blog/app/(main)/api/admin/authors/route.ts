import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthors, saveAuthor, deleteAuthor } from '@/lib/db';
import { isValidSession } from '@/app/(main)/api/auth/login/route';

async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  return isValidSession(token);
}

export async function GET() {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const authors = await getAuthors();
  return NextResponse.json(authors);
}

export async function POST(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const author = await request.json();
    if (!author || !author.id || !author.name) {
      return NextResponse.json({ error: 'Invalid author data' }, { status: 400 });
    }
    await saveAuthor(author);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save author' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!await checkAuth()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await deleteAuthor(id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete author' }, { status: 500 });
  }
}
