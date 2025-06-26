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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HeroSection } from '../components/hero/HeroSection';
import { ContentCarousel } from '../components/carousel/ContentCarousel';
import { SideMenu } from '../components/menu/SideMenu';
import { theme } from '../constants/theme';
import { featuredMovie, contentRows } from '../constants/mockData';
import { Movie, TVShow, RootStackParamList } from '../types';
import { useDirection } from '../contexts/DirectionContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { isRTL, direction, toggleDirection } = useDirection();
  const [myList, setMyList] = useState<string[]>([]);
  const [focusedContent, setFocusedContent] = useState<Movie | TVShow | null>(null);

  const handlePlayPress = useCallback(() => {
    if (featuredMovie.videoUrl) {
      navigation.navigate('Player', {
        videoUrl: featuredMovie.videoUrl,
        title: featuredMovie.title,
      });
    } else {
      Alert.alert('Error', 'Video URL not available');
    }
  }, [navigation]);

  const handleTrailerPress = useCallback(() => {
    if (featuredMovie.trailerUrl) {
      navigation.navigate('Player', {
        videoUrl: featuredMovie.trailerUrl,
        title: `${featuredMovie.title} - Trailer`,
      });
    } else {
      Alert.alert('Error', 'Trailer URL not available');
    }
  }, [navigation]);

  const handleHeroMyListPress = useCallback(() => {
    const isInList = myList.includes(featuredMovie.id);
    if (isInList) {
      setMyList(prev => prev.filter(id => id !== featuredMovie.id));
      Alert.alert('Removed from My List', `${featuredMovie.title} has been removed from your list.`);
    } else {
      setMyList(prev => [...prev, featuredMovie.id]);
      Alert.alert('Added to My List', `${featuredMovie.title} has been added to your list.`);
    }
  }, [myList]);

  const handleContentItemPress = useCallback((item: Movie | TVShow) => {
    Alert.alert(
      'Content Selected',
      `You selected: ${item.title}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Play', 
          onPress: () => {
            if (item.videoUrl) {
              navigation.navigate('Player', {
                videoUrl: item.videoUrl,
                title: item.title,
              });
            } else {
              Alert.alert('Error', 'Video URL not available');
            }
          }
        },
        { 
          text: 'Details', 
          onPress: () => {
            // Navigate to detail screen (can be implemented later)
            Alert.alert('Details', `Show details for ${item.title}`);
          }
        }
      ]
    );
  }, [navigation]);

  const handleContentItemFocus = useCallback((item: Movie | TVShow) => {
    setFocusedContent(item);
  }, []);

  // Menu handlers
  const handleProfilePress = useCallback(() => {
    Alert.alert('Profile & Settings', 'Navigate to profile and settings');
  }, []);

  const handleHomePress = useCallback(() => {
    Alert.alert('Home', 'Already on home screen');
  }, []);

  const handleMyListPress = useCallback(() => {
    Alert.alert('My List', 'Navigate to favorites/my list');
  }, []);

  const handleContinueWatchingPress = useCallback(() => {
    Alert.alert('Continue Watching', 'Navigate to continue watching');
  }, []);

  const isInMyList = myList.includes(featuredMovie.id);

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
        {/* Direction Control & Debug Info */}
        <View style={[styles.directionControls, isRTL && styles.directionControlsRTL]}>
          <View style={styles.directionInfo}>
            <Text style={styles.directionText}>
              {isRTL ? '🔄 RTL Active' : '→ LTR Active'} | Direction: {direction.toUpperCase()}
            </Text>
          </View>
          <Pressable style={styles.toggleButton} onPress={toggleDirection}>
            <Text style={styles.toggleButtonText}>
              Switch to {isRTL ? 'LTR' : 'RTL'}
            </Text>
          </Pressable>
        </View>

        {/* RTL Test Area */}
        <View style={[styles.rtlTestArea, isRTL && styles.rtlTestAreaRTL]}>
          <Text style={[styles.testText, isRTL && styles.testTextRTL]}>
            {isRTL ? 'النص العربي - من اليمين إلى اليسار' : 'English Text - Left to Right'}
          </Text>
          <View style={[styles.testBoxes, isRTL && styles.testBoxesRTL]}>
            <View style={[styles.testBox, { backgroundColor: '#ff4444' }]}>
              <Text style={styles.testBoxText}>1</Text>
            </View>
            <View style={[styles.testBox, { backgroundColor: '#44ff44' }]}>
              <Text style={styles.testBoxText}>2</Text>
            </View>
            <View style={[styles.testBox, { backgroundColor: '#4444ff' }]}>
              <Text style={styles.testBoxText}>3</Text>
            </View>
          </View>
        </View>
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
        {/* Hero Section */}
        <HeroSection
          content={featuredMovie}
          onPlayPress={handlePlayPress}
          onTrailerPress={handleTrailerPress}
          onMyListPress={handleHeroMyListPress}
          isInMyList={isInMyList}
        />

        {/* Content Carousels */}
        <View style={styles.carouselSection}>
          {contentRows.map((contentRow) => (
            <ContentCarousel
              key={contentRow.id}
              contentRow={contentRow}
              onItemPress={handleContentItemPress}
              onItemFocus={handleContentItemFocus}
            />
          ))}
        </View>

        {/* Bottom padding for better scrolling */}
        <View style={styles.bottomPadding} />
      </ScrollView>
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
  scrollView: {
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
}); 