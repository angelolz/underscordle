# Create static directory structures
New-Item -ItemType Directory -Force -Path "static/assets"

# Remove existing links/folders if they exist to prevent mklink failures
if (Test-Path "static/assets/art") {
    Remove-Item -Recurse -Force "static/assets/art"
}
if (Test-Path "static/challenges") {
    Remove-Item -Recurse -Force "static/challenges"
}

# Create Junctions
cmd /c mklink /j static\assets\art out\covers
cmd /c mklink /j static\challenges out\dailies

# Copy metadata manifests
if (Test-Path "out/data/songs.json") {
    Copy-Item "out/data/songs.json" "static/assets/songs.json"
}
if (Test-Path "out/data/covers.json") {
    Copy-Item "out/data/covers.json" "static/assets/covers.json"
}

Write-Host "Local assets successfully linked!" -ForegroundColor Green
