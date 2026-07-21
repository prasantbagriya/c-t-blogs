import { cp, mkdir } from 'fs/promises';
import { join } from 'path';

async function postbuild() {
  const standaloneDir = join(process.cwd(), '.next', 'standalone');
  
  try {
    // Ensure standalone directory exists (it might not if build failed)
    await mkdir(standaloneDir, { recursive: true });

    // Copy data folder to standalone
    await cp(join(process.cwd(), 'data'), join(standaloneDir, 'data'), { recursive: true });
    console.log('✅ Copied data to standalone');

    // Copy public folder to standalone
    await cp(join(process.cwd(), 'public'), join(standaloneDir, 'public'), { recursive: true });
    console.log('✅ Copied public to standalone');

    // CRITICAL: Copy .next/static to standalone/.next/static
    // Without this, Next.js standalone server won't serve CSS (broken design) or JS (broken interactivity)
    await cp(join(process.cwd(), '.next', 'static'), join(standaloneDir, '.next', 'static'), { recursive: true });
    console.log('✅ Copied .next/static to standalone');

  } catch (error) {
    console.error('⚠️ Post-build step skipped or failed:', error.message);
  }
}

postbuild();
