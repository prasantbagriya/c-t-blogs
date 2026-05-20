# ChatWizs Full Production Zip Creator (With User Data)
# This version INCLUDES db.json files as requested by the user

$scriptPath = $PSScriptRoot
$rootPath = Resolve-Path "$scriptPath\.."
$zipName = "chatwiz-full-production-latest.zip"
$zipPath = Join-Path $rootPath.Path ".\$zipName"

Write-Host "-----------------------------------------------"
Write-Host "Creating FULL PRODUCTION ZIP (Including DB)..."
Write-Host "-----------------------------------------------"

# 1. Build latest changes
Set-Location $rootPath.Path
Write-Host "Building latest frontend..."
npm run build

# 2. Define Include List (Including all DB files)
$includeList = @(
    "dist",
    "server",
    "public",
    "leads-manager",
    "package.json",
    "package-lock.json",
    "app.js",
    ".env.example",
    ".htaccess",
    "oauth.php",
    "server/db.json",
    "server/whatsapp_db.json",
    "server/instagram_db.json",
    "server/flows_db.json"
)

# 3. Filter Include List
$validIncludes = @()
foreach ($item in $includeList) {
    if (Test-Path (Join-Path $rootPath.Path $item)) {
        $validIncludes += $item
    }
}

# 4. Remove old zip if exists
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

# 5. Create Archive
Write-Host "Zipping files for production (Including User Data)..."
tar.exe -a -c -f $zipName $validIncludes

Write-Host "-----------------------------------------------"
Write-Host "Success! Final file: $zipName"
Write-Host "Includes latest users and build fixes."
Write-Host "-----------------------------------------------"
