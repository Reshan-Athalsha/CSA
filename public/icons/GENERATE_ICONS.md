# Quick Icon Generation Script

Use this script to generate all required PNG icon sizes from the SVG source.

## Using ImageMagick (Windows/macOS/Linux):

```bash
# Install ImageMagick first if you don't have it
# Windows: choco install imagemagick
# macOS: brew install imagemagick
# Linux: sudo apt-get install imagemagick

# Generate all icon sizes from SVG
magick convert icon.svg -resize 72x72 icon-72x72.png
magick convert icon.svg -resize 96x96 icon-96x96.png
magick convert icon.svg -resize 128x128 icon-128x128.png
magick convert icon.svg -resize 144x144 icon-144x144.png
magick convert icon.svg -resize 152x152 icon-152x152.png
magick convert icon.svg -resize 192x192 icon-192x192.png
magick convert icon.svg -resize 384x384 icon-384x384.png
magick convert icon.svg -resize 512x512 icon-512x512.png
```

## Using Online Tools:
1. Visit https://realfavicongenerator.net/
2. Upload `icon.svg`
3. Download the generated package
4. Extract PNG files to this directory

## Current Status:
- ✅ `icon.svg` - Source SVG with CSA branding
- ⚠️ PNG files need to be generated (see above)

The app will work without PNG icons, but proper icons are needed for:
- iOS home screen
- Android app drawer
- PWA install prompt
- Splash screens
