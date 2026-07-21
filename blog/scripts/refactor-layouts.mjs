import { renameSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import path from 'path';

const APP_DIR = path.resolve('app');
const MAIN_DIR = path.join(APP_DIR, '(main)');
const AMP_DIR = path.join(APP_DIR, '(amp)');

const itemsToMoveToMain = [
  'about', 'admin', 'api', 'auth', 'blog', 'category', 'contact', 
  'editorial-policy', 'fact-checking-policy', 'privacy', 'terms',
  'Copyright.tsx', 'globals.css', 'layout.tsx', 'not-found.tsx', 'page.tsx'
];

// Ensure target directories exist
if (!existsSync(MAIN_DIR)) mkdirSync(MAIN_DIR);
if (!existsSync(AMP_DIR)) mkdirSync(AMP_DIR);
if (!existsSync(path.join(AMP_DIR, 'stories'))) mkdirSync(path.join(AMP_DIR, 'stories'));

// Move index stories to main
const storiesIndexDir = path.join(MAIN_DIR, 'stories');
if (!existsSync(storiesIndexDir)) mkdirSync(storiesIndexDir);
if (existsSync(path.join(APP_DIR, 'stories', 'page.tsx'))) {
  renameSync(path.join(APP_DIR, 'stories', 'page.tsx'), path.join(storiesIndexDir, 'page.tsx'));
}

// Move individual stories to amp
if (existsSync(path.join(APP_DIR, 'stories', '[slug]'))) {
  renameSync(path.join(APP_DIR, 'stories', '[slug]'), path.join(AMP_DIR, 'stories', '[slug]'));
}

// Move stories layout to amp root layout
if (existsSync(path.join(APP_DIR, 'stories', 'layout.tsx'))) {
  renameSync(path.join(APP_DIR, 'stories', 'layout.tsx'), path.join(AMP_DIR, 'layout.tsx'));
}

// Move everything else to main
itemsToMoveToMain.forEach(item => {
  const src = path.join(APP_DIR, item);
  const dest = path.join(MAIN_DIR, item);
  if (existsSync(src)) {
    renameSync(src, dest);
    console.log(`Moved ${item} to (main)`);
  }
});

console.log('Refactor complete.');
