import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, focusStyles, dimensions } from '../../constants/theme';
import { ContentEntity } from '../../types/api';

interface CardProps {
  item: ContentEntity;
  index: number;
  carouselIndex: number;
  onPress: () => void;
  onFocus?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  item, 
  index, 
  carouselIndex,
  onPress, 
  onFocus 
}) => {
  const [focused, setFocused] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.spring(scaleAnim, {
      toValue: focusStyles.scale,
      useNativeDriver: true,
    }).start();
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
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
                locations={[0, 0.5, 1]}
                style={styles.shimmer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          )}

          {/* Focus border - only show when focused */}
          {focused && (
            <View style={styles.focusBorder} />
          )}

          {/* Rating badge */}
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{item.contentRating}</Text>
          </View>
        </View>

        {/* 
        <View style={styles.itemInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.meta}>
            {getItemInfo()}
          </Text>
        </View>
        Item info */}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    width: dimensions.carouselItemWidth,
    paddingVertical: theme.spacing.md,
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