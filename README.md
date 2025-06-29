# 📺 Streaming App

A sophisticated React Native TV application for Android TV and tvOS, built with Expo and optimized for TV remote navigation.

## 🌟 Features

### 📱 **Cross-Platform TV Support**
- **Android TV** - Full Android TV optimizations with leanback UI
- **Apple TV (tvOS)** - Native tvOS support with focus engine
- **Mobile Development** - React Native compatibility for development/testing
- **Web Support** - Expo web support for rapid prototyping

### 🎯 **Advanced TV Navigation**
- **5-Directional Remote Control** - Left/Right seek, Up/Down navigation, Enter/Select actions
- **Focus Management** - Visual focus indicators with smooth animations
- **Hardware Back Button** - Proper Android TV back button handling
- **TV Remote Integration** - Native TVEventHandler with comprehensive key mapping

### 🎬 **Professional Video Player**
- **Multi-Format Support** - DASH, HLS, and Smooth Streaming protocols
- **DRM Integration** - Widevine (Android) and FairPlay (iOS) support
- **Adaptive Streaming** - Automatic quality adjustment based on bandwidth
- **Session Management** - Heartbeat system for tracking playback progress
- **Resume Playback** - Continue watching from where you left off

### 🌐 **Internationalization & Accessibility**
- **RTL/LTR Support** - Full Right-to-Left layout support for Arabic content
- **Dynamic Direction Switching** - Runtime layout direction changes
- **Subtitle System** - WebVTT subtitle parsing and rendering
- **Multi-Language Support (Stashed)** - English and Arabic subtitle tracks

### 🎨 **Netflix-Style UI/UX**
- **Hero Section** - Featured content with cinematic backgrounds
- **Content Carousels** - Horizontal scrolling content rows
- **Gradient Overlays** - Professional visual hierarchy
- **Shimmer Loading** - Elegant loading states
- **Responsive Design (WIP)** - Optimized for various TV screen sizes

---

## 🏗 Architecture

### **Project Structure**

```
src/
├── components/           # Reusable UI components
│   ├── carousel/        # Content carousel components
│   │   ├── Card.tsx     # Individual content cards
│   │   └── Carousel.tsx # Horizontal scrolling carousel
│   ├── common/          # Shared components
│   │   ├── FocusableButton.tsx    # TV-optimized button
│   │   └── SubtitleSelector.tsx   # Subtitle selection modal
│   ├── hero/            # Hero section components
│   │   └── HeroSection.tsx        # Featured content display
│   └── menu/            # Navigation components
│       └── SideMenu.tsx           # Side navigation menu
├── contexts/            # React Context providers
│   ├── DirectionContext.tsx      # RTL/LTR direction management
│   └── MenuContext.tsx            # Menu state management
├── hooks/               # Custom React hooks
│   ├── useStreamingAPI.ts         # API data fetching hooks
│   └── useTVRemote.tsx            # TV remote control hook
├── navigation/          # Navigation configuration
│   └── AppNavigator.tsx           # Stack navigator setup
├── screens/             # Screen components
│   ├── HomeScreen.tsx             # Main dashboard
│   ├── VideoPlayerScreen.tsx      # Video playback screen
│   ├── ContinueWatchingScreen.tsx # Resume watching list
│   ├── MyListScreen.tsx           # User's saved content
│   └── ProfileSettingsScreen.tsx # Settings & preferences
├── services/            # External services
│   ├── api.ts          # Streaming API client
│   └── mockData.ts     # Mock data generation
├── types/               # TypeScript type definitions
│   ├── api.ts          # API response types
│   └── index.ts        # General app types
├── utils/               # Utility functions
│   └── vttParser.ts    # WebVTT subtitle parser
└── constants/           # App constants
    └── theme.ts        # Design system & theming
```

### **Technology Stack**

#### **Core Technologies**
- **React Native TV** - Cross-platform TV app development
- **TypeScript** - Type-safe development
- **Expo SDK 53** - Development platform and tooling
- **React Navigation 7** - Screen navigation management

#### **Video & Media**
- **react-native-video 6.4** - Advanced video playback
- **WebVTT Parser** - Custom subtitle parsing implementation

#### **UI & Animation**
- **expo-linear-gradient** - Gradient backgrounds
- **expo-image** - Optimized image loading
- **react-native-reanimated** - High-performance animations
- **react-native-vector-icons** - Icon library

#### **Data & State Management**
- **AsyncStorage** - Local data persistence
- **React Hooks** - State management
- **Context API** - Global state sharing

---

## 🚀 Installation

### **Prerequisites**

```bash
# Required tools
node >= 18.0.0
npm >= 8.0.0
expo-cli >= 6.0.0

# For Android TV development
Android Studio with Android TV emulator
# OR
Physical Android TV device with ADB enabled

# For Apple TV development (macOS only)
Xcode with tvOS Simulator
# OR
Physical Apple TV device
```

### **Setup**

