# Migration Plan: Svelte Web App → React Native Google TV APK

## 🎯 Project Overview

**Goal**: Transform the existing Svelte Netflix-style streaming interface into a native Google TV APK that can be deployed to the Google Play Store.

**Current State**: Production-ready Svelte web application with:
- Netflix-style UI with hero carousel and content rows
- Stream selection interface with provider/quality options
- Secure streaming proxy without downloads
- Comprehensive testing and performance optimization

**Target State**: React Native TV application with:
- Native Android TV APK 
- D-pad/remote control navigation
- Hardware-accelerated video playback
- Google Play Store deployment ready

## 📅 Migration Timeline: 6-8 Weeks

### **Phase 1: Foundation & Research (Week 1)**
**Duration**: 5-7 days  
**Priority**: Critical

#### Tasks:
1. **Environment Setup**
   - Install React Native TV development tools
   - Set up Expo TV configuration
   - Configure Android TV emulator
   - Test basic TV app compilation

2. **Technical Validation**
   - Verify TV navigation patterns work
   - Test video playback on TV hardware
   - Validate APK generation process
   - Confirm Google Play Console TV requirements

3. **Architecture Design**
   - Document component mapping (Svelte → React Native)
   - Design TV-specific navigation flow
   - Plan state management approach
   - Define streaming service interfaces

**Deliverables**:
- ✅ Working React Native TV development environment
- ✅ Basic TV app skeleton with navigation
- ✅ Architecture documentation
- ✅ Technical feasibility validation

---

### **Phase 2: Core Infrastructure (Week 2-3)**
**Duration**: 10-14 days  
**Priority**: Critical

#### Tasks:
1. **Streaming Services Migration**
   ```javascript
   // Migrate existing services:
   src/lib/services/stremio.js → services/StremioService.js
   src/lib/services/streamProxy.js → services/StreamProxyService.js
   src/lib/utils/cache.js → services/CacheService.js
   ```

2. **Network Layer**
   - Adapt HTTP client for React Native
   - Migrate proxy logic for TV platform
   - Implement secure token handling
   - Add TV-specific error handling

3. **State Management**
   - Set up context providers for global state
   - Migrate stream selection logic
   - Implement TV-specific navigation state
   - Add remote control event handling

**Current Code Reuse**:
```javascript
// High reuse potential (80-90%):
- Stream parsing logic
- Provider detection algorithms  
- Quality extraction methods
- Caching strategies
- Error handling patterns

// Platform-specific rewrites needed:
- HTTP client implementation
- File system access
- Navigation patterns
```

**Deliverables**:
- ✅ Core streaming services working in React Native
- ✅ Network requests functional
- ✅ State management architecture implemented
- ✅ Basic error handling and logging

---

### **Phase 3: TV-Optimized UI Components (Week 3-4)**
**Duration**: 7-10 days  
**Priority**: High

#### Component Migration Map:
```
Svelte Component              → React Native TV Component
────────────────────────────────────────────────────────────
FeaturedCarousel.svelte       → TVHeroCarousel.jsx
MovieRow.svelte               → TVMovieRow.jsx  
MovieCard.svelte              → TVMovieCard.jsx
StreamSelector.svelte         → TVStreamSelector.jsx
BufferedPlayer.svelte         → TVVideoPlayer.jsx
Header.svelte                 → TVHeader.jsx (simplified)
KeyboardNavigation.svelte     → TVRemoteNavigation.jsx
```

#### TV-Specific Adaptations:
1. **10-Foot UI Design**
   - Larger text and buttons for TV viewing distance
   - High contrast colors for TV displays
   - Focus indicators for D-pad navigation
   - TV-safe area considerations

2. **Navigation Patterns**
   ```jsx
   // TV Grid Navigation
   <TVGrid
     data={movies}
     numColumns={6}
     focusable={true}
     onFocus={(item) => setFocusedItem(item)}
     onSelect={(item) => navigateToDetail(item)}
   />
   ```

