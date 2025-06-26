# 📺 Thamaneyah Streaming App

A sophisticated React Native TV application for Android TV and tvOS, built with Expo and optimized for TV remote navigation.

## 🚀 Features

### TV-Optimized UI
- **Netflix-style Interface** with hero sections and horizontal carousels
- **Focus Management** with visual feedback and smooth animations
- **TV Remote Navigation** optimized for both Android TV and Apple TV
- **Dark Theme** designed for television viewing experience

### Core Components
- **Hero Section** - Featured content with backdrop images, gradients, and action buttons
- **Content Carousels** - Horizontal scrolling rows of movies and TV shows
- **Focusable Buttons** - TV-optimized buttons with animation feedback
- **Shimmer Loading** - Elegant loading states for images
- **TypeScript Support** - Full type safety throughout the application

### Navigation & UX
- **Seamless Focus Transitions** between UI elements
- **Auto-scrolling Carousels** that follow focus
- **Visual Focus Indicators** with scale animations and borders
- **My List Functionality** for content management

## 🛠 Technology Stack

- **React Native + Expo** - Cross-platform development
- **TypeScript** - Type safety and better development experience
- **@react-navigation/native** - Navigation management
- **expo-linear-gradient** - Beautiful gradient overlays
- **expo-image** - Optimized image loading with placeholders
- **react-native-reanimated** - Smooth animations
- **react-tv-space-navigation** - TV-specific navigation patterns

## 📱 Platform Support

- ✅ **Android TV** - Full support with Android TV optimizations
- ✅ **Apple TV (tvOS)** - Native tvOS support
- ✅ **Mobile** - Works on phones and tablets for development/testing
- ✅ **Web** - Expo web support for development

## 🏗 Project Structure

```
src/
├── components/
│   ├── common/
│   │   └── FocusableButton.tsx      # TV-optimized button component
│   ├── hero/
│   │   └── HeroSection.tsx          # Featured content hero section
│   └── carousel/
│       └── ContentCarousel.tsx      # Horizontal content carousel
├── screens/
│   └── HomeScreen.tsx               # Main home screen
├── navigation/
│   └── AppNavigator.tsx             # Navigation setup
├── hooks/
│   └── useTVRemote.tsx              # TV remote event handling
├── constants/
│   ├── theme.ts                     # Design system & theme
│   └── mockData.ts                  # Sample content data
└── types/
    └── index.ts                     # TypeScript type definitions
```

## 🎨 Design System

### Colors
- **Primary**: #E50914 (Netflix Red)
- **Secondary**: #B81D24
- **Background**: #141414 (Deep Black)
- **Surface**: #1E1E1E
- **Text**: #FFFFFF
- **Accent**: #F5C518 (IMDb Yellow)

### Typography
- **Title**: 48px bold - Hero titles
- **Heading**: 24px semibold - Section headers
- **Body**: 16px regular - Content text
- **Caption**: 14px regular - Metadata

### Spacing Scale
- **xs**: 4px, **sm**: 8px, **md**: 16px, **lg**: 24px, **xl**: 32px, **xxl**: 48px

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI: `npm install -g @expo/cli`
- Android TV emulator or device
- Apple TV simulator (Mac only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ThamaneyahStreamingApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on TV platforms**
   - **Android TV**: Press `a` in the terminal or use Android TV emulator
   - **Apple TV**: Press `i` in the terminal or use tvOS simulator
   - **Web**: Press `w` for web development

### TV Testing Setup

#### Android TV
1. Enable Developer Options on Android TV
2. Enable USB Debugging
3. Connect via ADB: `adb connect <TV_IP_ADDRESS>`
4. Run: `npm run android`

#### Apple TV (tvOS)
1. Open Xcode and tvOS Simulator
2. Run: `npm run ios`
3. Select Apple TV simulator

## 🎮 TV Remote Controls

### Navigation
- **Arrow Keys**: Navigate between focusable elements
- **Select/Enter**: Activate buttons and select content
- **Back**: Return to previous screen or close modals
- **Menu**: Access main menu (Apple TV)
- **Play/Pause**: Quick play actions

### Focus Management
- Elements automatically scale and highlight when focused
- Smooth transitions between focusable components
- Visual feedback with borders and shadows
- Auto-scrolling in carousels to keep focused items visible

## 🔧 Development

### Adding New Content
1. Update `src/constants/mockData.ts` with new movies/shows
2. Add content to appropriate `ContentRow` arrays
3. Images will load automatically with shimmer placeholders

### Customizing Theme
1. Modify `src/constants/theme.ts` for colors, spacing, typography
2. Focus styles and animations are configured in the same file
3. Components automatically inherit theme values

### Creating New Screens
1. Add screen component to `src/screens/`
2. Update `RootStackParamList` in `src/types/index.ts`
3. Add route to `AppNavigator.tsx`

## 📊 Performance Optimizations

- **Image Caching** with Expo Image
- **Lazy Loading** for off-screen content
- **Optimized Animations** using native driver
- **Memory Management** for large content lists
- **Focus Optimization** to prevent unnecessary re-renders

## 🎯 TV UX Best Practices Implemented

- **10-foot UI Design** - Large text and touch targets
- **Focus Management** - Clear visual hierarchy
- **Overscan Safe Areas** - Content within TV safe zones
- **Remote-First Design** - All interactions work with TV remote
- **Performance First** - Smooth 60fps animations

## 🚀 Deployment

### Building for Production

#### Android TV
```bash
expo build:android --type app-bundle
```

#### Apple TV
```bash
expo build:ios --type archive
```

### Publishing to Stores
- **Google Play Store** - Android TV section
- **App Store** - tvOS category
- Follow platform-specific guidelines for TV apps

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit Pull Request

## 📝 Git Commit Convention

- `feat:` - New features
- `fix:` - Bug fixes
- `style:` - UI/styling changes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Testing
- `docs:` - Documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Netflix** - UI/UX inspiration
- **React Native TV Community** - TV development patterns
- **Expo Team** - Amazing development platform
- **React Navigation** - Excellent navigation library

---

Built with ❤️ for the big screen experience 