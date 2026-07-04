#!/bin/bash
set -e

echo "Generating text charset..."
node -e "
const chars = [];
// Basic Latin
for(let i=32; i<=126; i++) chars.push(String.fromCharCode(i));
// Latin-1 Supplement
for(let i=160; i<=255; i++) chars.push(String.fromCharCode(i));
// General Punctuation
for(let i=8192; i<=8303; i++) chars.push(String.fromCharCode(i));
// Add specific icons we might need just in case, but they are in icon-atlas too
require('fs').writeFileSync('tools/text-charset.txt', chars.join(''));
"

echo "Generating icon charset..."
# ✕ (U+2715), ✎ (U+270E), + (U+002B)
# Note: we use node to write to ensure correct utf8 encoding
node -e "
require('fs').writeFileSync('tools/icon-charset.txt', '');
"

echo "Running msdf-bmfont for text atlas..."
# Generate MTSDF (Multi-Channel Signed Distance Field)
npx msdf-bmfont -f json -m 1024,1024 -r 4 -s 42 -t msdf -i tools/text-charset.txt fonts/Geist-SemiBold.ttf -o assets/msdf-atlas
mv assets/Geist-SemiBold.json assets/msdf-atlas.json

echo "Running msdf-bmfont for icon atlas..."
npx msdf-bmfont -f json -m 256,256 -r 4 -s 42 -t msdf -i tools/icon-charset.txt fonts/graph-giraffe.ttf -o assets/icon-atlas
mv assets/graph-giraffe.json assets/icon-atlas.json

echo "Atlases generated successfully."
