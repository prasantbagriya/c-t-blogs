import fs from 'fs';
import path from 'path';
import { ZipArchive } from 'archiver';

const output = fs.createWriteStream(path.join(process.cwd(), 'chatwiz_upload_lite.zip'));
const archive = new ZipArchive({
  zlib: { level: 9 } // Sets the compression level.
});

output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('Archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

// Add the files and directories needed for production
const includeFiles = [
  'package.json',
  'package-lock.json',
  'app.js',
  'server.cjs',
  'blog-state.js',
  '.env'
];

for (const file of includeFiles) {
  if (fs.existsSync(file)) {
    archive.file(file, { name: file });
  }
}

// Add directories
const includeDirs = [
  'server',
  'dist',
  'shims'
];

for (const dir of includeDirs) {
  if (fs.existsSync(dir)) {
    archive.directory(dir + '/', dir);
  }
}

// Add blog directory (excluding node_modules and cache)
if (fs.existsSync('blog')) {
  archive.glob('blog/**', {
    dot: true,
    ignore: [
      'blog/node_modules/**', 
      'blog/.env.local', 
      'blog/.env',
      'blog/.next/cache/**'
    ]
  });
}

// Add PB-Creative-Studio directory (excluding node_modules and caches)
if (fs.existsSync('PB-Creative-Studio')) {
  archive.glob('PB-Creative-Studio/**', {
    dot: true,
    ignore: [
      'PB-Creative-Studio/node_modules/**', 
      'PB-Creative-Studio/**/node_modules/**',
      'PB-Creative-Studio/**/.next/cache/**'
    ]
  });
}

// Add Playbook directory (excluding node_modules)
if (fs.existsSync('Playbook')) {
  archive.glob('Playbook/**', {
    dot: true,
    ignore: [
      'Playbook/node_modules/**'
    ]
  });
}

archive.finalize();
