import { chromium } from 'playwright';

async function testStreaming() {
  console.log('🚀 Starting streaming test with Thorium browser...');
  
  // Launch Thorium browser
  const browser = await chromium.launch({
    executablePath: '/usr/sbin/thorium-browser',
    headless: false,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('📍 Navigating to HighSeas...');
    await page.goto('http://localhost:6969');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    console.log('✅ Page loaded successfully');
    
    // Take a screenshot
    await page.screenshot({ path: 'homepage.png' });
    console.log('📸 Homepage screenshot saved');
    
    // Click on a movie from the homepage
    console.log('🎬 Testing movie selection from homepage...');
    
    // Look for movie cards on homepage - try various selectors
    let movieCards = page.locator('.movie-card, ion-card, .content-card');
    let cardCount = await movieCards.count();
    console.log(`📺 Found ${cardCount} movie cards with first selector`);
    
    if (cardCount === 0) {
      // Try broader selectors
      movieCards = page.locator('img, [src*="image"], .poster, .movie-poster');
      cardCount = await movieCards.count();
      console.log(`📺 Found ${cardCount} image elements`);
    }
    
    if (cardCount === 0) {
      // Try even broader - any clickable elements
      movieCards = page.locator('div[role="button"], button, a, [onclick]');
      cardCount = await movieCards.count();
      console.log(`📺 Found ${cardCount} clickable elements`);
    }
    
    // Debug: log page content structure
    if (cardCount === 0) {
      console.log('🔍 Debugging page structure...');
      const pageContent = await page.evaluate(() => {
        const body = document.body;
        return {
          bodyClasses: body.className,
          bodyChildren: Array.from(body.children).map(child => ({
            tagName: child.tagName,
            className: child.className,
            id: child.id
          })),
          allImages: Array.from(document.querySelectorAll('img')).length,
          allButtons: Array.from(document.querySelectorAll('button')).length,
          allDivs: Array.from(document.querySelectorAll('div')).length
        };
      });
      console.log('📋 Page structure:', JSON.stringify(pageContent, null, 2));
    }
    
    if (cardCount > 0) {
      // Click on the first movie card
      console.log('🎬 Clicking on first movie card...');
      await movieCards.first().click();
      
      // Wait for details page to load
      await page.waitForLoadState('networkidle');
      
      // Wait for loading to complete
      console.log('⏳ Waiting for movie details to load...');
      await page.waitForTimeout(5000);
      
      // Wait for loading spinner to disappear
      const loadingSpinner = page.locator(':has-text("Loading details"), .loading, [role="progressbar"]');
      if (await loadingSpinner.count() > 0) {
        console.log('⏳ Loading spinner detected, waiting for completion...');
        await page.waitForSelector(':has-text("Loading details")', { state: 'detached', timeout: 30000 });
      }
      
      await page.screenshot({ path: 'movie-details.png' });
      console.log('📸 Movie details screenshot saved');
    } else {
      console.log('❌ No movie cards found on homepage');
      return;
    }
    
    // Look for stream/quality buttons with various selectors
    let streamButtons = page.locator('ion-button:has-text("1080p"), ion-button:has-text("720p"), ion-button:has-text("480p"), .quality-button, .stream-button');
    let streamCount = await streamButtons.count();
    console.log(`🎞️ Found ${streamCount} stream options with quality selectors`);
    
    if (streamCount === 0) {
      // Try broader selectors for any buttons or clickable elements
      streamButtons = page.locator('button, ion-button, .btn, [role="button"]');
      streamCount = await streamButtons.count();
      console.log(`🎞️ Found ${streamCount} total buttons/clickable elements`);
      
      // Filter to likely stream buttons
      const likelyStreamButtons = streamButtons.filter({ hasText: /play|stream|watch|1080|720|480|HD|4K/i });
      const likelyCount = await likelyStreamButtons.count();
      console.log(`🎞️ Found ${likelyCount} likely stream buttons`);
      
      if (likelyCount > 0) {
        streamButtons = likelyStreamButtons;
        streamCount = likelyCount;
      }
    }
    
    if (streamCount > 0) {
      // Click on first available stream
      const firstStream = streamButtons.first();
      const streamText = await firstStream.textContent();
      console.log(`🎞️ Selecting stream: ${streamText}`);
      await firstStream.click();
      
      // Wait for Real-Debrid processing
      console.log('⏳ Waiting for Real-Debrid processing...');
      await page.waitForTimeout(8000);
      
      // Take screenshot after stream selection
      await page.screenshot({ path: 'stream-processing.png' });
      console.log('📸 Stream processing screenshot saved');
      
      // After clicking stream, look for additional stream quality options
      console.log('🔍 Looking for additional stream quality options...');
      await page.waitForTimeout(3000);
      
      // Look for quality buttons that appeared after "Find Streams"
      const qualityButtons = page.locator(':has-text("4K"), :has-text("1080p"), :has-text("720p"), :has-text("HD"), .quality-option, .stream-quality');
      const qualityCount = await qualityButtons.count();
      console.log(`📺 Found ${qualityCount} quality options`);
      
      if (qualityCount > 0) {
        // Click on a quality option (prefer 4K or highest available)
        const preferredQuality = page.locator(':has-text("4K")').first();
        if (await preferredQuality.count() > 0) {
          console.log('🎞️ Selecting 4K stream...');
          await preferredQuality.click();
        } else {
          console.log('🎞️ Selecting first available quality...');
          await qualityButtons.first().click();
        }
        
        // Wait longer for Real-Debrid processing
        console.log('⏳ Waiting for Real-Debrid magnet conversion...');
        await page.waitForTimeout(10000);
      }
      
      // Take another screenshot after quality selection
      await page.screenshot({ path: 'after-quality-selection.png' });
      console.log('📸 After quality selection screenshot saved');
      
      // Look for and click the "Play Now" button
      const playNowButton = page.locator(':has-text("Play Now"), .play-button, [data-testid="play-now"]');
      if (await playNowButton.count() > 0) {
        console.log('▶️ Found "Play Now" button, clicking...');
        await playNowButton.first().click();
        
        // Wait for navigation to player page
        console.log('⏳ Waiting for player page to load...');
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'player-loading.png' });
        console.log('📸 Player loading screenshot saved');
      }
      
      // Check for video player or error messages
      const videoPlayer = page.locator('video, .video-player, .stremio-video-player');
      const errorMessages = page.locator('.error-message, .stream-error, ion-alert, .alert-message, :has-text("expired"), :has-text("error")');
      const loadingMessages = page.locator('[role="progressbar"], .loading, .spinner');
      
      // Check for errors first
      if (await errorMessages.count() > 0) {
        const errorText = await errorMessages.first().textContent();
        console.log(`❌ Error detected: ${errorText}`);
        
        // Test enhanced retry mechanism (main feature we implemented)
        if (errorText?.includes('expired') || errorText?.includes('retry') || errorText?.includes('refreshing')) {
          console.log('🔄 Testing enhanced retry mechanism...');
          
          // Monitor for retry attempts with exponential backoff
          for (let i = 0; i < 6; i++) {
            await page.waitForTimeout(2000);
            
            const retryMessage = page.locator(':has-text("attempt"), :has-text("refreshing"), :has-text("/6")');
            if (await retryMessage.count() > 0) {
              const retryText = await retryMessage.first().textContent();
              console.log(`🔄 Retry ${i + 1} detected: ${retryText}`);
              await page.screenshot({ path: `retry-attempt-${i + 1}.png` });
            }
            
            // Check if video player appeared after retry
            if (await videoPlayer.count() > 0) {
              console.log(`✅ Video player appeared after retry ${i + 1}!`);
              break;
            }
          }
        }
      } else if (await videoPlayer.count() > 0) {
        console.log('🎥 Video player found immediately!');
        await page.screenshot({ path: 'video-player-success.png' });
        console.log('📸 Video player success screenshot saved');
        
        // Test HLS transcoding if MKV file
        const playerSrc = await videoPlayer.getAttribute('src');
        if (playerSrc?.includes('/api/hls/')) {
          console.log('🔧 HLS transcoding detected');
          
          // Wait for transcoding to start
          await page.waitForTimeout(5000);
          await page.screenshot({ path: 'hls-transcoding.png' });
          console.log('📸 HLS transcoding screenshot saved');
        }
        
      } else if (await loadingMessages.count() > 0) {
        console.log('⏳ Loading in progress...');
        
        // Wait longer for processing
        await page.waitForTimeout(15000);
        
        // Check again after extended wait
        if (await videoPlayer.count() > 0) {
          console.log('🎥 Video player appeared after extended wait!');
          await page.screenshot({ path: 'video-player-delayed.png' });
        } else if (await errorMessages.count() > 0) {
          const errorText = await errorMessages.first().textContent();
          console.log(`❌ Error after wait: ${errorText}`);
        }
      } else {
        console.log('❓ Unexpected state - no player, error, or loading indicator');
        await page.screenshot({ path: 'unexpected-state.png' });
      }
      
    } else {
      console.log('❌ No stream options found on movie details page');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'error.png' });
  } finally {
    console.log('🔒 Closing browser...');
    await browser.close();
    console.log('✅ Test completed');
  }
}

testStreaming().catch(console.error);