import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
  BackHandler,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FlatGrid } from 'react-native-super-grid';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { theme } from '../constants/theme';
import { movies, tvShows } from '../constants/mockData';
import { Movie, TVShow, RootStackParamList } from '../types';
import { useTVRemote } from '../hooks/useTVRemote';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type VideoListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VideoList'>;

interface VideoGridItemProps {
  item: Movie | TVShow;
  index: number;
  onPress: (item: Movie | TVShow) => void;
}

const VideoGridItem: React.FC<VideoGridItemProps> = ({ item, index, onPress }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setFocused(false);
  }, []);

  const getItemInfo = () => {
    if ('seasons' in item) {
      return `${item.seasons} Season${item.seasons > 1 ? 's' : ''}`;
    }
    return `${item.year} • ${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m`;
  };

  const getGenresText = () => {
    return item.genres.slice(0, 2).join(' • ');
  };

  return (
    <SpatialNavigationFocusableView
      onSelect={() => onPress(item)}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <View style={[styles.gridItem, focused && styles.gridItemFocused]}>
        <View style={styles.posterContainer}>
          <ShimmerPlaceholder
            visible={imageLoaded}
            style={styles.poster}
            shimmerColors={[
              'rgba(255,255,255,0.1)', 
              'rgba(255,255,255,0.3)', 
              'rgba(255,255,255,0.1)'
            ]}
          >
            <Image
              source={{ uri: item.posterUrl }}
              style={styles.poster}
              onLoad={() => setImageLoaded(true)}
              placeholder={{ blurhash: 'L6PZfSjE.AyE_3t7t7R**0o#DgR4' }}
              transition={300}
              contentFit="cover"
            />
          </ShimmerPlaceholder>

          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>

          {/* Focus Overlay */}
          {focused && (
            <View style={styles.focusOverlay}>
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                style={styles.gradient}
              />
              <View style={styles.overlayContent}>
                <Text style={styles.overlayGenres}>{getGenresText()}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.itemInfo}>
          <Text style={[styles.title, focused && styles.titleFocused]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.meta, focused && styles.metaFocused]}>
            {getItemInfo()}
          </Text>
        </View>
      </View>
    </SpatialNavigationFocusableView>
  );
};

export const VideoListScreen: React.FC = () => {
  const navigation = useNavigation<VideoListScreenNavigationProp>();
  const [filter, setFilter] = useState<'all' | 'movies' | 'tvshows'>('all');
  const [allContent] = useState<(Movie | TVShow)[]>([...movies, ...tvShows]);

  // TV Remote Control Handler
  useTVRemote({
    onBackPress: () => {
      navigation.goBack();
      return true;
    },
  });

  const getFilteredContent = () => {
    switch (filter) {
      case 'movies':
        return movies;
      case 'tvshows':
        return tvShows;
      default:
        return allContent;
    }
  };

  const handleItemPress = useCallback((item: Movie | TVShow) => {
    if (item.videoUrl) {
      navigation.navigate('Player', {
        videoUrl: item.videoUrl,
        title: item.title,
      });
    } else {
      // Show error or navigate to detail screen
      console.log('No video URL available for:', item.title);
    }
  }, [navigation]);

  const renderFilterButton = (filterType: 'all' | 'movies' | 'tvshows', label: string) => (
    <SpatialNavigationFocusableView
      key={filterType}
      onSelect={() => setFilter(filterType)}
    >
      <View style={[
        styles.filterButton, 
        filter === filterType && styles.filterButtonActive
      ]}>
        <Text style={[
          styles.filterButtonText,
          filter === filterType && styles.filterButtonTextActive
        ]}>
          {label}
        </Text>
      </View>
    </SpatialNavigationFocusableView>
  );

  // Handle Android TV back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.goBack();
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const filteredContent = getFilteredContent();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse Content</Text>
        <Text style={styles.headerSubtitle}>
          {filteredContent.length} {filter === 'all' ? 'titles' : filter}
        </Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('movies', 'Movies')}
        {renderFilterButton('tvshows', 'TV Shows')}
      </View>

      {/* Content Grid */}
      <ScrollView style={styles.gridContainer} showsVerticalScrollIndicator={false}>
        <FlatGrid
          itemDimension={200} // Minimum item width
          data={filteredContent}
          style={styles.grid}
          spacing={theme.spacing.md}
          renderItem={({ item, index }) => (
            <VideoGridItem
              item={item}
              index={index}
              onPress={handleItemPress}
            />
          )}
          keyExtractor={(item) => item.id}
          staticDimension={screenWidth - (theme.spacing.lg * 2)} // Container width
          fixed={false} // Allow flexible item sizing
          maxItemsPerRow={4} // Maximum items per row for TV
        />
      </ScrollView>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Use remote control to navigate • Select to play • Back to return
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: theme.typography.title.fontSize,
    fontWeight: theme.typography.title.fontWeight as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: theme.colors.text,
  },
  gridContainer: {
    flex: 1,
  },
  grid: {
    paddingHorizontal: theme.spacing.lg,
  },
  gridItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    transform: [{ scale: 1 }],
  },
  gridItemFocused: {
    transform: [{ scale: 1.05 }],
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  posterContainer: {
    position: 'relative',
    aspectRatio: 2/3, // Standard poster ratio
  },
  poster: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: theme.borderRadius.md,
    borderTopRightRadius: theme.borderRadius.md,
  },
  ratingBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  ratingText: {
    fontSize: 10,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  focusOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  gradient: {
    flex: 1,
  },
  overlayContent: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    left: theme.spacing.sm,
    right: theme.spacing.sm,
  },
  overlayGenres: {
    fontSize: 11,
    color: theme.colors.text,
    fontWeight: '600',
  },
  itemInfo: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  titleFocused: {
    color: theme.colors.primary,
  },
  meta: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  metaFocused: {
    color: theme.colors.text,
  },
  instructions: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructionText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
}); 