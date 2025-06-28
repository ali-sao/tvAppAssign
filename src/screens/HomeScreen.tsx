import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HeroSection } from '../components/hero/HeroSection';
import { Carousel } from '../components/carousel/Carousel';
import { SideMenu } from '../components/menu/SideMenu';
import { theme } from '../constants/theme';
import { useHomepage, useMyList, useMyListOperations } from '../hooks/useStreamingAPI';
import { ContentEntity } from '../types/api';
import { RootStackParamList } from '../types';
import { useDirection } from '../contexts/DirectionContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { isRTL, direction, toggleDirection } = useDirection();
  const [focusedContent, setFocusedContent] = useState<ContentEntity | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // API Hooks
  const homepage = useHomepage();
  const myList = useMyList();
  const myListOps = useMyListOperations();

  // Hero content changes based on focused item, fallback to first featured item
  const heroContent = focusedContent || homepage.data?.featured?.[0] || null;

  const handlePlayPress = useCallback(() => {
    if (heroContent) {
      navigation.navigate('Player', {
        contentId: heroContent.id,
        contentTitle: heroContent.title,
        resumeTime: 0, // Start from beginning, could get from continue watching API
      });
    } else {
      Alert.alert('Error', 'No content available');
    }
  }, [heroContent, navigation]);

  const handleTrailerPress = useCallback(() => {
    if (heroContent?.trailerID) {
      Alert.alert('Trailer', `Playing trailer for: ${heroContent.title}`);
      // TODO: Get playout info for trailer and navigate to player
    } else {
      Alert.alert('Error', 'Trailer not available');
    }
  }, [heroContent]);

  const handleHeroMyListPress = useCallback(async () => {
    if (!heroContent) return;

    const isInList = await myListOps.checkInMyList(heroContent.id);
    
    if (isInList) {
      const success = await myListOps.removeFromMyList(heroContent.id);
      if (success) {
        myList.refetch();
        Alert.alert('Removed from My List', `${heroContent.title} has been removed from your list.`);
      }
    } else {
      const success = await myListOps.addToMyList(heroContent.id);
      if (success) {
        myList.refetch();
        Alert.alert('Added to My List', `${heroContent.title} has been added to your list.`);
      }
    }
  }, [heroContent, myListOps, myList]);

  const handleContentItemPress = useCallback((item: ContentEntity) => {
    // Navigate directly to player with content info
    navigation.navigate('Player', {
      contentId: item.id,
      contentTitle: item.title,
      resumeTime: 0, // Start from beginning, could get from continue watching API
    });
  }, [navigation]);

  const handleContentItemFocus = useCallback((item: ContentEntity, carouselIndex: number, itemIndex: number) => {
    setFocusedContent(item);
    
    // Scroll to bring the focused carousel to the very top using precise calculations
    if (scrollViewRef.current) {
      const carouselHeight = 150+32 + 20; // 150 height + 16*2 padding + 20 title hieght
      
      // Calculate exact scroll position based on carousel index
      const scrollY = carouselIndex * carouselHeight;
      
      scrollViewRef.current.scrollTo({
        y: scrollY,
        animated: false,
      });
    }
  }, []);

  // Menu handlers
  const handleProfilePress = useCallback(() => {
    navigation.navigate('ProfileSettings');
  }, [navigation]);

  const handleHomePress = useCallback(() => {
    Alert.alert('Home', 'Already on home screen');
  }, []);

  const handleMyListPress = useCallback(() => {
    Alert.alert('My List', 'Navigate to my list'); // TODO: Navigate to MyList screen
  }, []);

  const handleContinueWatchingPress = useCallback(() => {
    navigation.navigate('ContinueWatching');
  }, [navigation]);

  // Check if hero content is in my list
  const checkIsInMyList = useCallback(async () => {
    if (heroContent) {
      return await myListOps.checkInMyList(heroContent.id);
    }
    return false;
  }, [heroContent, myListOps]);

  const [isInMyList, setIsInMyList] = useState(false);

  // Update my list status when hero content changes
  React.useEffect(() => {
    if (heroContent) {
      checkIsInMyList().then(setIsInMyList);
    }
  }, [heroContent, checkIsInMyList]);

  // Initialize focused content with first featured item when data loads
  React.useEffect(() => {
    if (homepage.data?.featured?.[0] && !focusedContent) {
      setFocusedContent(homepage.data.featured[0]);
    }
  }, [homepage.data?.featured, focusedContent]);

  // Show loading state
  if (homepage.loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading content...</Text>
      </SafeAreaView>
    );
  }

  // Show error state
  if (homepage.error) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Error loading content</Text>
        <Text style={styles.errorDetail}>{homepage.error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isRTL && styles.containerRTL]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Side Menu */}
      <SideMenu
        onProfilePress={handleProfilePress}
        onHomePress={handleHomePress}
        onMyListPress={handleMyListPress}
        onContinueWatchingPress={handleContinueWatchingPress}
      />
      
            {/* Main Content */}
      <View style={[styles.mainContent, isRTL && styles.mainContentRTL]}>
        {/* Hero Section - Dynamic height (70% of screen height) */}
        <View style={styles.heroContainer}>
          {heroContent && (
            <HeroSection
              content={heroContent}
              onPlayPress={handlePlayPress}
              onTrailerPress={handleTrailerPress}
              onMyListPress={handleHeroMyListPress}
              isInMyList={isInMyList}
            />
          )}
        </View>

        {/* Content Carousels - Scrollable area */}
        <View style={styles.carouselContainer}>
          <ScrollView 
            ref={scrollViewRef}
            style={styles.carouselScrollView}
            showsVerticalScrollIndicator={false}
            bounces={true}
            scrollEnabled={false}
          >
            <View style={styles.carouselSection}>
              {homepage.data?.trending && homepage.data.trending.length > 0 && (
                <Carousel
                  title="Trending Now"
                  items={homepage.data.trending}
                  carouselIndex={0}
                  onItemPress={handleContentItemPress}
                  onItemFocus={handleContentItemFocus}
                />
              )}
              
              {homepage.data?.newReleases && homepage.data.newReleases.length > 0 && (
                <Carousel
                  title="New Releases"
                  items={homepage.data.newReleases}
                  carouselIndex={1}
                  onItemPress={handleContentItemPress}
                  onItemFocus={handleContentItemFocus}
                />
              )}
              
              {homepage.data?.recommended && homepage.data.recommended.length > 0 && (
                <Carousel
                  title="Recommended for You"
                  items={homepage.data.recommended}
                  carouselIndex={2}
                  onItemPress={handleContentItemPress}
                  onItemFocus={handleContentItemFocus}
                />
              )}
            </View>
            <View style={styles.extraPadding} />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  containerRTL: {
    direction: 'rtl',
  },
  mainContent: {
    flex: 1,
    marginLeft: 80, // Collapsed menu width
  },
  mainContentRTL: {
    marginLeft: 0,
    marginRight: 80, // Collapsed menu width
  },
  // Hero Section - Dynamic height (70% of screen height)
  heroContainer: {
    height: screenHeight * 0.65, // 65% of screen height
    maxHeight: 700, // Maximum height for very large screens
  },
  // Carousel Section - Dynamic height (30% of screen height)
  carouselContainer: {
    height: screenHeight * 0.5, // 35% of screen height
    // maxHeight: 500, // Maximum height for very large screens
    // minHeight: 200, // Minimum height for very small screens
    // backgroundColor: theme.colors.background,
    position: 'absolute',
    top: screenHeight * 0.65,
    left: 0,
    zIndex: 10,
  },
  carouselScrollView: {
    flex: 1,
  },
  carouselSection: {
    // paddingTop: theme.spacing.lg,
  },
  extraPadding: {
    height:  150 + (16 * 2) + 20,
  },
  // RTL Test Area
  rtlTestArea: {
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  rtlTestAreaRTL: {
    alignItems: 'flex-end',
  },
  testText: {
    color: theme.colors.text,
    fontSize: 16,
    marginBottom: theme.spacing.md,
    textAlign: 'left',
  },
  testTextRTL: {
    textAlign: 'right',
  },
  testBoxes: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  testBoxesRTL: {
    flexDirection: 'row-reverse',
  },
  testBox: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  testBoxText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Loading and Error States
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: 16,
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  errorDetail: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
}); 