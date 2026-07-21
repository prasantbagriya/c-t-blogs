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

// Define explicit ignore patterns to prevent ignoring blog/.next/standalone/node_modules
const ignorePatterns = [
  // 'node_modules/**', // Removed because it matched standalone's node_modules too!
  'blog/node_modules/**',
  'PB-Creative-Studio/node_modules/**',
  'PB-Creative-Studio/apps/exam-pro/backend/node_modules/**',
  'PB-Creative-Studio/apps/exam-pro/frontend/node_modules/**',
  'PB-Creative-Studio/apps/homepage/node_modules/**',
  'PB-Creative-Studio/apps/studio-hub/node_modules/**',
  'PB-Creative-Studio/apps/tools/node_modules/**',
  'Playbook/node_modules/**',
  '**/.git/**',
  '**/.next/cache/**',
  '**/uploads/**',
  '**/yt-dlp*',
  '**/.codex-runtime/**',
  'chatwiz_upload_lite.zip',
  'test_hostinger.js',
  'list_methods.js'
];

// Add the root files needed for production
const includeFiles = [
  'package.json',
  'package-lock.json',
  'app.js',
  'server.cjs',
  'blog-state.js',
  '.htaccess',
  '.env'
];

for (const file of includeFiles) {
  if (fs.existsSync(file)) {
    archive.file(file, { name: file });
  }
}

// Add directories using glob with robust ignore patterns
const directoriesToGlob = [
  'server',
  'dist',
  'shims',
  'blog',
  'PB-Creative-Studio',
  'Playbook'
];

for (const dir of directoriesToGlob) {
  if (fs.existsSync(dir)) {
    archive.glob(`${dir}/**`, {
      dot: true,
      ignore: ignorePatterns
    });
  }
}

archive.finalize();