3. **Focus Management**
   ```jsx
   // Remote Control Focus Handling
   const [focusedIndex, setFocusedIndex] = useState(0);
   
   useTVEventHandler((evt) => {
     switch(evt.eventType) {
       case 'right': setFocusedIndex(i => i + 1); break;
       case 'left': setFocusedIndex(i => i - 1); break;
       case 'select': handleSelection(); break;
     }
   });
   ```

**Deliverables**:
- ✅ All major UI components converted to TV-optimized versions
- ✅ D-pad navigation working across all screens
- ✅ Focus management system implemented
- ✅ TV-specific styling and layout complete

---

### **Phase 4: Video Player & Streaming (Week 4-5)**
**Duration**: 7-10 days  
**Priority**: Critical

#### Video Player Implementation:
```jsx
// TV-Optimized Video Player
import { Video } from 'expo-av';

<Video
  source={{ uri: proxyStreamUrl }}
  style={styles.fullScreenVideo}
  shouldPlay={true}
  controls={true}
  focusable={true}
  onPlaybackStatusUpdate={handlePlaybackUpdate}
  onTVControlEventNavigation={handleRemoteControl}
  resizeMode="contain"
  videoStyle={styles.video}
/>
```

#### Stream Selection for TV:
```jsx
// TV Stream Selector with D-pad navigation
<TVStreamSelector
  streams={parsedStreams}
  onStreamSelect={(stream) => {
    setSelectedStream(stream);
    navigateToPlayer();
  }}
  focusable={true}
  defaultFocusIndex={0}
/>
```

#### Streaming Architecture:
1. **Proxy Service Adaptation**
   - Migrate existing streaming proxy logic
   - Adapt for React Native HTTP client
   - Maintain security and domain validation
   - Keep range request support for seeking

2. **Hardware Acceleration**
   - Configure hardware decoding for TV
   - Optimize for different TV resolutions
   - Handle HDR content properly
   - Ensure smooth playback performance

**Deliverables**:
- ✅ Fully functional TV video player
- ✅ Stream selection working with D-pad navigation
- ✅ Streaming proxy functional in React Native
- ✅ Hardware acceleration configured
- ✅ No content downloading (streaming only)

---

### **Phase 5: Navigation & UX Polish (Week 5-6)**
**Duration**: 7-10 days  
**Priority**: Medium-High

#### TV Navigation System:
```jsx
// Navigation Stack for TV
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

const TVStack = createStackNavigator();

<NavigationContainer>
  <TVStack.Navigator
    screenOptions={{
      headerShown: false,
      gestureEnabled: false,  // Disable touch gestures for TV
    }}
  >
    <TVStack.Screen name="Home" component={TVHomeScreen} />
    <TVStack.Screen name="StreamSelector" component={TVStreamSelector} />
    <TVStack.Screen name="Player" component={TVPlayerScreen} />
  </TVStack.Navigator>
</NavigationContainer>
```

#### Remote Control Features:
1. **Back Button Handling**
   - Proper navigation back stack
   - Exit confirmation dialogs
   - Player controls overlay

2. **Menu Button**
   - Settings access
   - Quality selection during playback
   - Help and about screens

3. **Playback Controls**
   - Play/pause with center button
   - Seeking with left/right arrows
   - Volume control integration

**Deliverables**:
- ✅ Complete TV navigation system
- ✅ Remote control integration
- ✅ Back button and menu handling
- ✅ Settings and configuration screens
- ✅ Smooth user experience flow

---

### **Phase 6: APK Building & Deployment (Week 6-7)**
**Duration**: 7-10 days  
**Priority**: High

#### APK Configuration:
```json
// app.json - TV Configuration
{
  "expo": {
    "name": "HighSeas TV",
    "platforms": ["android"],
    "android": {
      "package": "com.highseas.tv",
      "versionCode": 1,
      "permissions": ["INTERNET", "ACCESS_NETWORK_STATE"],
      "intentFilters": [
        {
          "action": "android.intent.action.MAIN",
          "category": ["android.intent.category.LEANBACK_LAUNCHER"]
        }
      ]
    }
  }
}
```

