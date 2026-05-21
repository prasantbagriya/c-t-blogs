import { mkdir, rm, readdir, chmod } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

async function fixPermissions(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      try {
        if (entry.isDirectory()) {
          // Explicitly set 755 for directories so Next.js can scan them
          await chmod(fullPath, 0o755);
          await fixPermissions(fullPath);
        } else {
          // 644 for files
          await chmod(fullPath, 0o644);
        }
      } catch (err) {
        // Silently skip if locked
      }
    }
  } catch (error) {
    console.error(`⚠️ Permission fix skipped for ${dir}`);
  }
}

async function setup() {
  // ✅ CLEANUP: Remove old .next folder
  const nextFolder = join(process.cwd(), '.next');
  if (existsSync(nextFolder)) {
    try {
      console.log('🧹 Clearing build cache (.next)...');
      await rm(nextFolder, { recursive: true, force: true });
    } catch (err) {}
  }

  const dirs = [
    join(process.cwd(), 'data'),
    join(process.cwd(), 'public', 'uploads')
  ];

  for (const dir of dirs) {
    try {
      await mkdir(dir, { recursive: true });
    } catch (error) {}
  }

  // ✅ CRITICAL: Fix permissions for app/ directory to prevent EACCES during build
  console.log('🔒 Resetting permissions for app/ directory...');
  const appDir = join(process.cwd(), 'app');
  if (existsSync(appDir)) {
    await chmod(appDir, 0o755);
    await fixPermissions(appDir);
  }
  
  console.log('🚀 Pre-build setup complete');
}

setup();
