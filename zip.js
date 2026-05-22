import fs from 'fs';
import path from 'path';
import { ZipArchive } from 'archiver';

const output = fs.createWriteStream(path.join(process.cwd(), 'chatwiz_hostinger.zip'));
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
  'dist'
];

for (const dir of includeDirs) {
  if (fs.existsSync(dir)) {
    archive.directory(dir + '/', dir);
  }
}

// Add blog directory (excluding node_modules)
if (fs.existsSync('blog')) {
  archive.glob('blog/**', {
    dot: true,
    ignore: ['blog/node_modules/**', 'blog/.env.local', 'blog/.env']
  });
}

archive.finalize();
