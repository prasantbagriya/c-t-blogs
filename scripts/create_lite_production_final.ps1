# ChatWizs LITE Production Zip Creator
# optimized for fast deployment

$scriptPath = $PSScriptRoot
$rootPath = Resolve-Path "$scriptPath\.."
$zipName = "chatwiz-lite-production-latest.zip"
$zipPath = Join-Path $rootPath.Path ".\$zipName"

Write-Host "-----------------------------------------------"
Write-Host "Creating ULTIMATE LITE PRODUCTION ZIP..."
Write-Host "-----------------------------------------------"

# 1. Build latest changes
Set-Location $rootPath.Path
Write-Host "Step 1: Building frontend build (npm run build)..."
npm run build

# 2. Define Include List (Only Essentials)
$includeList = @(
    "dist",
    "server",
    "package.json",
    "package-lock.json",
    "app.js",
    ".htaccess"
)

# 3. Filter Include List
$validIncludes = @()
foreach ($item in $includeList) {
    if (Test-Path (Join-Path $rootPath.Path $item)) {
        $validIncludes += $item
    }
}

# 4. Remove old zip if exists
if (Test-Path $zipPath) { 
    Write-Host "Removing old zip..."
    Remove-Item $zipPath -Force 
}

# 5. Create Archive
Write-Host "Step 2: Zipping essential files..."
tar.exe -a -c -f $zipName $validIncludes

Write-Host "-----------------------------------------------"
Write-Host "SUCCESS! Your Lite Zip is ready: $zipName"
Write-Host "Size is minimized for fast upload."
Write-Host "-----------------------------------------------"
