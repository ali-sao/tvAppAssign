import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, focusStyles, dimensions } from '../../constants/theme';
import { ContentEntity } from '../../types/api';
import { useDirection } from '../../contexts/DirectionContext';

const { width: screenWidth } = Dimensions.get('window');

interface ContentCarouselProps {
  title: string;
  items: ContentEntity[];
  onItemPress: (item: ContentEntity) => void;
  onItemFocus?: (item: ContentEntity) => void;
}

interface CarouselItemProps {
  item: ContentEntity;
  index: number;
  onPress: () => void;
  onFocus?: () => void;
}

const CarouselItem: React.FC<CarouselItemProps> = ({ 
  item, 
  index, 
  onPress, 
  onFocus 
}) => {
  const [focused, setFocused] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focusStyles.scale,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const getItemInfo = () => {
    if (item.type === 'show') {
      return 'TV Series';
    } else if (item.type === 'movie') {
      return 'Movie';
    }
    return item.type.charAt(0).toUpperCase() + item.type.slice(1);
  };

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={onPress}
      onFocus={handleFocus}
      onBlur={handleBlur}
      activeOpacity={0.8}
    >
      <Animated.View 
        style={[
          styles.itemWrapper,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.logoTitleImage }}
            style={styles.poster}
            onLoad={handleImageLoad}
            placeholder={{ blurhash: 'L6PZfSjE.AyE_3t7t7R**0o#DgR4' }}
            transition={300}
          />
          
          {/* Loading shimmer */}
          {!imageLoaded && (
            <View style={styles.shimmerContainer}>
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.shimmer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          )}

          {/* Focus border */}
          {focused && (
            <Animated.View 
              style={[
                styles.focusBorder,
                { opacity: opacityAnim }
              ]} 
            />
          )}

          {/* Rating badge */}
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{item.contentRating}</Text>
          </View>
        </View>

        {/* Item info */}
        <View style={styles.itemInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.meta}>
            {getItemInfo()}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const ContentCarousel: React.FC<ContentCarouselProps> = ({
  title,
  items,
  onItemPress,
  onItemFocus,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isRTL } = useDirection();

  const handleItemPress = useCallback((item: ContentEntity) => {
    onItemPress(item);
  }, [onItemPress]);

  const handleItemFocus = useCallback((item: ContentEntity, index: number) => {
    setCurrentIndex(index);
    onItemFocus?.(item);
    
    // Auto-scroll to keep focused item visible
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [onItemFocus]);

  const renderItem = ({ item, index }: { item: ContentEntity; index: number }) => (
    <CarouselItem
      item={item}
      index={index}
      onPress={() => handleItemPress(item)}
      onFocus={() => handleItemFocus(item, index)}
    />
  );

  const getItemLayout = (data: any, index: number) => ({
    length: dimensions.carouselItemWidth + theme.spacing.md,
    offset: (dimensions.carouselItemWidth + theme.spacing.md) * index,
    index,
  });

  return (
    <View style={styles.container}>
      <Text style={[
        styles.sectionTitle,
        isRTL && styles.sectionTitleRTL
      ]}>
        {title}
      </Text>
      
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ 
              index: info.index, 
              animated: true 
            });
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.heading.fontSize,
    fontWeight: theme.typography.heading.fontWeight as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.xxl,
  },
  sectionTitleRTL: {
    marginLeft: 0,
    marginRight: theme.spacing.xxl,
    textAlign: 'right',
  },
  listContainer: {
    paddingHorizontal: theme.spacing.xxl,
  },
  separator: {
    width: theme.spacing.md,
  },
  itemContainer: {
    width: dimensions.carouselItemWidth,
  },
  itemWrapper: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
  },
  poster: {
    width: dimensions.carouselItemWidth,
    height: dimensions.carouselItemHeight,
    borderRadius: theme.borderRadius.md,
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
  },
  shimmer: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
  },
  focusBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: focusStyles.borderWidth,
    borderColor: focusStyles.borderColor,
    borderRadius: theme.borderRadius.md,
    shadowColor: focusStyles.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: focusStyles.shadowOpacity,
    shadowRadius: focusStyles.shadowRadius,
    elevation: 8,
  },
  ratingBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.background,
  },
  itemInfo: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  meta: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
}); 