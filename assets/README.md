# HighSeas CasaOS Assets

This directory contains the visual assets required for CasaOS deployment.

## Required Assets

### Icon (icon.png)
- **Size**: 512x512 pixels
- **Format**: PNG with transparency
- **Style**: Modern, clean design representing streaming/media
- **Colors**: Matching the HighSeas brand (ocean/nautical theme)
- **Usage**: Main app icon in CasaOS store and dashboard

### Thumbnail (thumbnail.png)  
- **Size**: 300x200 pixels
- **Format**: PNG
- **Content**: Simplified version of the icon or app preview
- **Usage**: Small preview image in CasaOS app list

### Screenshots
1. **screenshot1.png** - Main dashboard view
   - **Size**: 1920x1080 pixels
   - **Content**: Board/homepage with content rows
   - **Shows**: Netflix-style interface with movies/shows

2. **screenshot2.png** - Video player interface
   - **Size**: 1920x1080 pixels  
   - **Content**: Video player with controls
   - **Shows**: HLS transcoding, subtitle support, quality selection

## Design Guidelines

- **Theme**: Ocean/nautical with modern streaming aesthetics
- **Colors**: Deep blues, ocean teals, with white/light accents
- **Style**: Clean, modern, professional
- **Branding**: Should feel premium like Netflix but with maritime theme

## Asset Creation Status

- [ ] icon.png - Main 512x512 app icon
- [ ] thumbnail.png - 300x200 preview thumbnail  
- [ ] screenshot1.png - Dashboard/board interface
- [ ] screenshot2.png - Video player interface

## Usage in CasaOS

These assets are referenced in the docker-compose.yml x-casaos metadata:

```yaml
x-casaos:
  icon: https://raw.githubusercontent.com/highseas-dev/highseas/main/assets/icon.png
  thumbnail: https://raw.githubusercontent.com/highseas-dev/highseas/main/assets/thumbnail.png
  screenshot_link:
    - https://raw.githubusercontent.com/highseas-dev/highseas/main/assets/screenshot1.png
    - https://raw.githubusercontent.com/highseas-dev/highseas/main/assets/screenshot2.png
```

## Placeholder Assets

Until custom assets are created, you can use:
- Stremio's official assets as temporary placeholders
- Generic streaming/media icons from open source collections
- Screenshots from the actual running application

The current assets are placeholders and should be replaced with proper branded materials before public release.