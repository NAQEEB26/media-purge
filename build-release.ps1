# ============================================================
# Media Purge — WP.org Release Zip Builder
# Usage: .\build-release.ps1
# Output: media-purge-x.x.x.zip in the parent directory
# ============================================================

$ErrorActionPreference = 'Stop'

# Read version from plugin header
$pluginFile = Join-Path $PSScriptRoot 'media-purge.php'
$versionLine = Select-String -Path $pluginFile -Pattern '^\s*\*\s*Version:\s*(.+)' | Select-Object -First 1
$version = $versionLine.Matches[0].Groups[1].Value.Trim()

$pluginSlug = 'media-purge'
$buildDir   = Join-Path $env:TEMP "$pluginSlug"
$outZip     = Join-Path (Split-Path $PSScriptRoot -Parent) "$pluginSlug-$version.zip"

Write-Host "Building Media Purge v$version ..." -ForegroundColor Cyan

# Clean previous build temp
if (Test-Path $buildDir) { Remove-Item $buildDir -Recurse -Force }
New-Item -ItemType Directory -Path "$buildDir\$pluginSlug" | Out-Null

# Files/dirs to EXCLUDE from the release zip (dev-only)
$excludePatterns = @(
    '\.git',
    '\.gitignore',
    '\.gitattributes',
    '\.claude',
    '\.qodo',
    '\.vscode',
    '\.cursor',
    '\.DS_Store',
    'Thumbs\.db',
    'node_modules',
    'build-release\.ps1',
    '\.map$'
)

# Copy all tracked plugin files, skipping excluded patterns
$files = git -C $PSScriptRoot ls-files
foreach ($file in $files) {
    $skip = $false
    foreach ($pattern in $excludePatterns) {
        if ($file -match $pattern) { $skip = $true; break }
    }
    if ($skip) { continue }

    $src  = Join-Path $PSScriptRoot $file
    $dest = Join-Path "$buildDir\$pluginSlug" $file
    $destDir = Split-Path $dest -Parent
    if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir | Out-Null }
    Copy-Item $src $dest -Force
}

# Remove old zip if exists
if (Test-Path $outZip) { Remove-Item $outZip -Force }

# Create zip
Compress-Archive -Path "$buildDir\$pluginSlug" -DestinationPath $outZip
Remove-Item $buildDir -Recurse -Force

Write-Host ""
Write-Host "Done! Release zip created:" -ForegroundColor Green
Write-Host "  $outZip" -ForegroundColor Yellow
Write-Host ""
Write-Host "Submit this zip to: https://wordpress.org/plugins/developers/add/" -ForegroundColor Cyan
