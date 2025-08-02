import { chromium } from 'playwright';

async function testFixedPlayer() {
  console.log('🚀 Testing fixed video player implementation...');
  
  const browser = await chromium.launch({
    executablePath: '/usr/sbin/thorium-browser',
    headless: false,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test the application
    console.log('📍 Navigating to HighSeas...');
    await page.goto('http://localhost:6969');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'fixed-homepage.png' });
    console.log('📸 Fixed homepage screenshot saved');
    
    // Get a stream for testing
    console.log('🔍 Getting test stream...');
    const streamResponse = await page.request.get('http://localhost:6969/api/addon/stream/movie/tt26743210.json');
    const streamData = await streamResponse.json();
    
    if (streamData.streams && streamData.streams.length > 0) {
      // Find a stream with infoHash
      const testStream = streamData.streams.find(stream => 
        stream.infoHash && stream.behaviorHints?.filename?.includes('.mkv')
      ) || streamData.streams[0];
      
      console.log('📺 Using test stream:', {
        title: testStream.title?.substring(0, 50) + '...',
        infoHash: testStream.infoHash,
        filename: testStream.behaviorHints?.filename
      });
      
      // Construct magnet URL
      const magnetUrl = `magnet:?xt=urn:btih:${testStream.infoHash}&dn=${encodeURIComponent(testStream.title || 'stream')}`;
      
      // Navigate to player
      const playerUrl = `http://localhost:6969/watch/test-fixed?stream=${encodeURIComponent(magnetUrl)}`;
      console.log('📍 Navigating to fixed player...');
      await page.goto(playerUrl);
      
      // Wait for player to load
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'fixed-player-loading.png' });
      console.log('📸 Fixed player loading screenshot saved');
      
      // Monitor for player initialization and error handling
      let playerReady = false;
      let errorDetected = false;
      const maxWaitTime = 45000; // 45 seconds
      const startTime = Date.now();
      
      console.log('🔄 Monitoring player initialization...');
      
      while (Date.now() - startTime < maxWaitTime && !playerReady && !errorDetected) {
        // Check for video element
        const videoElements = page.locator('video');
        const videoCount = await videoElements.count();
        
        if (videoCount > 0) {
          console.log('🎥 Video element found!');
          const videoElement = videoElements.first();
          
          // Check video properties
          const videoSrc = await videoElement.getAttribute('src');
          const videoReadyState = await videoElement.evaluate(el => el.readyState);
          const videoError = await videoElement.evaluate(el => el.error);
          
          console.log('📋 Video element status:', {
            src: videoSrc?.substring(0, 100) + '...',
            readyState: videoReadyState,
            hasError: !!videoError
          });
          
          if (videoSrc) {
            playerReady = true;
            await page.screenshot({ path: 'fixed-player-ready.png' });
            console.log('📸 Fixed player ready screenshot saved');
            
            // Test if it's using HLS transcoding
            if (videoSrc.includes('/api/hls/')) {
              console.log('✅ HLS transcoding active - enhanced implementation working!');
              
              // Test HLS playlist
              try {
                const hlsResponse = await fetch(videoSrc);
                if (hlsResponse.ok) {
                  const hlsContent = await hlsResponse.text();
                  console.log('✅ HLS playlist accessible');
                  console.log('📋 HLS sample:', hlsContent.substring(0, 200) + '...');
                } else {
                  console.log('⚠️ HLS playlist not ready yet');
                }
              } catch (hlsError) {
                console.log('⚠️ HLS playlist error:', hlsError.message);
              }
            } else {
              console.log('📺 Direct video playback (non-HLS)');
            }
            
            // Check for error messages
            const errorMessages = page.locator('.error-message, .stream-error, :has-text("error"), :has-text("failed")');
            if (await errorMessages.count() > 0) {
              const errorText = await errorMessages.first().textContent();
              console.log(`⚠️ Error message detected: ${errorText}`);
              
              // Check if it's the CHUNK_DEMUXER error we're trying to fix
              if (errorText?.includes('CHUNK_DEMUXER') || errorText?.includes('DTS sequence')) {
                console.log('❌ CHUNK_DEMUXER error still present - needs further investigation');
                errorDetected = true;
                await page.screenshot({ path: 'fixed-player-error.png' });
              }
            } else {
              console.log('✅ No error messages detected');
            }
            
            break;
          }
        }
        
        // Check for loading or processing messages
        const loadingMessages = page.locator(':has-text("Loading"), :has-text("Processing"), :has-text("Converting"), .loading, .spinner');
        if (await loadingMessages.count() > 0) {
          const loadingText = await loadingMessages.first().textContent();
          console.log(`⏳ Status: ${loadingText}`);
        }
        
        // Check console for JavaScript errors
        const consoleMessages = await page.evaluate(() => {
          return window.console._errors || [];
        });
        
        if (consoleMessages && consoleMessages.length > 0) {
          console.log('🔍 Console errors detected:', consoleMessages);
        }
        
        await page.waitForTimeout(2000);
      }
      
      if (!playerReady && !errorDetected) {
        console.log('⏰ Player initialization timeout');
        await page.screenshot({ path: 'fixed-player-timeout.png' });
      }
      
      // Test retry mechanism if applicable
      const retryMessages = page.locator(':has-text("retry"), :has-text("attempt"), :has-text("/6")');
      if (await retryMessages.count() > 0) {
        const retryText = await retryMessages.first().textContent();
        console.log(`🔄 Retry mechanism active: ${retryText}`);
        await page.screenshot({ path: 'fixed-player-retry.png' });
      }
      
    } else {
      console.log('❌ No streams available for testing');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'fixed-player-test-error.png' });
  } finally {
    await browser.close();
    console.log('✅ Fixed player test completed');
  }
}

testFixedPlayer().catch(console.error);