import { chromium } from 'playwright';

async function testChunkDemuxerFix() {
  console.log('🔧 Testing CHUNK_DEMUXER_ERROR fixes...');
  
  const browser = await chromium.launch({
    executablePath: '/usr/sbin/thorium-browser',
    headless: false,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console messages for debugging
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    console.log(`🖥️ Browser ${msg.type()}: ${msg.text()}`);
  });
  
  // Capture JavaScript errors
  const jsErrors = [];
  page.on('pageerror', error => {
    jsErrors.push(error.message);
    console.error('🚨 JavaScript Error:', error.message);
  });
  
  try {
    // Get a high-quality stream that might trigger CHUNK_DEMUXER issues
    console.log('🔍 Getting high-quality stream for testing...');
    const streamResponse = await page.request.get('http://localhost:6969/api/addon/stream/movie/tt26743210.json');
    const streamData = await streamResponse.json();
    
    if (streamData.streams && streamData.streams.length > 0) {
      // Find a high-quality MKV stream that's likely to trigger codec issues
      const testStream = streamData.streams.find(stream => 
        stream.behaviorHints?.filename?.includes('.mkv') && 
        (stream.title?.includes('2160p') || stream.title?.includes('4K') || stream.title?.includes('HEVC'))
      ) || streamData.streams.find(stream => 
        stream.behaviorHints?.filename?.includes('.mkv')
      ) || streamData.streams[0];
      
      console.log('📺 Testing with stream:', {
        title: testStream.title?.substring(0, 80) + '...',
        filename: testStream.behaviorHints?.filename,
        infoHash: testStream.infoHash
      });
      
      // Construct magnet URL
      const magnetUrl = `magnet:?xt=urn:btih:${testStream.infoHash}&dn=${encodeURIComponent(testStream.title || 'stream')}`;
      
      // Navigate to player with the problematic stream
      const playerUrl = `http://localhost:6969/watch/chunk-test?stream=${encodeURIComponent(magnetUrl)}`;
      console.log('📍 Navigating to player...');
      await page.goto(playerUrl);
      
      // Wait for initial load
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'chunk-test-initial.png' });
      console.log('📸 Initial player screenshot saved');
      
      // Monitor for video player and errors
      let videoPlayerFound = false;
      let chunkDemuxerErrorDetected = false;
      let directFallbackTriggered = false;
      const maxWaitTime = 60000; // 1 minute
      const startTime = Date.now();
      
      console.log('🔄 Monitoring for CHUNK_DEMUXER errors and fallback behavior...');
      
      while (Date.now() - startTime < maxWaitTime && !videoPlayerFound && !chunkDemuxerErrorDetected) {
        // Check for video elements
        const videoElements = page.locator('video');
        const videoCount = await videoElements.count();
        
        if (videoCount > 0) {
          const videoElement = videoElements.first();
          const videoSrc = await videoElement.getAttribute('src');
          const videoError = await videoElement.evaluate(el => {
            return el.error ? {
              code: el.error.code,
              message: el.error.message
            } : null;
          });
          
          console.log('🎥 Video element status:', {
            src: videoSrc?.substring(0, 100) + '...',
            hasError: !!videoError,
            error: videoError
          });
          
          if (videoSrc) {
            videoPlayerFound = true;
            await page.screenshot({ path: 'chunk-test-player-ready.png' });
            console.log('📸 Player ready screenshot saved');
            
            // Check what type of playback we're using
            if (videoSrc.includes('/api/hls/')) {
              console.log('✅ HLS transcoding active');
              
              // Wait a bit and check for CHUNK_DEMUXER errors
              await page.waitForTimeout(10000);
              
              const newVideoError = await videoElement.evaluate(el => {
                return el.error ? {
                  code: el.error.code,
                  message: el.error.message
                } : null;
              });
              
              if (newVideoError && newVideoError.message?.includes('CHUNK_DEMUXER')) {
                console.log('❌ CHUNK_DEMUXER error still occurring:', newVideoError.message);
                chunkDemuxerErrorDetected = true;
                await page.screenshot({ path: 'chunk-test-error.png' });
              } else {
                console.log('✅ No CHUNK_DEMUXER errors detected - fix working!');
              }
              
            } else if (videoSrc.startsWith('https://') && videoSrc.includes('real-debrid.com')) {
              console.log('✅ Direct playback active (fallback successful)');
              directFallbackTriggered = true;
            }
            
            // Check for error messages on the page
            const errorMessages = page.locator('.error-message, .stream-error, :has-text("CHUNK_DEMUXER"), :has-text("DTS sequence")');
            const errorCount = await errorMessages.count();
            
            if (errorCount > 0) {
              const errorText = await errorMessages.first().textContent();
              console.log(`⚠️ Error message on page: ${errorText}`);
              
              if (errorText?.includes('CHUNK_DEMUXER') || errorText?.includes('DTS sequence')) {
                chunkDemuxerErrorDetected = true;
                await page.screenshot({ path: 'chunk-test-page-error.png' });
              }
            }
            
            break;
          }
        }
        
        // Check for loading indicators
        const loadingElements = page.locator(':has-text("Loading"), :has-text("Processing"), :has-text("Converting"), .loading, .spinner');
        if (await loadingElements.count() > 0) {
          const loadingText = await loadingElements.first().textContent();
          console.log(`⏳ Loading: ${loadingText}`);
        }
        
        await page.waitForTimeout(2000);
      }
      
      // Analyze results
      console.log('\n📊 Test Results:');
      console.log(`✅ Video player loaded: ${videoPlayerFound}`);
      console.log(`❌ CHUNK_DEMUXER error detected: ${chunkDemuxerErrorDetected}`);
      console.log(`🔄 Direct fallback triggered: ${directFallbackTriggered}`);
      
      // Check browser console for HLS-related messages
      const hlsLogs = consoleMessages.filter(msg => 
        msg.includes('HLS') || msg.includes('CHUNK_DEMUXER') || msg.includes('DTS') || msg.includes('fallback')
      );
      
      if (hlsLogs.length > 0) {
        console.log('\n📋 HLS-related console messages:');
        hlsLogs.forEach(log => console.log(`  ${log}`));
      }
      
      // Final assessment
      if (videoPlayerFound && !chunkDemuxerErrorDetected) {
        console.log('\n🎉 SUCCESS: CHUNK_DEMUXER error fix appears to be working!');
        if (directFallbackTriggered) {
          console.log('✅ Fallback to direct playback successfully prevented CHUNK_DEMUXER errors');
        } else {
          console.log('✅ Enhanced HLS configuration successfully prevented CHUNK_DEMUXER errors');
        }
      } else if (chunkDemuxerErrorDetected) {
        console.log('\n❌ CHUNK_DEMUXER error still occurring - may need additional fixes');
      } else {
        console.log('\n⚠️ Video player did not load - investigation needed');
      }
      
    } else {
      console.log('❌ No streams available for testing');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
    await page.screenshot({ path: 'chunk-test-error.png' });
  } finally {
    await browser.close();
    console.log('✅ CHUNK_DEMUXER fix test completed');
  }
}

testChunkDemuxerFix().catch(console.error);