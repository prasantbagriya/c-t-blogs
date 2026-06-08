const fs = require('fs');

const footerContent = fs.readFileSync('PB-Creative-Studio/apps/tools/src/components/GlobalFooter.jsx', 'utf8');
fs.writeFileSync('blog/components/GlobalFooter.tsx', '// @ts-nocheck\n"use client"\n' + footerContent);

const navContent = fs.readFileSync('PB-Creative-Studio/apps/tools/src/components/GlobalNavbar.jsx', 'utf8');
fs.writeFileSync('blog/components/GlobalNavbar.tsx', '// @ts-nocheck\n"use client"\n' + navContent);
