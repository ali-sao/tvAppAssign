import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { HeroSection } from '../components/hero/HeroSection';
import { ContentCarousel } from '../components/carousel/ContentCarousel';
import { theme } from '../constants/theme';
import { featuredMovie, contentRows } from '../constants/mockData';
import { Movie, TVShow } from '../types';

export const HomeScreen: React.FC = () => {
  const [myList, setMyList] = useState<string[]>([]);
  const [focusedContent, setFocusedContent] = useState<Movie | TVShow | null>(null);

  const handlePlayPress = useCallback(() => {
    Alert.alert(
      'Play Movie',
      `Playing: ${featuredMovie.title}`,
      [{ text: 'OK' }]
    );
    // Here you would navigate to the video player
    // navigation.navigate('Player', { 
    //   videoUrl: featuredMovie.videoUrl, 
    //   title: featuredMovie.title 
    // });
  }, []);

  const handleTrailerPress = useCallback(() => {
    Alert.alert(
      'Play Trailer',
      `Playing trailer for: ${featuredMovie.title}`,
      [{ text: 'OK' }]
    );
    // Here you would navigate to the video player with trailer
    // navigation.navigate('Player', { 
    //   videoUrl: featuredMovie.trailerUrl, 
    //   title: `${featuredMovie.title} - Trailer` 
    // });
  }, []);

  const handleMyListPress = useCallback(() => {
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
            // Navigate to player or detail screen
            Alert.alert('Playing', item.title);
          }
        },
        { 
          text: 'Details', 
          onPress: () => {
            // Navigate to detail screen
            Alert.alert('Details', `Show details for ${item.title}`);
          }
        }
      ]
    );
  }, []);

  const handleContentItemFocus = useCallback((item: Movie | TVShow) => {
    setFocusedContent(item);
  }, []);

  const isInMyList = myList.includes(featuredMovie.id);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
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
          onMyListPress={handleMyListPress}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
}); 