#### Google Play Console Setup:
1. **App Listing**
   - TV screenshots and promotional materials
   - Content rating and age restrictions
   - Feature descriptions for TV platform
   - Privacy policy and terms of service

2. **Technical Requirements**
   - TV device compatibility
   - Content guidelines compliance
   - Performance benchmarks
   - Security scan results

#### Building & Testing:
```bash
# Build APK for TV
expo build:android --type apk --release-channel production

# Test on different TV devices
- Android TV emulator testing
- Physical Google TV device testing
- Performance profiling
- Memory usage validation
```

**Deliverables**:
- ✅ Production-ready APK file
- ✅ Google Play Console app listing
- ✅ All TV compatibility requirements met
- ✅ Performance testing completed
- ✅ Security and compliance validation

---

### **Phase 7: Testing & Optimization (Week 7-8)**
**Duration**: 7-10 days  
**Priority**: Medium

#### Testing Strategy:
1. **Device Testing**
   - Google Chromecast with Google TV
   - NVIDIA Shield TV
   - Sony/Samsung/LG TV Android TV
   - Various TV resolutions (720p, 1080p, 4K)

2. **Performance Testing**
   - App startup time < 3 seconds
   - Navigation responsiveness
   - Video playback performance
   - Memory usage optimization

3. **User Experience Testing**
   - Remote control responsiveness
   - Navigation intuitiveness
   - Stream selection usability
   - Error handling and recovery

#### Optimization Areas:
```javascript
// Performance optimizations
- Lazy loading of content
- Image caching and optimization
- Navigation state persistence
- Memory leak prevention
- Background processing optimization
```

**Deliverables**:
- ✅ Comprehensive testing report
- ✅ Performance optimization complete
- ✅ User experience validation
- ✅ Bug fixes and polish completed
- ✅ Ready for Google Play Store submission

---

## 📊 Resource Requirements

### **Development Environment**:
- React Native development setup
- Android Studio with TV AVD
- Physical Google TV device for testing
- Google Play Console developer account ($25)

### **Code Reuse Analysis**:
```
Reusable (Minimal Changes):     60%
- Stream parsing logic
- Provider detection
- Quality extraction  
- Caching strategies
- Error handling

Adaptable (Moderate Changes):   25%
- HTTP networking
- State management
- Navigation logic
- Configuration handling

Complete Rewrite:               15%
- UI components
- Platform-specific features
- Video player integration
- TV navigation patterns
```

### **Risk Assessment**:

**Low Risk**:
- Core streaming logic migration
- Basic UI component conversion
- Network request adaptation

**Medium Risk**:
- TV navigation complexity
- Video player hardware integration
- APK building and signing

**High Risk**:
- Google Play Store approval process
- TV-specific performance optimization
- Cross-device compatibility

## 🎯 Success Metrics

### **Technical Metrics**:
- ✅ APK size < 50MB
- ✅ App startup time < 3 seconds  
- ✅ Navigation lag < 100ms
- ✅ Video playback start < 2 seconds
- ✅ Memory usage < 200MB during playback

### **User Experience Metrics**:
- ✅ Stream selection < 30 seconds
- ✅ No crashes during normal usage
- ✅ Intuitive D-pad navigation
- ✅ Quality selection working properly
- ✅ Back button handling functional

### **Deployment Metrics**:
- ✅ Google Play Store approval
- ✅ TV compatibility rating > 90%
- ✅ No security warnings
- ✅ Content policy compliance
- ✅ Performance benchmarks met

## 🚀 Next Steps

1. **Immediate Actions** (This Week):
   - Set up React Native TV development environment
   - Create basic project structure
   - Validate TV emulator and tooling

2. **Short Term** (Next 2 Weeks):
   - Begin streaming service migration
   - Start UI component conversion
   - Implement basic navigation

3. **Long Term** (Next 6-8 Weeks):
   - Complete full migration following this plan
   - Deploy to Google Play Store
   - Launch TV application

This migration plan balances **reusing existing logic** where possible while **optimizing for the TV platform**. The timeline accounts for learning curve, testing requirements, and deployment processes specific to Google TV applications.