const fs = require('fs');
const glob = require('glob');

const navbarFiles = glob.sync('PB-Creative-Studio/apps/**/GlobalNavbar.jsx');
const footerFiles = glob.sync('PB-Creative-Studio/apps/**/GlobalFooter.jsx');
// Also Footer.tsx in tools
footerFiles.push('PB-Creative-Studio/apps/tools/src/components/Footer.tsx');

const fixNavbar = (content) => {
    let result = content;
    // Remove fake tools from toolsList
    result = result.replace(/{ label: 'Link Generator', page: 'whatsapp-link-generator'.*?},\s*/g, '');
    result = result.replace(/{ label: 'Direct Message', page: 'whatsapp-direct-message'.*?},\s*/g, '');
    result = result.replace(/{ label: 'Form Generator', page: 'whatsapp-form-generator'.*?},\s*/g, '');
    
    // Remove from toolPages
    result = result.replace(/'whatsapp-link-generator', 'whatsapp-direct-message', 'whatsapp-form-generator'/g, '');
    
    // Fix portalList terms and privacy
    result = result.replace(/page: 'terms'/g, "page: 'portal/terms-and-conditions'");
    result = result.replace(/page: 'privacy'/g, "page: 'portal/privacy-policy'");
    
    // Add getDevPath for portal pages
    if (!result.includes("page.startsWith('portal/')")) {
        result = result.replace("if (page === 'portal') {", "if (page.startsWith('portal/')) { window.location.href = getDevPath('/' + page); return; }\n    if (page === 'portal') {");
    }
    return result;
};

const fixFooter = (content) => {
    let result = content;
    // Remove fake tools from links
    result = result.replace(/{ label: "Link Generator", page: "whatsapp-link-generator" },\s*/g, '');
    result = result.replace(/{ label: "Direct Message", page: "whatsapp-direct-message" },\s*/g, '');
    result = result.replace(/{ label: "Form Generator", page: "whatsapp-form-generator" },\s*/g, '');
    
    // Fix Support / Portal terms and privacy pages
    result = result.replace(/{ label: "Privacy Policy", page: "privacy" }/g, '{ label: "Privacy Policy", page: "privacy-policy" }');
    result = result.replace(/{ label: "Terms of Service", page: "terms" }/g, '{ label: "Terms of Service", page: "terms-of-service" }');

    // Add getDevPath for portal pages
    if (!result.includes("page.startsWith('portal/')")) {
        result = result.replace("if (page === 'portal') {", "if (page.startsWith('portal/')) { window.location.href = getDevPath('/' + page); return; }\n    if (page === 'portal') {");
    }
    return result;
};

navbarFiles.forEach(f => {
    if(fs.existsSync(f)) {
        console.log('Fixing Navbar:', f);
        fs.writeFileSync(f, fixNavbar(fs.readFileSync(f, 'utf8')));
    }
});

footerFiles.forEach(f => {
    if(fs.existsSync(f)) {
        console.log('Fixing Footer:', f);
        fs.writeFileSync(f, fixFooter(fs.readFileSync(f, 'utf8')));
    }
});

// Also fix Home.tsx to remove fake tools
const homeTsx = 'PB-Creative-Studio/apps/tools/src/pages/Home.tsx';
if (fs.existsSync(homeTsx)) {
    let home = fs.readFileSync(homeTsx, 'utf8');
    home = home.replace(/\s*{\s*path: '\/trading-consistency-calculator'[\s\S]*?tag: 'Simulation'\s*},/, '');
    home = home.replace(/\s*{\s*path: '\/emi-calculator'[\s\S]*?icon: Calculator\s*},/, '');
    home = home.replace(/\s*{\s*path: '\/gst-calculator'[\s\S]*?icon: Receipt\s*}/, '');
    fs.writeFileSync(homeTsx, home);
    console.log('Fixed Home.tsx');
}
