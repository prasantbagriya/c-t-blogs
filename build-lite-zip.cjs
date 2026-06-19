const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const output = fs.createWriteStream(path.join(process.cwd(), 'chatwiz_upload_lite.zip'));
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', function() {
  console.log('Zip created successfully. Total bytes: ' + archive.pointer());
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

console.log('Packaging lightweight deployment for Hostinger...');

const ignoreRules = [
    '**/node_modules/**', 
    '**/.git/**', 
    '**/.next/cache/**',
    '**/src/**',
    '**/public/**',
    'PB-Creative-Studio/node_modules/**',
    'blog/node_modules/**',
    'blog/.next/cache/**',
    'blog/app/**',
    'blog/components/**',
    '*.zip'
];

archive.glob('dist/**', { ignore: ignoreRules });
archive.glob('Playbook/dist/**', { ignore: ignoreRules });
archive.glob('server/**', { ignore: ignoreRules });
archive.glob('blog/.next/standalone/**', { ignore: ignoreRules });
archive.glob('blog/public/**', { ignore: ignoreRules });
archive.glob('blog/data/**', { ignore: ignoreRules });
archive.glob('PB-Creative-Studio/**', { ignore: ignoreRules });
archive.glob('leads-manager/**', { ignore: ignoreRules });
archive.glob('shims/**', { ignore: ignoreRules });

const rootFiles = [
    'package.json',
    'app.js',
    'server.cjs',
    '.htaccess',
    '.env',
    'blog-state.js'
];

rootFiles.forEach(file => {
    if (fs.existsSync(file)) {
        archive.file(file, { name: file });
    }
});

const blogFiles = [
    'blog/package.json',
    'blog/.env.local',
    'blog/server.js'
];

blogFiles.forEach(file => {
    if (fs.existsSync(file)) {
        archive.file(file, { name: file });
    }
});

archive.finalize();
