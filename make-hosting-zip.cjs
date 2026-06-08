/**
 * make-hosting-zip.cjs
 * Ultra-Lite Hosting ZIP - Sirf Production files
 * Run: node make-hosting-zip.cjs
 * Uses archiver v8 ZipArchive API
 */

const fs = require('fs');
const path = require('path');
const { ZipArchive } = require('archiver');

const OUTPUT_ZIP = path.join(process.cwd(), 'chatwiz_upload_lite.zip');

// Agar pehle se zip hai toh delete karo
if (fs.existsSync(OUTPUT_ZIP)) {
  fs.unlinkSync(OUTPUT_ZIP);
  console.log('Purani zip delete ki.');
}

const output = fs.createWriteStream(OUTPUT_ZIP);
const archive = new ZipArchive({ zlib: { level: 9 } });

output.on('close', function () {
  const mb = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log('\n✅ ZIP READY!');
  console.log(`📦 File: chatwiz_upload_lite.zip`);
  console.log(`📏 Size: ${mb} MB`);
  console.log(`\n👉 Ab ise Hostinger File Manager mein upload karo.`);
});

archive.on('error', function (err) {
  console.error('❌ Error:', err);
  throw err;
});

archive.pipe(output);
console.log('⏳ Packaging chal raha hai...\n');

// ─────────────────────────────────────────────
// 1. ROOT - Main frontend build (dist/)
// ─────────────────────────────────────────────
if (fs.existsSync('dist')) {
  archive.directory('dist/', 'dist');
  console.log('✓ dist/ added');
}

// ─────────────────────────────────────────────
// 2. SERVER - Backend files (no node_modules)
// ─────────────────────────────────────────────
if (fs.existsSync('server')) {
  archive.glob('server/**/*', {
    dot: true,
    ignore: [
      'server/node_modules/**',
      'server/uploads/**',
      'server/**/*.log',
    ]
  });
  console.log('✓ server/ added');
}

// ─────────────────────────────────────────────
// 3. ROOT Files - Zaruri config files
// ─────────────────────────────────────────────
const rootFiles = [
  'package.json',
  'server.cjs',
  'app.js',
  '.htaccess',
  'blog-state.js',
];

rootFiles.forEach(file => {
  if (fs.existsSync(file)) {
    archive.file(file, { name: file });
    console.log(`✓ ${file} added`);
  }
});

// ─────────────────────────────────────────────
// 4. BLOG - Next.js standalone build only
// ─────────────────────────────────────────────
if (fs.existsSync('blog/.next/standalone')) {
  archive.glob('blog/.next/standalone/**/*', {
    dot: true,
    ignore: ['**/*.map']
  });
  console.log('✓ blog/.next/standalone/ added');
}

// Next.js static files MUST be inside standalone/.next/static to work properly
if (fs.existsSync('blog/.next/static')) {
  archive.directory('blog/.next/static/', 'blog/.next/standalone/.next/static');
  console.log('✓ blog/.next/static/ added (mapped to standalone/.next/static)');
}

if (fs.existsSync('blog/public')) {
  archive.directory('blog/public/', 'blog/public');
  console.log('✓ blog/public/ added');
}

if (fs.existsSync('blog/data')) {
  archive.directory('blog/data/', 'blog/data');
  console.log('✓ blog/data/ added');
}

['blog/package.json', 'blog/.env.local', 'blog/next.config.js'].forEach(f => {
  if (fs.existsSync(f)) {
    archive.file(f, { name: f });
    console.log(`✓ ${f} added`);
  }
});

// ─────────────────────────────────────────────
// 5. PB-Creative-Studio - Built apps only
// ─────────────────────────────────────────────
if (fs.existsSync('PB-Creative-Studio')) {
  archive.glob('PB-Creative-Studio/**/*', {
    dot: true,
    ignore: [
      'PB-Creative-Studio/node_modules/**',
      'PB-Creative-Studio/**/node_modules/**',
      'PB-Creative-Studio/**/src/**',
      'PB-Creative-Studio/**/.next/cache/**',
      'PB-Creative-Studio/**/*.map',
      'PB-Creative-Studio/**/*.log',
    ]
  });
  console.log('✓ PB-Creative-Studio/ added (node_modules excluded)');
}

// ─────────────────────────────────────────────
// 5.5 Playbook - Built React App
// ─────────────────────────────────────────────
if (fs.existsSync('Playbook/dist')) {
  archive.directory('Playbook/dist/', 'Playbook/dist');
  console.log('✓ Playbook/dist/ added');
}

// ─────────────────────────────────────────────
// 6. Leads Manager
// ─────────────────────────────────────────────
if (fs.existsSync('leads-manager')) {
  archive.glob('leads-manager/**/*', {
    ignore: [
      'leads-manager/node_modules/**',
      'leads-manager/src/**',
    ]
  });
  console.log('✓ leads-manager/ added');
}

// ─────────────────────────────────────────────
archive.finalize();
