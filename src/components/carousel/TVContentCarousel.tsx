import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { SpatialNavigationFocusableView } from 'react-tv-space-navigation';
import { LinearGradient } from 'expo-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { theme, focusStyles, dimensions } from '../../constants/theme';
import { ContentRow, Movie, TVShow } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

interface TVContentCarouselProps {
  contentRow: ContentRow;
  onItemPress: (item: Movie | TVShow) => void;
  onItemFocus?: (item: Movie | TVShow) => void;
  isFirstRow?: boolean; // To set TV focus preference
}

interface TVCarouselItemProps {
  item: Movie | TVShow;
  index: number;
  onPress: () => void;
  onFocus?: () => void;
  isFirstItem?: boolean;
}

const TVCarouselItem: React.FC<TVCarouselItemProps> = ({ 
  item, 
  index, 
  onPress, 
  onFocus,
  isFirstItem = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [focused, setFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = useCallback(() => {
    setFocused(true);
    onFocus?.();
    
    // Animate focus effects
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focusStyles.scale,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [onFocus, scaleAnim, opacityAnim]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    
    // Animate blur effects
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const getItemInfo = () => {
    if ('seasons' in item) {
      return `${item.seasons} Season${item.seasons > 1 ? 's' : ''}`;
    }
    return item.year.toString();
  };

  const getGenresText = () => {
    return item.genres.slice(0, 2).join(' • ');
  };

  return (
    <SpatialNavigationFocusableView
      onSelect={onPress}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <Animated.View 
        style={[
          styles.itemContainer,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <View style={styles.imageContainer}>
          {/* Shimmer loading effect */}
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
              onLoad={handleImageLoad}
              placeholder={{ blurhash: 'L6PZfSjE.AyE_3t7t7R**0o#DgR4' }}
              transition={300}
              contentFit="cover"
            />
          </ShimmerPlaceholder>

          {/* Focus border with glow effect */}
          <Animated.View 
            style={[
              styles.focusBorder,
              { 
                opacity: opacityAnim,
                shadowOpacity: focused ? 0.8 : 0,
              }
            ]} 
          />

          {/* Rating badge */}
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>

          {/* Gradient overlay for better text readability */}
          {focused && (
            <Animated.View style={[styles.gradientOverlay, { opacity: opacityAnim }]}>
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                style={styles.gradient}
              />
            </Animated.View>
          )}
        </View>

        {/* Item info */}
        <View style={styles.itemInfo}>
          <Text style={[styles.title, focused && styles.titleFocused]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.meta, focused && styles.metaFocused]}>
            {getItemInfo()} • {getGenresText()}
          </Text>
          
          {/* Show additional info when focused */}
          {focused && (
            <Animated.View style={[styles.extraInfo, { opacity: opacityAnim }]}>
              <Text style={styles.description} numberOfLines={3}>
                {item.description}
              </Text>
            </Animated.View>
          )}
        </View>
      </Animated.View>
    </SpatialNavigationFocusableView>
  );
};

export const TVContentCarousel: React.FC<TVContentCarouselProps> = ({
  contentRow,
  onItemPress,
  onItemFocus,
  isFirstRow = false,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleItemPress = useCallback((item: Movie | TVShow) => {
    onItemPress(item);
  }, [onItemPress]);

  const handleItemFocus = useCallback((item: Movie | TVShow, index: number) => {
    setCurrentIndex(index);
    onItemFocus?.(item);
    
    // Auto-scroll to keep focused item visible with padding
    if (flatListRef.current) {
      const itemWidth = dimensions.carouselItemWidth + theme.spacing.md;
      const screenCenter = screenWidth / 2;
      const itemCenter = (index * itemWidth) + (itemWidth / 2);
      const scrollOffset = itemCenter - screenCenter;
      
      flatListRef.current.scrollToOffset({
        offset: Math.max(0, scrollOffset),
        animated: true,
      });
    }
  }, [onItemFocus]);

  const renderItem = useCallback(({ item, index }: { item: Movie | TVShow; index: number }) => (
    <TVCarouselItem
      item={item}
      index={index}
      onPress={() => handleItemPress(item)}
      onFocus={() => handleItemFocus(item, index)}
      isFirstItem={isFirstRow && index === 0}
    />
  ), [handleItemPress, handleItemFocus, isFirstRow]);

  const keyExtractor = useCallback((item: Movie | TVShow) => item.id, []);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: dimensions.carouselItemWidth + theme.spacing.md,
    offset: (dimensions.carouselItemWidth + theme.spacing.md) * index,
    index,
  }), []);

  return (
    <View style={styles.container}>
      {/* Section header */}
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>{contentRow.title}</Text>
        <View style={styles.itemCounter}>
          <Text style={styles.counterText}>
            {currentIndex + 1} of {contentRow.items.length}
          </Text>
        </View>
      </View>
      
      {/* Horizontal scrolling carousel */}
      <FlatList
        ref={flatListRef}
        data={contentRow.items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        getItemLayout={getItemLayout}
        initialNumToRender={5}
        maxToRenderPerBatch={10}
        windowSize={10}
        removeClippedSubviews={true}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={dimensions.carouselItemWidth + theme.spacing.md}
        snapToAlignment="start"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xl,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.heading.fontSize,
    fontWeight: theme.typography.heading.fontWeight as any,
    color: theme.colors.text,
  },
  itemCounter: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  counterText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  flatListContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  itemContainer: {
    width: dimensions.carouselItemWidth,
    marginRight: theme.spacing.md,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  poster: {
    width: dimensions.carouselItemWidth,
    height: dimensions.carouselItemHeight,
    borderRadius: theme.borderRadius.md,
  },
  focusBorder: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderWidth: focusStyles.borderWidth,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md + 3,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 10,
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
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  gradient: {
    flex: 1,
  },
  itemInfo: {
    paddingTop: theme.spacing.sm,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  titleFocused: {
    color: theme.colors.primary,
    fontSize: 16,
  },
  meta: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  metaFocused: {
    color: theme.colors.text,
  },
  extraInfo: {
    marginTop: theme.spacing.xs,
  },
  description: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 14,
  },
}); 