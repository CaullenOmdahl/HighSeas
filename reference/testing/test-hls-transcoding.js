import { chromium } from 'playwright';

async function testHLSTranscoding() {
  console.log('🚀 Starting HLS transcoding test...');
  
  try {
    // Test the HLS transcoding endpoint directly
    console.log('🔧 Testing HLS transcoding endpoint...');
    
    // Use a sample Real-Debrid URL that would trigger MKV transcoding
    const testMKVUrl = 'https://example.com/test.mkv';
    const sessionId = 'test-session-' + Date.now();
    
    // Test master playlist generation
    const masterUrl = `http://localhost:6969/api/hls/${sessionId}/master.m3u8?mediaURL=${encodeURIComponent(testMKVUrl)}`;
    console.log('📋 Testing master playlist:', masterUrl);
    
    const response = await fetch(masterUrl);
    if (response.ok) {
      const masterPlaylist = await response.text();
      console.log('✅ Master playlist generated successfully');
      console.log('📋 Master playlist content:');
      console.log(masterPlaylist);
    } else {
      console.log(`❌ Master playlist failed: ${response.status} ${response.statusText}`);
    }
    
    // Test with actual Real-Debrid MKV stream
    console.log('🎬 Testing with actual MKV stream...');
    
    const browser = await chromium.launch({
      executablePath: '/usr/sbin/thorium-browser',
      headless: false,
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Get a stream that's likely to be MKV format
    const streamResponse = await page.request.get('http://localhost:6969/api/addon/stream/movie/tt26743210.json');
    const streamData = await streamResponse.json();
    
    // Find MKV stream
    const mkvStream = streamData.streams?.find(stream => 
      stream.behaviorHints?.filename?.includes('.mkv') || 
      stream.title?.includes('.mkv') ||
      stream.title?.includes('MKV')
    );
    
    if (mkvStream) {
      console.log('📺 Found MKV stream for testing:');
      console.log('📋 MKV Stream info:', {
        title: mkvStream.title?.substring(0, 100) + '...',
        filename: mkvStream.behaviorHints?.filename,
        infoHash: mkvStream.infoHash
      });
      
      // Construct magnet URL
      const magnetUrl = `magnet:?xt=urn:btih:${mkvStream.infoHash}&dn=${encodeURIComponent(mkvStream.title || 'stream')}`;
      
      // Navigate to player with MKV stream
      const playerUrl = `http://localhost:6969/watch/mkv-test?stream=${encodeURIComponent(magnetUrl)}`;
      console.log('📍 Navigating to player with MKV stream...');
      await page.goto(playerUrl);
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'mkv-player-loading.png' });
      console.log('📸 MKV player loading screenshot saved');
      
      // Monitor for HLS transcoding
      console.log('🔧 Monitoring for HLS transcoding...');
      let transcodingDetected = false;
      const maxWaitTime = 30000; // 30 seconds
      const startTime = Date.now();
      
      while (Date.now() - startTime < maxWaitTime && !transcodingDetected) {
        // Check for video player
        const videoPlayer = page.locator('video, .video-player, .stremio-video-player');
        if (await videoPlayer.count() > 0) {
          const playerSrc = await videoPlayer.getAttribute('src');
          console.log(`🎥 Video player found with src: ${playerSrc}`);
          
          if (playerSrc?.includes('/api/hls/')) {
            console.log('✅ HLS transcoding detected!');
            console.log(`🔧 HLS URL: ${playerSrc}`);
            transcodingDetected = true;
            
            await page.screenshot({ path: 'hls-transcoding-active.png' });
            console.log('📸 HLS transcoding active screenshot saved');
            
            // Test if HLS playlist is accessible
            try {
              const hlsResponse = await fetch(playerSrc);
              if (hlsResponse.ok) {
                const hlsContent = await hlsResponse.text();
                console.log('✅ HLS playlist accessible');
                console.log('📋 HLS playlist sample:', hlsContent.substring(0, 200) + '...');
              }
            } catch (hlsError) {
              console.log('⚠️ HLS playlist not yet ready:', hlsError.message);
            }
            
            break;
          } else {
            console.log('🎥 Video player found but not using HLS transcoding');
          }
        }
        
        // Check for transcoding messages
        const transcodingMessages = page.locator(':has-text("transcoding"), :has-text("converting"), :has-text("processing")');
        if (await transcodingMessages.count() > 0) {
          const message = await transcodingMessages.first().textContent();
          console.log(`🔧 Transcoding message: ${message}`);
        }
        
        await page.waitForTimeout(2000);
      }
      
      if (!transcodingDetected) {
        console.log('⚠️ HLS transcoding was not triggered - stream may be directly playable');
      }
      
    } else {
      console.log('❌ No MKV streams found for testing');
    }
    
    await browser.close();
    
  } catch (error) {
    console.error('❌ HLS transcoding test error:', error);
  }
  
  console.log('✅ HLS transcoding test completed');
}

testHLSTranscoding().catch(console.error);