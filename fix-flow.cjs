const fs = require('fs');

const file = 'src/components/FlowBuilderView.tsx';
if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');

    // Replacements
    content = content.replace("z-[100]", "z-100");
    content = content.replace("bg-gradient-to-r", "bg-linear-to-r"); // First occurence (line 626)
    content = content.replace("bg-gradient-to-r", "bg-linear-to-r"); // Second occurence (line 856)
    content = content.replace("z-[9999]", "z-9999");
    content = content.replace("z-[100]", "z-100"); // Second occurence (line 1047)
    
    // h-[1px] replacements
    content = content.replace("className=\"h-[1px]", "className=\"h-px");
    content = content.replace("className=\"h-[1px]", "className=\"h-px");
    content = content.replace("className=\"h-[1px]", "className=\"h-px");
    content = content.replace("className=\"h-[1px]", "className=\"h-px");
    content = content.replace("className=\"h-[1px]", "className=\"h-px");
    content = content.replace("className=\"h-[1px]", "className=\"h-px");
    content = content.replace("className=\"h-[1px]", "className=\"h-px");

    // Line 1482
    content = content.replace("!bg-white dark:!bg-[#1a1a24] !border-slate-200 dark:!border-white/10 !rounded-xl", "bg-white! dark:bg-[#1a1a24]! border-slate-200! dark:border-white/10! rounded-xl!");
    
    // Line 1487
    content = content.replace("!rounded-2xl !border-slate-200 dark:!border-white/10 !bg-white/80 dark:!bg-[#13131a]/80 !backdrop-blur-xl sm:!block", "rounded-2xl! border-slate-200! dark:border-white/10! bg-white/80! dark:bg-[#13131a]/80! backdrop-blur-xl! sm:block!");

    fs.writeFileSync(file, content);
    console.log('Fixed FlowBuilderView.tsx');
} else {
    console.log('FlowBuilderView.tsx not found!');
}
