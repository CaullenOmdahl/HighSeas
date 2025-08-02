import { chromium } from 'playwright';

async function testPlayerRetry() {
  console.log('🚀 Starting player retry mechanism test...');
  
  const browser = await chromium.launch({
    executablePath: '/usr/sbin/thorium-browser',
    headless: false,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate directly to a player page with a magnet link to test retry mechanism
    console.log('📍 Navigating to player with test stream...');
    
    // First get a magnet link from the stream endpoint
    const streamResponse = await page.request.get('http://localhost:6969/api/addon/stream/movie/tt26743210.json');
    const streamData = await streamResponse.json();
    console.log(`📺 Found ${streamData.streams?.length || 0} streams in API response`);
    
    if (streamData.streams && streamData.streams.length > 0) {
      // Find a stream with infoHash to construct magnet link
      const streamWithHash = streamData.streams.find(stream => 
        stream.infoHash
      );
      
      if (streamWithHash) {
        // Construct magnet URL from infoHash
        const magnetUrl = `magnet:?xt=urn:btih:${streamWithHash.infoHash}&dn=${encodeURIComponent(streamWithHash.title || 'stream')}`;
        console.log('🧲 Constructed magnet URL from infoHash');
        console.log('🧲 Found magnet stream, testing player...');
        console.log('📋 Stream info:', {
          title: streamWithHash.title,
          infoHash: streamWithHash.infoHash,
          name: streamWithHash.name
        });
        
        // Navigate to player with the magnet link
        const playerUrl = `http://localhost:6969/watch/1?stream=${encodeURIComponent(magnetUrl)}`;
        console.log('📍 Navigating to player page...');
        await page.goto(playerUrl);
        
        // Wait for page to load
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: 'player-page.png' });
        console.log('📸 Player page screenshot saved');
        
        // Monitor for Real-Debrid processing and retry mechanism
        console.log('🔄 Monitoring for retry mechanism...');
        
        let retryCount = 0;
        const maxMonitorTime = 60000; // Monitor for 1 minute
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxMonitorTime) {
          // Check for error messages indicating stream expiration
          const errorMessages = page.locator('.error-message, .stream-error, :has-text("expired"), :has-text("refreshing"), :has-text("attempt")');
          const errorCount = await errorMessages.count();
          
          if (errorCount > 0) {
            const errorText = await errorMessages.first().textContent();
            console.log(`🔄 Retry mechanism detected: ${errorText}`);
            
            // Take screenshot of retry attempt
            retryCount++;
            await page.screenshot({ path: `retry-${retryCount}.png` });
            console.log(`📸 Retry attempt ${retryCount} screenshot saved`);
            
            // Check if this shows our enhanced 6-attempt system
            if (errorText?.includes('/6')) {
              console.log('✅ Enhanced 6-attempt retry system confirmed!');
            }
            
            // Check if retry succeeded
            await page.waitForTimeout(5000);
            const videoPlayer = page.locator('video, .video-player, .stremio-video-player');
            if (await videoPlayer.count() > 0) {
              console.log('✅ Video player appeared after retry!');
              await page.screenshot({ path: 'player-success.png' });
              break;
            }
          }
          
          // Check for video player
          const videoPlayer = page.locator('video, .video-player, .stremio-video-player');
          if (await videoPlayer.count() > 0) {
            console.log('🎥 Video player found!');
            await page.screenshot({ path: 'video-player-active.png' });
            
            // Check if it's using HLS transcoding
            const playerSrc = await videoPlayer.getAttribute('src');
            if (playerSrc?.includes('/api/hls/')) {
              console.log('🔧 HLS transcoding detected in player');
              console.log(`📋 HLS URL: ${playerSrc}`);
            }
            break;
          }
          
          // Check for loading indicators
          const loadingIndicators = page.locator('.loading, .spinner, [role="progressbar"], :has-text("Loading"), :has-text("Processing")');
          if (await loadingIndicators.count() > 0) {
            const loadingText = await loadingIndicators.first().textContent();
            console.log(`⏳ Loading: ${loadingText}`);
          }
          
          await page.waitForTimeout(2000);
        }
        
        console.log(`🔄 Monitoring complete. Detected ${retryCount} retry attempts.`);
        
      } else {
        console.log('❌ No magnet streams found');
      }
    } else {
      console.log('❌ No streams found in API response');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'player-test-error.png' });
  } finally {
    console.log('🔒 Closing browser...');
    await browser.close();
    console.log('✅ Player retry test completed');
  }
}

testPlayerRetry().catch(console.error);