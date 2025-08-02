import { chromium } from 'playwright';

async function debugPlayer() {
  console.log('🔍 Debugging video player implementation...');
  
  const browser = await chromium.launch({
    executablePath: '/usr/sbin/thorium-browser',
    headless: false,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console messages
  page.on('console', msg => {
    console.log(`🖥️ Browser ${msg.type()}: ${msg.text()}`);
  });
  
  // Capture JavaScript errors
  page.on('pageerror', error => {
    console.error('🚨 JavaScript Error:', error.message);
  });
  
  try {
    console.log('📍 Navigating to player page...');
    await page.goto('http://localhost:6969/watch/debug-test');
    
    // Wait a bit for the page to load
    await page.waitForTimeout(5000);
    
    // Check if React app loaded
    const reactElements = await page.locator('[data-reactroot], #root').count();
    console.log(`⚛️ React elements found: ${reactElements}`);
    
    // Check for any error messages on page
    const errorElements = await page.locator('.error, .error-message, [role="alert"]').count();
    console.log(`❌ Error elements found: ${errorElements}`);
    
    if (errorElements > 0) {
      const errorText = await page.locator('.error, .error-message, [role="alert"]').first().textContent();
      console.log(`❌ Error text: ${errorText}`);
    }
    
    // Check page content
    const bodyContent = await page.locator('body').textContent();
    console.log(`📝 Page content length: ${bodyContent?.length || 0} characters`);
    
    if (bodyContent && bodyContent.length < 100) {
      console.log(`📝 Page content: "${bodyContent}"`);
    }
    
    // Check if video player container exists
    const videoContainers = await page.locator('.video-player, .stremio-video-player, video').count();
    console.log(`🎥 Video containers found: ${videoContainers}`);
    
    // Check network requests
    const responses = [];
    page.on('response', response => {
      if (response.status() >= 400) {
        responses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    // Wait a bit more and check for network errors
    await page.waitForTimeout(3000);
    
    if (responses.length > 0) {
      console.log('🌐 Network errors:');
      responses.forEach(resp => {
        console.log(`  ${resp.status} ${resp.statusText}: ${resp.url}`);
      });
    }
    
    // Test loading a simple stream URL
    console.log('🧪 Testing with simple direct URL...');
    const testUrl = 'http://localhost:6969/watch/simple-test?stream=https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    await page.goto(testUrl);
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'debug-simple-test.png' });
    
    const simpleVideoElements = await page.locator('video').count();
    console.log(`🎥 Video elements with simple URL: ${simpleVideoElements}`);
    
    if (simpleVideoElements > 0) {
      const videoSrc = await page.locator('video').first().getAttribute('src');
      console.log(`🎥 Video src: ${videoSrc}`);
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await browser.close();
    console.log('✅ Debug completed');
  }
}

debugPlayer().catch(console.error);