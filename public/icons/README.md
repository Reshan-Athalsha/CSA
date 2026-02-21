# PWA Icon Generation Instructions

The PWA manifest references icon files in `/public/icons/`. You need to generate these icons.

## Required Icons:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Quick Generation:

### Option 1: Using an online tool
1. Go to https://realfavicongenerator.net/ or https://www.pwabuilder.com/imageGenerator
2. Upload your CSA logo (square image recommended)
3. Download the generated icon pack
4. Extract icons to `/public/icons/`

### Option 2: Using ImageMagick (CLI)
```bash
# Assuming you have a source logo.png (at least 512x512)
magick logo.png -resize 72x72 public/icons/icon-72x72.png
magick logo.png -resize 96x96 public/icons/icon-96x96.png
magick logo.png -resize 128x128 public/icons/icon-128x128.png
magick logo.png -resize 144x144 public/icons/icon-144x144.png
magick logo.png -resize 152x152 public/icons/icon-152x152.png
magick logo.png -resize 192x192 public/icons/icon-192x192.png
magick logo.png -resize 384x384 public/icons/icon-384x384.png
magick logo.png -resize 512x512 public/icons/icon-512x512.png
```

## Temporary Placeholder:
For now, you can use a simple colored square as a placeholder. The app will work without icons, but they're needed for a proper PWA install experience.

## Branding Colors:
Use the CSA primary color (#0096c7) with white "CSA" text for the icon design.
