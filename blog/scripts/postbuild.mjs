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

    // Copy public folder to standalone (Next.js does this but sometimes uploads are missed)
    await cp(join(process.cwd(), 'public'), join(standaloneDir, 'public'), { recursive: true });
    console.log('✅ Copied public to standalone');

  } catch (error) {
    console.error('⚠️ Post-build step skipped or failed:', error.message);
  }
}

postbuild();
