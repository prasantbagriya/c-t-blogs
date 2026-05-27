# ChatWizs All-In-One LITE Production Zip Creator
# Builds the main app and embedded Next.js blog, then packages only production essentials.

$ErrorActionPreference = "Stop"

$scriptPath = $PSScriptRoot
$rootPath = (Resolve-Path "$scriptPath\..").Path
$blogPath = Join-Path $rootPath "blog"
$stagePath = Join-Path $rootPath ".lite-package"
$zipName = "chatwiz_lite_final.zip"
$zipPath = Join-Path $rootPath $zipName

function Assert-Success($message) {
    if ($LASTEXITCODE -ne 0) {
        throw "$message failed with exit code $LASTEXITCODE"
    }
}

function Copy-Dir($source, $destination, $extraArgs = @()) {
    if (!(Test-Path $source)) { return }
    New-Item -ItemType Directory -Force -Path $destination | Out-Null
    robocopy $source $destination /MIR /NFL /NDL /NJH /NJS /nc /ns /np @extraArgs
    if ($LASTEXITCODE -gt 7) {
        throw "robocopy failed from $source to $destination with exit code $LASTEXITCODE"
    }
    $global:LASTEXITCODE = 0
}

Write-Host "-----------------------------------------------"
Write-Host "Creating ALL-IN-ONE LITE PRODUCTION ZIP..."
Write-Host "-----------------------------------------------"

if (!(Test-Path (Join-Path $blogPath "package.json"))) {
    throw "Blog folder not found at $blogPath"
}

Set-Location $rootPath
Write-Host "Step 1: Building frontend..."
npm run build
Assert-Success "Frontend build"

Write-Host "Step 2: Building embedded blog..."
Set-Location $blogPath
$localBlogBin = Join-Path $blogPath "node_modules\.bin"
$externalBlogBin = "F:\blogs\node_modules\.bin"
if (Test-Path $localBlogBin) {
    $env:Path = "$localBlogBin;$env:Path"
} elseif (Test-Path $externalBlogBin) {
    Write-Host "Copying existing F:\blogs dependencies into embedded blog..."
    $externalNodeModules = "F:\blogs\node_modules"
    $localNodeModules = Join-Path $blogPath "node_modules"
    if (Test-Path $localNodeModules) {
        $nodeModulesItem = Get-Item -LiteralPath $localNodeModules -Force
        if (($nodeModulesItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
            Remove-Item -LiteralPath $localNodeModules -Force
        }
    }
    Copy-Dir $externalNodeModules $localNodeModules @("/XD", ".cache", ".vite", "/XF", "*.log")
    $env:Path = "$localBlogBin;$env:Path"
} else {
    throw "Blog dependencies not found. Run npm install inside $blogPath before packaging."
}
npm run build
Assert-Success "Blog build"
Set-Location $rootPath

Write-Host "Step 3: Ensuring standalone image dependencies..."
if (Test-Path "$blogPath\node_modules\@img") {
    Copy-Dir "$blogPath\node_modules\@img" "$blogPath\.next\standalone\node_modules\@img"
}
if (Test-Path "$blogPath\node_modules\sharp") {
    Copy-Dir "$blogPath\node_modules\sharp" "$blogPath\.next\standalone\node_modules\sharp"
}

Write-Host "Step 4: Preparing clean package staging folder..."
if (Test-Path $stagePath) {
    $resolvedStage = (Resolve-Path $stagePath).Path
    if (!$resolvedStage.StartsWith($rootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to remove staging path outside workspace: $resolvedStage"
    }
    Remove-Item -LiteralPath $resolvedStage -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $stagePath | Out-Null

$dirExcludes = @("node_modules", ".git", ".next", ".turbo", "coverage")
$fileExcludes = @("*.zip", "*.log", "*.tsbuildinfo")

Copy-Dir "$rootPath\dist" "$stagePath\dist"
Copy-Dir "$rootPath\server" "$stagePath\server" @("/XD", "node_modules", ".git", "/XF", "*.log")
Copy-Dir "$rootPath\leads-manager" "$stagePath\leads-manager"
Copy-Dir "$rootPath\shims" "$stagePath\shims"
Copy-Dir "$rootPath\PB-Creative-Studio" "$stagePath\PB-Creative-Studio" @("/XD", $dirExcludes, "/XF", $fileExcludes)

Copy-Dir $blogPath "$stagePath\blog" @("/XD", $dirExcludes, "/XF", $fileExcludes)
Copy-Dir "$blogPath\.next\standalone" "$stagePath\blog\.next\standalone" @("/XD", ".git", "/XF", "*.log")
Copy-Dir "$blogPath\.next\static" "$stagePath\blog\.next\standalone\.next\static"
Copy-Dir "$blogPath\public" "$stagePath\blog\.next\standalone\public"

$files = @(
    "package.json",
    "package-lock.json",
    "server.cjs",
    "app.js",
    "blog-state.js",
    ".htaccess",
    ".env"
)

foreach ($file in $files) {
    $source = Join-Path $rootPath $file
    if (Test-Path $source) {
        Copy-Item -LiteralPath $source -Destination (Join-Path $stagePath $file) -Force
    }
}

if (Test-Path $zipPath) {
    Write-Host "Removing old zip..."
    Remove-Item -LiteralPath $zipPath -Force
}

Write-Host "Step 5: Creating zip archive..."
Set-Location $stagePath
$zipItems = Get-ChildItem -Path . -Force | Select-Object -ExpandProperty Name
& tar.exe -a -c -f $zipPath $zipItems
Assert-Success "Archive creation"
Set-Location $rootPath

Write-Host "Step 6: Cleaning staging folder..."
Remove-Item -LiteralPath $stagePath -Recurse -Force

Write-Host "-----------------------------------------------"
Write-Host "SUCCESS! Your All-In-One Lite Zip is ready: $zipPath"
Write-Host "-----------------------------------------------"
