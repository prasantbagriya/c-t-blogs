const fs = require('fs');
let file = 'Playbook/src/components/GlobalNavbar.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  /<button className=`flex items-center gap-1\.5 text-sm font-medium text-gray-400 hover:text-white transition-colors py-4`>\s*Playbook <ChevronDown/g,
  '<button className={`flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white transition-colors py-4`}>Company <ChevronDown'
);
content = content.replace(
  /\{\[[\s\S]*?\{\s*label:\s*'Admin Portal'[\s\S]*?\}\]\.map\(comp => \(/g,
  '{companyList.map(comp => ('
);

// Also replace the old navLinks with the standardized ones, to fix Playbook duplicate completely.
content = content.replace(
  /const navLinks = \[\s*\{\s*label:\s*'Blog'.*?\s*\]/s,
  `const navLinks = [
    { label: 'ChatWizs Home', page: 'landing' },
    { label: 'Blog', page: 'blog' },
    { label: 'Playbook', page: 'playbook' },
    { label: 'Exam Portal', page: 'portal' }
  ]`
);

fs.writeFileSync(file, content);