1. **Clone the repository**
   ```bash
   git clone https://github.com/ali-sao/tvAppAssign.git
   cd ThamaneyahStreamingApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   # General development
   npm start
   
   # Android TV specific
   npm run android
   
   # Apple TV specific (macOS only)
   npm run ios
   ```

4. **Run on devices**
   ```bash
   # Android TV
   npm run android
   
   # Apple TV (macOS only)
   npm run ios
   
   # Web development
   npm run web
   ```

### **TV Simulator Setup**

#### **Android TV Emulator**
```bash
# Create Android TV AVD in Android Studio
# Recommended specs:
# - API Level: 33 (Android 13)
# - Target: Google APIs Intel x86_64 Atom
# - RAM: 2048 MB
# - VM Heap: 512 MB
```

#### **Apple TV Simulator (macOS)**
```bash
# Open Xcode
# Window > Devices and Simulators
# Create new tvOS simulator
# Recommended: Apple TV 4K (3rd generation)
``` 

---

## 🔌 API Integration

The app includes a comprehensive mock API simulating a real streaming service:

### Core Features
- Content Management (movies, shows, episodes)
- My List functionality with AsyncStorage persistence  
- Watch Progress with continue watching
- Session Management with heartbeat tracking
- Search & Browse capabilities (WIP)

### Key Endpoints
```typescript
// Homepage content
const homepage = await streamingAPI.getHomepage();

// Video playback
const playout = await streamingAPI.getPlayout({
  contentId: 123,
  drmSchema: 'widevine',
  streamingProtocol: 'dash',
  deviceType: 'android'
});

// User lists
await streamingAPI.addToMyList(contentId);
const myList = await streamingAPI.getMyList();

// Session tracking
await streamingAPI.sendHeartbeat({
  contentId: 123,
  progressInSeconds: 1500,
  sessionId: 'session_123'
});
```

---

## 🎬 Video Player Features

### Advanced Playback System
- **TV Remote Integration**: 5-directional pad with left/right seek, enter for play/pause
- **Session Management**: Automatic session creation with 5-second heartbeat intervals
- **Continue Watching**: Resume from previous position with modal confirmation
- **Subtitle Support**: WebVTT parsing with English/Arabic tracks
- **Animated Controls**: Seek button animations with directional feedback
- **RTL Support**: Layout direction awareness with progress bar staying LTR

### Player State Management
```typescript
interface PlayerState {
  paused: boolean;
  currentTime: number;
  duration: number;
  loading: boolean;
  buffering: boolean;
  muted: boolean;
  subtitleTracks: SubtitleTrack[];
  selectedSubtitleTrack: number;
  showSubtitleModal: boolean;
  currentSubtitle: string | null;
  sessionId: string | null;
  showContinueWatchingModal: boolean;
}
```

---

## 🌐 RTL/LTR Support

### Comprehensive Direction Management
- **Persistent Direction**: AsyncStorage-backed direction preference
- **Dynamic Switching**: Runtime layout direction changes
- **Component Adaptation**: All UI components respect layout direction
- **Text Support**: Arabic text rendering with proper alignment
- **Video Player**: RTL-aware controls with LTR progress bar

### Implementation
```typescript
const { isRTL, toggleDirection } = useDirection();

const styles = StyleSheet.create({
  container: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
  },
  text: {
    textAlign: isRTL ? 'right' : 'left',
  }
});
```

---

## 🎨 Design System

### Theme Configuration
```typescript
export const theme = {
  colors: {
    primary: '#F5C518',     // IMDb yellow
    secondary: '#B81D24',   // TBC red
    background: '#141414',   // Dark background
    surface: '#1E1E1E',     // Card backgrounds
    text: '#FFFFFF',        // Primary text
    textSecondary: '#CCCCCC', // Secondary text
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  typography: {
    title: { fontSize: 48, fontWeight: 'bold' },
    heading: { fontSize: 16, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: '400' },
  }
};
```

---

## 🔧 Development

### Available Scripts
```bash
npm run prepare           # Install npm modules in legacy dependency mode
npm start                 # Start Expo dev server
npm run android       # Android TV development
npm run ios          # Apple TV development
npm run type-check      # TypeScript checking
npm run lint           # Code linting
```

### TV Remote Debugging
```bash
# Android TV ADB commands
adb shell input keyevent KEYCODE_DPAD_CENTER  # Enter
adb shell input keyevent KEYCODE_DPAD_LEFT    # Left
adb shell input keyevent KEYCODE_DPAD_RIGHT   # Right
```

---

## 🚀 Deployment

### Android TV
1. Build APK/AAB: `npm run build:android`
2. Google Play Console configuration
3. Sideloading: `adb install app-release.apk`

### Apple TV
1. Build archive: `npm run build:ios`
2. App Store Connect upload
3. TestFlight distribution

---

## 🤝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes with proper TypeScript types
4. Test: `npm run lint && npm run type-check`
5. Commit: `git commit -m "feat: add amazing feature"`
6. Create Pull Request

### Requirements
- TypeScript types properly defined
- TV navigation works correctly
- RTL layout supported
- Code passes linting and type checking

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.



**Built for the TV streaming experience**

