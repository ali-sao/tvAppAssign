import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { FocusableButton } from '../common/FocusableButton';
import { theme, dimensions } from '../../constants/theme';
import { ContentEntity } from '../../types/api';
import { useDirection } from '../../contexts/DirectionContext';

interface HeroContentProps {
  content: ContentEntity;
  onPlayPress: () => void;
  onTrailerPress: () => void;
  onMyListPress: () => void;
  isInMyList: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const HeroSection: React.FC<HeroContentProps> = ({
  content,
  onPlayPress,
  onTrailerPress,
  onMyListPress,
  isInMyList,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isRTL } = useDirection();

  const formatRuntime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const getContentInfo = () => {
    if (content.type === 'show' || content.type === 'episode') {
      // For shows, we don't have season/episode info in ContentEntity, so show type
      return content.type === 'show' ? 'TV Series' : 'Episode';
    } else {
      // Movie or other content - show runtime
      return formatRuntime(content.durationInSeconds);
    }
  };

  const getCastString = (): string => {
    return content.cast.slice(0, 3).join(', ');
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: content.heroImage }}
        style={styles.backgroundImage}
        resizeMode="cover"
        imageStyle={styles.backgroundImageStyle}
        onLoad={() => setImageLoaded(true)}
      >
        {/* Gradient Overlays */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)', theme.colors.background]}
          style={styles.gradientOverlay}
          locations={[0, 0.3, 0.7, 1]}
        />
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.leftGradient}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          locations={[0, 0.3, 0.7, 1]}
        />

        {/* Content */}
        <View style={[
          styles.contentContainer,
          isRTL && styles.contentContainerRTL
        ]}>
          {/* Left Side - Content Info */}
          <View style={[
            styles.leftContent,
            isRTL && styles.leftContentRTL
          ]}>
            <Text style={[
              styles.title,
              isRTL && styles.titleRTL
            ]}>
              {content.title}
            </Text>
            
            <View style={[
              styles.metaInfo,
              isRTL && styles.metaInfoRTL
            ]}>
              <Text style={styles.year}>{content.type.toUpperCase()}</Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.rating}>{content.contentRating}</Text>
              </View>
              <Text style={styles.runtime}>{getContentInfo()}</Text>
            </View>

            <Text style={[
              styles.description,
              isRTL && styles.descriptionRTL
            ]} numberOfLines={4}>
              {content.description}
            </Text>

            <View style={[
              styles.castInfo,
              isRTL && styles.castInfoRTL
            ]}>
              <Text style={styles.castLabel}>Starring: </Text>
              <Text style={styles.castText}>{getCastString()}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <FocusableButton
                title="▶ PLAY"
                variant="primary"
                size="medium"
                onPress={onPlayPress}
                hasTVPreferredFocus={true}
                style={styles.playButton}
              />
              
              <FocusableButton
                title="TRAILER"
                variant="secondary"
                size="medium"
                onPress={onTrailerPress}
                style={styles.trailerButton}
              />
            </View>
          </View>

          {/* Right Side - My List */}
          <View style={styles.rightContent}>
            <View style={styles.myListContainer}>
              <Text style={styles.myListTitle}>MY LIST</Text>
              <FocusableButton
                title={isInMyList ? "✓ ADDED" : "+ ADD"}
                variant="outline"
                size="medium"
                onPress={onMyListPress}
                style={styles.myListButton}
              />
            </View>
          </View>
        </View>

        {/* Large Title Overlay */}
        <View style={styles.titleOverlay}>
          <Text style={styles.largeTitleText}>{content.title}</Text>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Take full height of parent container
    width: '100%', // Use percentage instead of fixed screenWidth
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    height: '100%',
  },
  backgroundImageStyle: {
    resizeMode: 'cover',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  leftGradient: {
    ...StyleSheet.absoluteFillObject,
    width: '70%', // Use percentage instead of screenWidth calculation
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
    justifyContent: 'space-between',
    minHeight: 200, // Ensure minimum content height
  },
  contentContainerRTL: {
    flexDirection: 'row-reverse',
  },
  leftContent: {
    flex: 1,
    justifyContent: 'flex-end',
    maxWidth: '60%', // Use percentage instead of screenWidth calculation
  },
  leftContentRTL: {
    alignItems: 'flex-end',
  },
  rightContent: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingLeft: theme.spacing.xl,
    maxWidth: '35%', // Ensure right content doesn't take too much space
  },
  title: {
    fontSize: theme.typography.title.fontSize,
    fontWeight: theme.typography.title.fontWeight as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  titleRTL: {
    textAlign: 'right',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  metaInfoRTL: {
    flexDirection: 'row-reverse',
  },
  year: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.md,
  },
  ratingBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.md,
  },
  rating: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.background,
  },
  runtime: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
  },
  description: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    lineHeight: 24,
    marginBottom: theme.spacing.lg,
    maxWidth: '90%',
  },
  descriptionRTL: {
    textAlign: 'right',
  },
  castInfo: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xl,
  },
  castInfoRTL: {
    flexDirection: 'row-reverse',
  },
  castLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  castText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  playButton: {
    minWidth: 140,
  },
  trailerButton: {
    minWidth: 120,
  },
  myListContainer: {
    alignItems: 'flex-end',
  },
  myListTitle: {
    fontSize: theme.typography.heading.fontSize,
    fontWeight: theme.typography.heading.fontWeight as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  myListButton: {
    minWidth: 100,
  },
  titleOverlay: {
    position: 'absolute',
    right: theme.spacing.xxl,
    bottom: theme.spacing.xxl,
    opacity: 0.15,
    zIndex: -1,
    maxWidth: '50%', // Prevent overflow on smaller screens
  },
  largeTitleText: {
    fontSize: Math.min(120, screenWidth * 0.15), // Responsive font size
    fontWeight: 'bold',
    color: theme.colors.text,
    letterSpacing: -2,
    textTransform: 'uppercase',
  },
}); 