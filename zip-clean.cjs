const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const output = fs.createWriteStream(path.join(process.cwd(), 'chatwiz_hostinger_deploy.zip'));
const archive = new archiver.ZipArchive({
  zlib: { level: 9 }
});

output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('Archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

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

const includeDirs = ['server', 'dist', 'public', 'assets'];
for (const dir of includeDirs) {
  if (fs.existsSync(dir)) {
    archive.directory(dir + '/', dir);
  }
}

if (fs.existsSync('blog')) {
  archive.glob('blog/**', {
    dot: true,
    ignore: ['blog/node_modules/**', 'blog/.next/cache/**']
  });
}

if (fs.existsSync('PB-Creative-Studio')) {
  archive.glob('PB-Creative-Studio/**', {
    dot: true,
    ignore: ['PB-Creative-Studio/node_modules/**', 'PB-Creative-Studio/.next/**', 'PB-Creative-Studio/dist/**']
  });
}

if (fs.existsSync('Playbook')) {
  archive.glob('Playbook/**', {
    dot: true,
    ignore: ['Playbook/node_modules/**', 'Playbook/.next/**']
  });
}

archive.finalize();
