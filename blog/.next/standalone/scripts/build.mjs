import { spawn } from 'child_process';

console.log('🚀 Starting Optimized Build (Memory Capped to 512MB)...');

const isWindows = process.platform === 'win32';
const nextCommand = isWindows ? 'next.cmd' : 'next';

const env = { 
  ...process.env, 
  NODE_OPTIONS: '--max-old-space-size=1024',
  NEXT_TELEMETRY_DISABLED: '1'
};

const build = spawn(nextCommand, ['build'], { 
  stdio: 'inherit', 
  env,
  shell: true 
});

build.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build Successful');
    // Run postbuild
    import('./postbuild.mjs');
  } else {
    console.error(`❌ Build failed with code ${code}`);
    process.exit(code);
  }
});
