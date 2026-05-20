import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { getPosts, getStories, getAuthors } from '@/lib/db';

export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    // Check if directory exists
    try {
      await fs.access(uploadsDir);
    } catch {
      return NextResponse.json([]); // No uploads directory
    }

    const files = await fs.readdir(uploadsDir);
    
    // Load all data sources once
    const posts = await getPosts();
    const stories = await getStories();
    const authors = await getAuthors();

    const mediaItems = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(uploadsDir, filename);
        const stats = await fs.stat(filePath);
        
        // Skip directories
        if (!stats.isFile()) return null;

        const url = `/uploads/${filename}`;
        const usedIn: { type: string; title: string; id: string; editUrl: string }[] = [];

        // Check Posts
        posts.forEach(post => {
          if (
            post.coverImage?.includes(url) || 
            post.authorImage?.includes(url) || 
            post.content?.includes(url)
          ) {
            usedIn.push({
              type: 'Post',
              title: post.title,
              id: post.id,
              editUrl: `/admin/edit/${post.id}`
            });
          }
        });

        // Check Stories
        stories.forEach(story => {
          let usedInStory = false;
          if (story.posterImage?.includes(url) || story.squarePoster?.includes(url) || story.publisherLogo?.includes(url)) {
            usedInStory = true;
          } else {
            for (const slide of story.slides) {
              if (slide.image?.includes(url)) {
                usedInStory = true;
                break;
              }
            }
          }

          if (usedInStory) {
            usedIn.push({
              type: 'Web Story',
              title: story.title,
              id: story.id,
              editUrl: `/admin/stories/edit/${story.id}`
            });
          }
        });

        // Check Authors
        authors.forEach(author => {
          if (author.image?.includes(url)) {
            usedIn.push({
              type: 'Author Profile',
              title: author.name,
              id: author.id,
              editUrl: `/admin/authors/edit/${author.id}`
            });
          }
        });

        return {
          id: filename,
          name: filename,
          url,
          sizeBytes: stats.size,
          createdAt: stats.birthtimeMs || stats.ctimeMs,
          usedIn
        };
      })
    );

    const validItems = mediaItems.filter(Boolean).sort((a, b) => b!.createdAt - a!.createdAt);
    return NextResponse.json(validItems);
  } catch (error) {
    console.error('Media Library API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('filename');
    if (!filename) return NextResponse.json({ error: 'Filename is required' }, { status: 400 });

    const filePath = path.join(process.cwd(), 'public', 'uploads', path.basename(filename));
    
    // Prevent directory traversal
    if (!filePath.startsWith(path.join(process.cwd(), 'public', 'uploads'))) {
       return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Media delete error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const oldFilename = formData.get('oldFilename') as string;
    const file = formData.get('file') as File;

    if (!oldFilename || !file) {
      return NextResponse.json({ error: 'Missing oldFilename or file' }, { status: 400 });
    }

    // 1. Upload the new file
    const extension = path.extname(file.name).toLowerCase();
    const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const newFilename = 'media-' + uniqueSuffix + extension;
    const newUrl = `/uploads/${newFilename}`;
    const oldUrl = `/uploads/${oldFilename}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const newFilepath = path.join(uploadDir, newFilename);
    const oldFilepath = path.join(uploadDir, oldFilename);

    await fs.writeFile(newFilepath, buffer);

    // 2. Perform global replace in database files
    const dataDir = path.resolve(process.cwd(), 'data');
    const dbFiles = ['posts.json', 'stories.json', 'authors.json'];

    for (const dbFile of dbFiles) {
      const dbPath = path.join(dataDir, dbFile);
      try {
        const raw = await fs.readFile(dbPath, 'utf-8');
        if (raw.includes(oldUrl)) {
          // Replace all occurrences
          const updatedRaw = raw.split(oldUrl).join(newUrl);
          await fs.writeFile(dbPath, updatedRaw, 'utf-8');
        }
      } catch (e) {
        // Ignore if file doesn't exist
      }
    }

    // 3. Delete the old file
    if (path.relative(uploadDir, oldFilepath) && !path.relative(uploadDir, oldFilepath).startsWith('..')) {
      try {
        await fs.access(oldFilepath);
        await fs.unlink(oldFilepath);
      } catch {
        // old file might already be gone
      }
    }

    return NextResponse.json({ success: true, newUrl });
  } catch (error) {
    console.error('Media replace error:', error);
    return NextResponse.json({ error: 'Failed to replace file' }, { status: 500 });
  }
}

