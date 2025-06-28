import React, { useState, useCallback } from 'react';
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

  // API Hooks
  const homepage = useHomepage();
  const myList = useMyList();
  const myListOps = useMyListOperations();

  // Hero content changes based on focused item, fallback to first featured item
  const heroContent = focusedContent || homepage.data?.featured?.[0] || null;

  const handlePlayPress = useCallback(() => {
    if (heroContent) {
      // For now, show alert since we don't have actual video URLs
      // In real implementation, you would get playout info and navigate to player
      Alert.alert('Play Content', `Playing: ${heroContent.title}`);
      // TODO: Get playout info and navigate to player
      // const playoutInfo = await api.getPlayout({ contentId: heroContent.id });
      // navigation.navigate('Player', { contentId: heroContent.id, title: heroContent.title });
    } else {
      Alert.alert('Error', 'No content available');
    }
  }, [heroContent]);

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
    Alert.alert(
      'Content Selected',
      `You selected: ${item.title}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Play', 
          onPress: () => {
            Alert.alert('Play Content', `Playing: ${item.title}`);
            // TODO: Get playout info and navigate to player
          }
        },
        { 
          text: 'Details', 
          onPress: () => {
            Alert.alert('Details', `Show details for ${item.title}`);
            // TODO: Navigate to detail screen
          }
        }
      ]
    );
  }, []);

  const handleContentItemFocus = useCallback((item: ContentEntity) => {
    setFocusedContent(item);
    console.log('🎯 Hero content changed to:', item.title); // Debug log
  }, []);

  // Menu handlers
  const handleProfilePress = useCallback(() => {
    Alert.alert('Profile & Settings', 'Navigate to profile and settings');
  }, []);

  const handleHomePress = useCallback(() => {
    Alert.alert('Home', 'Already on home screen');
  }, []);

  const handleMyListPress = useCallback(() => {
    Alert.alert('My List', 'Navigate to my list'); // TODO: Navigate to MyList screen
  }, []);

  const handleContinueWatchingPress = useCallback(() => {
    Alert.alert('Continue Watching', 'Navigate to continue watching');
  }, []);

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
            style={styles.carouselScrollView}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.carouselSection}>
              {homepage.data?.trending && homepage.data.trending.length > 0 && (
                <Carousel
                  title="Trending Now"
                  items={homepage.data.trending}
                  onItemPress={handleContentItemPress}
                  onItemFocus={handleContentItemFocus}
                />
              )}
              
              {homepage.data?.newReleases && homepage.data.newReleases.length > 0 && (
                <Carousel
                  title="New Releases"
                  items={homepage.data.newReleases}
                  onItemPress={handleContentItemPress}
                  onItemFocus={handleContentItemFocus}
                />
              )}
              
              {homepage.data?.recommended && homepage.data.recommended.length > 0 && (
                <Carousel
                  title="Recommended for You"
                  items={homepage.data.recommended}
                  onItemPress={handleContentItemPress}
                  onItemFocus={handleContentItemFocus}
                />
              )}
            </View>

            {/* Bottom padding for better scrolling */}
            <View style={styles.bottomPadding} />
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
    minHeight: 400, // Minimum height for very small screens
  },
  // Carousel Section - Dynamic height (30% of screen height)
  carouselContainer: {
    height: screenHeight * 0.35, // 35% of screen height
    maxHeight: 500, // Maximum height for very large screens
    minHeight: 200, // Minimum height for very small screens
    backgroundColor: theme.colors.background,
  },
  carouselScrollView: {
    flex: 1,
  },
  carouselSection: {
    paddingTop: theme.spacing.lg,
  },
  bottomPadding: {
    height: theme.spacing.xxl,
  },
  // Direction Controls
  directionControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  directionControlsRTL: {
    flexDirection: 'row-reverse',
  },
  directionInfo: {
    flex: 1,
  },
  directionText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  toggleButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
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