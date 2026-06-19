const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) files.push(...walk(full));
    else if (full.endsWith('.tsx') || full.endsWith('.ts')) files.push(full);
  }
  return files;
}

const allFiles = [...walk('app'), ...walk('components')];
let changed = 0;

for (const f of allFiles) {
  let content = fs.readFileSync(f, 'utf8');
  let lines = content.split('\n');
  let fileChanged = false;
  
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.includes('<Link ') && (l.includes('href="/"') || l.includes("href='/'") || l.includes('href="/about"') || l.includes('href="/contact"') || l.includes('href="/privacy"') || l.includes('href="/terms"') || l.includes('href="/editorial-policy"') || l.includes('href="/fact-checking-policy"'))) {
      lines[i] = l.replace(/<Link/g, '<a').replace(/<\/Link>/g, '</a>');
      fileChanged = true;
    }
  }
  
  if (fileChanged) {
    fs.writeFileSync(f, lines.join('\n'));
    changed++;
    console.log('Updated ' + f);
  }
}
console.log('Total files changed: ' + changed);
