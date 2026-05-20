'use server';

import { deletePost, deleteStory, savePost, saveStory, Post, getPosts, getStories } from './db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { writeFile, access, mkdir, unlink } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { activeSessions, SESSION_TTL, checkAdminAuth } from './auth';

// Helper to extract upload URLs starting with /uploads/ from any object
function getUploadUrls(obj: any): string[] {
  if (!obj) return [];
  const str = JSON.stringify(obj);
  const regex = /\/uploads\/[a-zA-Z0-9\.\-_]+/g;
  const matches = str.match(regex) || [];
  return Array.from(new Set(matches));
}

// Check if an upload URL is referenced in any other post or story
async function isUrlReferenced(url: string, excludeId?: string): Promise<boolean> {
  try {
    const posts = await getPosts();
    const stories = await getStories();

    for (const post of posts) {
      if (post.id === excludeId) continue;
      if (JSON.stringify(post).includes(url)) {
        return true;
      }
    }

    for (const story of stories) {
      if (story.id === excludeId) continue;
      if (JSON.stringify(story).includes(url)) {
        return true;
      }
    }
  } catch (error) {
    console.error('Error checking if URL is referenced elsewhere:', error);
  }
  return false;
}

// Safely delete an uploaded file from public/uploads
async function deleteUploadFile(fileUrl: string) {
  try {
    const filename = path.basename(fileUrl);
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const filepath = path.join(uploadDir, filename);

    // Prevent directory traversal
    const relative = path.relative(uploadDir, filepath);
    const isSafe = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    
    if (isSafe) {
      try {
        await access(filepath);
        await unlink(filepath);
        console.log(`Successfully deleted orphaned file: ${filepath}`);
      } catch (err: any) {
        if (err.code !== 'ENOENT') {
          console.error(`Failed to delete file ${filepath}:`, err);
        }
      }
    }
  } catch (error) {
    console.error(`Error deleting file for URL ${fileUrl}:`, error);
  }
}

export async function handleAdminLogin(password: string) {
  const masterPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (password === masterPassword) {
    const sessionToken = randomBytes(32).toString('hex');
    activeSessions.set(sessionToken, Date.now() + SESSION_TTL);

    const cookieStore = await cookies();
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    return { success: true };
  }
  return { success: false, error: 'Unauthorized' };
}

export async function handleSavePost(post: Post) {
  try {
    await checkAdminAuth(); // 🔒 Secure action with unified verification
    
    // Load the previous post version to compare and delete removed media
    const posts = await getPosts();
    const oldPost = posts.find(p => p.id === post.id);

    await savePost(post);

    if (oldPost) {
      const oldUrls = getUploadUrls(oldPost);
      const newUrls = getUploadUrls(post);
      const removedUrls = oldUrls.filter(url => !newUrls.includes(url));

      for (const url of removedUrls) {
        const referenced = await isUrlReferenced(url, post.id);
        if (!referenced) {
          await deleteUploadFile(url);
        }
      }
    }

    revalidatePath('/admin');
    revalidatePath('/blog');
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to save post:', error);
    return { success: false, error: error.message || 'Failed to save post' };
  }
}

export async function handleSaveStory(story: any) {
  try {
    await checkAdminAuth(); // 🔒 Secure action with unified verification
    
    // Load the previous story version to compare and delete removed media
    const stories = await getStories();
    const oldStory = stories.find(s => s.id === story.id);

    await saveStory(story);

    if (oldStory) {
      const oldUrls = getUploadUrls(oldStory);
      const newUrls = getUploadUrls(story);
      const removedUrls = oldUrls.filter(url => !newUrls.includes(url));

      for (const url of removedUrls) {
        const referenced = await isUrlReferenced(url, story.id);
        if (!referenced) {
          await deleteUploadFile(url);
        }
      }
    }

    revalidatePath('/admin/stories');
    revalidatePath('/stories');
    revalidatePath(`/stories/${story.slug}`);
    revalidatePath('/');
    return { success: true, story };
  } catch (error: any) {
    console.error('Failed to save story:', error);
    return { success: false, error: error.message || 'Failed to save story' };
  }
}

export async function handleDeletePost(id: string) {
  try {
    await checkAdminAuth(); // 🔒 Secure action with unified verification
    
    const posts = await getPosts();
    const postToDelete = posts.find(p => p.id === id);

    await deletePost(id);

    if (postToDelete) {
      const urls = getUploadUrls(postToDelete);
      for (const url of urls) {
        const referenced = await isUrlReferenced(url, id);
        if (!referenced) {
          await deleteUploadFile(url);
        }
      }
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete post:', error);
    return { success: false, error: error.message || 'Failed to delete post' };
  }
}

export async function handleDeleteStory(id: string) {
  try {
    await checkAdminAuth(); // 🔒 Secure action with unified verification
    
    const stories = await getStories();
    const storyToDelete = stories.find(s => s.id === id);

    await deleteStory(id);

    if (storyToDelete) {
      const urls = getUploadUrls(storyToDelete);
      for (const url of urls) {
        const referenced = await isUrlReferenced(url, id);
        if (!referenced) {
          await deleteUploadFile(url);
        }
      }
    }

    revalidatePath('/admin/stories');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete story:', error);
    return { success: false, error: error.message || 'Failed to delete story' };
  }
}

export async function handleUpload(formData: FormData) {
  try {
    await checkAdminAuth(); // 🔒 Secure action with unified verification
    
    const file = formData.get('file') as File | null;
    if (!file) {
      return { success: false, error: 'No file uploaded' };
    }

    // 🔒 Security: Validate file extension
    const extension = path.extname(file.name).toLowerCase();
    const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return { success: false, error: 'File type not allowed. Please upload images only.' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = 'media-' + uniqueSuffix + extension;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      await access(uploadDir);
    } catch {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/${filename}`;
    return { success: true, url: fileUrl };
  } catch (error: any) {
    console.error('Upload Error:', error);
    return { success: false, error: error.message || 'Upload failed' };
  }
}
