# PowerShell script to perform global recursive replacement of strings in the project.

$ErrorActionPreference = "Stop"

$replacements = @(
    @{ Pattern = "https://prasantbagriya.online"; Replacement = "http://chatwizs.com" },
    @{ Pattern = "http://prasantbagriya.online"; Replacement = "http://chatwizs.com" },
    @{ Pattern = "prasantbagriya.online"; Replacement = "chatwizs.com" },
    @{ Pattern = "pb studio"; Replacement = "chatwizs studio" }
)

$excludePaths = @(
    "node_modules",
    "\.git",
    "\.codex-runtime",
    "scratch",
    "db\.json",
    "instagram_db\.json"
)

# Match these extensions or files
$allowedExtensions = @(".html", ".js", ".ts", ".jsx", ".tsx", ".css", ".txt", ".xml", ".json", ".yml", ".yaml", ".md", ".env")
$allowedFilenames = @(".env", ".env.example", ".env.local")

$targetDir = "e:\Prince Edu Hub\chatwiz-main"

Write-Host "Starting search and replace..."

# Find all files recursively
$allFiles = Get-ChildItem -Path $targetDir -Recurse -File

$files = $allFiles | Where-Object {
    $fullName = $_.FullName
    $ext = $_.Extension
    $name = $_.Name
    
    # Check if path is excluded
    $exclude = $false
    foreach ($pat in $excludePaths) {
        if ($fullName -match $pat) {
            $exclude = $true
            break
        }
    }
    
    if ($exclude) {
        return $false
    }
    
    # Check if extension or name is allowed
    if ($allowedExtensions -contains $ext -or $allowedFilenames -contains $name) {
        return $true
    }
    
    return $false
}

Write-Host "Found $($files.Count) files to process."

$modifiedCount = 0

foreach ($file in $files) {
    try {
        # Read the file content
        $content = [System.IO.File]::ReadAllText($file.FullName)
        
        $modified = $false
        $newContent = $content
        
        foreach ($rep in $replacements) {
            # Use regex replace with case-insensitivity
            if ($newContent -match "(?i)$([regex]::Escape($rep.Pattern))") {
                $newContent = [System.Text.RegularExpressions.Regex]::Replace($newContent, [regex]::Escape($rep.Pattern), $rep.Replacement, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
                $modified = $true
            }
        }
        
        if ($modified) {
            # Write back the modified content
            [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
            Write-Host "Modified: $($file.FullName)"
            $modifiedCount++
        }
    } catch {
        Write-Warning "Could not process file: $($file.FullName). Error: $_"
    }
}

Write-Host "Finished search and replace. Modified $modifiedCount files."
