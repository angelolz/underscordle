#!/bin/bash

# Create static directory structures
mkdir -p static/assets

# Remove existing links/folders if they exist
rm -rf static/assets/art
rm -rf static/challenges

# Create Symlinks
ln -s ../../out/covers static/assets/art
ln -s ../../out/dailies static/challenges

# Copy metadata manifests
if [ -f "out/data/songs.json" ]; then
    cp out/data/songs.json static/assets/songs.json
fi
if [ -f "out/data/covers.json" ]; then
    cp out/data/covers.json static/assets/covers.json
fi

echo "Local assets successfully linked!"
