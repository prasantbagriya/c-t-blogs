import fs from 'fs';
import path from 'path';

const REPLACEMENTS = {
  navLinks: `  const navLinks = [
    { label: 'Blog', page: 'blog' },
    { label: 'ChatWizs', page: 'landing' },
    { label: 'Playbook', page: 'playbook' }
  ]`,
  
  toolsList: `  const toolsList = [
    { label: 'Link Generator', page: 'whatsapp-link-generator', icon: LinkIcon, color: 'text-blue-400' },
    { label: 'Direct Message', page: 'whatsapp-direct-message', icon: MessageSquare, color: 'text-blue-400' },
    { label: 'Form Generator', page: 'whatsapp-form-generator', icon: FileText, color: 'text-emerald-400' },
    { label: 'SIP Calculator', page: 'sip-calculator', icon: Activity, color: 'text-purple-400' },
    { label: 'Compound Growth', page: 'compound-interest', icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Prop Firm Calc', page: 'prop-firm', icon: Terminal, color: 'text-indigo-400' },
    { label: 'YouTube Downloader', page: 'youtubevideodownload', icon: Video, color: 'text-red-400' },
    { label: 'Exam Portal', page: 'portal', icon: GraduationCap, color: 'text-indigo-400' }
  ]`,
  
  companyList: `  const companyList = [
    { label: 'About Us', page: 'about' },
    { label: 'Contact Us', page: 'contact' },
    { label: 'Terms of Service', page: 'terms' },
    { label: 'Privacy Policy', page: 'privacy' }
  ]`,
  
  portalList: `  const portalList = [
    { label: 'About Us', page: 'about' },
    { label: 'Contact Us', page: 'contact' },
    { label: 'Terms of Service', page: 'terms' },
    { label: 'Privacy Policy', page: 'privacy' }
  ]`
};

function updateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('Skipping missing file:', filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace navLinks block
  content = content.replace(/const navLinks = \[\s*[\s\S]*?\s*\]/, REPLACEMENTS.navLinks);
  
  // Replace toolsList block
  content = content.replace(/const toolsList = \[\s*[\s\S]*?\s*\]/, REPLACEMENTS.toolsList);
  
  // Replace companyList block
  if (content.includes('const companyList = [')) {
    content = content.replace(/const companyList = \[\s*[\s\S]*?\s*\]/, REPLACEMENTS.companyList);
  }
  
  // Replace portalList block
  if (content.includes('const portalList = [')) {
    content = content.replace(/const portalList = \[\s*[\s\S]*?\s*\]/, REPLACEMENTS.portalList);
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', filePath);
}

const filesToUpdate = [
  'Playbook/src/components/GlobalNavbar.tsx',
  'blog/components/GlobalNavbar.tsx',
  'PB-Creative-Studio/apps/exam-pro/frontend/src/components/GlobalNavbar.jsx',
  'PB-Creative-Studio/apps/downloader/src/components/GlobalNavbar.jsx',
  'PB-Creative-Studio/apps/tools/src/components/GlobalNavbar.jsx'
];

filesToUpdate.forEach(f => updateFile(path.resolve(f)));
