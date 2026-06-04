# ============================================================
# Media Purge — WordPress.org SVN Deployment
# Usage: .\deploy-to-wporg.ps1
# 
# REQUIREMENTS:
#   - SVN must be installed (Apache Subversion)
#   - SVN credentials setup at https://profiles.wordpress.org/naqeeb026/profile/edit/group/3/?screen=svn-password
#   - Running with sufficient permissions
# ============================================================

$ErrorActionPreference = 'Stop'

# Read version from plugin header
$pluginFile = Join-Path $PSScriptRoot 'media-purge.php'
$versionLine = Select-String -Path $pluginFile -Pattern '^\s*\*\s*Version:\s*(.+)' | Select-Object -First 1
$version = $versionLine.Matches[0].Groups[1].Value.Trim()

$pluginSlug = 'media-purge'
$svnUrl = "https://plugins.svn.wordpress.org/$pluginSlug"
$tempSvn = Join-Path $env:TEMP "media-purge-svn-$([datetime]::UtcNow.Ticks)"
$wporgUser = "naqeeb026"

Write-Host "Media Purge SVN Deployment v$version" -ForegroundColor Cyan
Write-Host "=========================================`n"

# Step 1: Checkout SVN repo
Write-Host "1. Checking out SVN repository..." -ForegroundColor Yellow
if (-not (Get-Command svn -ErrorAction SilentlyContinue)) {
  Write-Host "ERROR: SVN not found. Please install Apache Subversion." -ForegroundColor Red
  Write-Host "Download from: https://subversion.apache.org/download.cgi" -ForegroundColor Yellow
  exit 1
}

& svn checkout "$svnUrl/trunk" "$tempSvn\trunk" --quiet
if ($LASTEXITCODE -ne 0) {
  Write-Host "FAILED to checkout SVN trunk" -ForegroundColor Red
  exit 1
}
Write-Host "   ✓ Checked out trunk/" -ForegroundColor Green

# Step 2: Copy plugin files to trunk
Write-Host "`n2. Copying plugin files to trunk..." -ForegroundColor Yellow

$filesToCopy = @(
  'admin/',
  'assets/',
  'includes/',
  'languages/',
  'scanner/',
  'media-purge.php',
  'readme.txt',
  'uninstall.php'
)

foreach ($file in $filesToCopy) {
  $src = Join-Path $PSScriptRoot $file
  $dest = Join-Path $tempSvn "trunk" $file
  
  if (Test-Path $src -PathType Container) {
    # Directory
    if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
    Copy-Item $src $dest -Recurse -Force
  } else {
    # File
    Copy-Item $src $dest -Force
  }
}

Write-Host "   ✓ Files copied" -ForegroundColor Green

# Step 3: SVN add all new files
Write-Host "`n3. Staging changes..." -ForegroundColor Yellow
Push-Location "$tempSvn\trunk"

$unversioned = & svn status | Where-Object { $_ -match '^\?' }
if ($unversioned) {
  $unversioned | ForEach-Object {
    $file = $_ -replace '^\?\s+', ''
    & svn add "$file" --quiet 2>$null
  }
}

Write-Host "   ✓ Changes staged" -ForegroundColor Green

# Step 4: SVN commit
Write-Host "`n4. Committing to WP.org SVN..." -ForegroundColor Yellow
Write-Host "   SVN User: $wporgUser" -ForegroundColor Cyan
Write-Host "   Version: $version" -ForegroundColor Cyan
Write-Host ""

$commitMsg = "Release version $version - See GitHub for changelog: https://github.com/NAQEEB26/media-purge/releases/tag/v$version"

& svn commit --username $wporgUser --message $commitMsg
$commitStatus = $LASTEXITCODE

Pop-Location

if ($commitStatus -ne 0) {
  Write-Host "`nERROR: SVN commit failed. Check your credentials and SVN access." -ForegroundColor Red
  Write-Host "Set up SVN credentials: https://profiles.wordpress.org/$wporgUser/profile/edit/group/3/?screen=svn-password" -ForegroundColor Yellow
  exit 1
}

Write-Host "`n   ✓ Committed to trunk/" -ForegroundColor Green

# Step 5: Create release tag
Write-Host "`n5. Creating release tag v$version..." -ForegroundColor Yellow

$tagUrl = "$svnUrl/tags/$version"
$copyMsg = "Tagging version $version"

# Use SVN copy to create the tag
& svn copy "$svnUrl/trunk" "$tagUrl" --username $wporgUser --message $copyMsg --quiet

if ($LASTEXITCODE -ne 0) {
  Write-Host "   ⚠ Tag creation may have failed, but trunk is deployed. Verify at: $svnUrl" -ForegroundColor Yellow
} else {
  Write-Host "   ✓ Tag created at tags/$version/" -ForegroundColor Green
}

# Cleanup
Remove-Item $tempSvn -Recurse -Force -ErrorAction SilentlyContinue

# Summary
Write-Host "`n=========================================`n" -ForegroundColor Cyan
Write-Host "✓ Deployment Complete!" -ForegroundColor Green
Write-Host "`nPlugin will appear on WordPress.org within minutes:" -ForegroundColor Cyan
Write-Host "  https://wordpress.org/plugins/$pluginSlug/" -ForegroundColor Yellow
Write-Host "`nMonitor updates:" -ForegroundColor Cyan
Write-Host "  https://make.wordpress.org/plugins" -ForegroundColor Yellow
Write-Host "`nGitHub Release:" -ForegroundColor Cyan
Write-Host "  https://github.com/NAQEEB26/$pluginSlug/releases/tag/v$version" -ForegroundColor Yellow
