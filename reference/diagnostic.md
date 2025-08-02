# 🔍 Diagnostic Checklist: Stream Selection & MovieCard Enhancements

## What Should Be Working:

### 1. Enhanced Movie Cards
**Expected Behavior:**
- Cover art images should fill the entire card (no white space around images)
- Title text should be overlaid on the image at the bottom with a gradient background
- On hover, the title should fade out and detailed info should appear

**Files Modified:**
- `src/lib/components/MovieCard.svelte` - Added overlay title positioning
- CSS updated to position title as absolute overlay

### 2. Stream Selection Flow
**Expected Behavior:**
- Click any movie/show → "Discovering Streams" loading screen
- → Stream Selection screen with provider groups and quality options
- → Choose stream → Player loads with selected stream
- → "Change Stream Quality" button available during playback

**Files Created/Modified:**
- `src/lib/components/StreamSelector.svelte` - New stream selection component
- `src/routes/watch/[id]/+page.svelte` - Updated with stream selection flow

## 🧪 Test Steps:

### Test 1: Movie Card Appearance
1. Go to http://localhost:4173
2. Look at movie cards in the rows below the hero carousel
3. **Expected**: Images fill entire card, title overlaid at bottom
4. **Hover**: Title fades out, detailed info appears with play button

### Test 2: Stream Selection Flow  
1. Click any movie card
2. **Expected**: Loading screen saying "Discovering Streams"
3. **Expected**: Stream selection page with:
   - Movie poster and details at top
   - Provider groups (Real-Debrid, Torrentio, etc.)
   - Quality options (4K, 1080p, 720p, etc.)
   - Stream cards with file sizes and metadata
4. Click a stream quality option
5. **Expected**: Player loads with chosen stream
6. **Expected**: "Change Stream Quality" button visible above content info

### Test 3: Stream Quality Switching
1. During playback, click "Change Stream Quality" button
2. **Expected**: Returns to stream selection screen
3. Choose different quality
4. **Expected**: Player switches to new stream

## 🐛 Possible Issues:

### If Movie Cards Look Wrong:
- Title might not be overlaid (positioned below card instead of on it)
- Images might not fill full card area
- Hover effects might not work

### If Stream Selection Doesn't Appear:
- Check browser console for JavaScript errors
- Might go directly to player (old behavior)
- Loading might get stuck on "Discovering Streams"

### If No Streams Found:
- This is expected for most content without Real-Debrid setup
- Should show "No Streams Available" message

## 🔧 Quick Fixes:

### Fix 1: Movie Card Title Overlay
The title overlay needs to be inside the `.card-image` container:
```svelte
<div class="card-image ...">
  <!-- image content -->
  <!-- title overlay should be HERE -->
  <div class="card-title absolute bottom-0 left-0 right-0 ...">
    <!-- title content -->
  </div>
</div>
```

### Fix 2: Stream Selection Not Showing
Check if `showStreamSelector` state is being set to `true` when streams are found.

## 🎯 Success Criteria:
✅ Movie cards have full-bleed images with overlaid titles  
✅ Stream selection screen appears before player  
✅ Provider grouping and quality parsing works  
✅ "Change Stream Quality" button works during playback  
✅ No JavaScript errors in console  