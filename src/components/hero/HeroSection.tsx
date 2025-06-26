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
import { HeroContentProps, Movie, TVShow } from '../../types';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const HeroSection: React.FC<HeroContentProps> = ({
  content,
  onPlayPress,
  onTrailerPress,
  onMyListPress,
  isInMyList,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatRuntime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getContentInfo = () => {
    if ('seasons' in content) {
      // TV Show
      const tvShow = content as TVShow;
      return `${tvShow.seasons} Season${tvShow.seasons > 1 ? 's' : ''} • ${tvShow.episodes} Episodes`;
    } else {
      // Movie
      const movie = content as Movie;
      return formatRuntime(movie.runtime);
    }
  };

  const getCastString = (): string => {
    return content.cast.slice(0, 3).map(actor => actor.name).join(', ');
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: content.backdropUrl }}
        style={styles.backgroundImage}
        resizeMode="cover"
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
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          locations={[0, 1]}
        />

        {/* Content */}
        <View style={styles.contentContainer}>
          {/* Left Side - Content Info */}
          <View style={styles.leftContent}>
            <Text style={styles.title}>{content.title}</Text>
            
            <View style={styles.metaInfo}>
              <Text style={styles.year}>{content.year}</Text>
              <View style={styles.ratingBadge}>
                <Text style={styles.rating}>{content.rating}</Text>
              </View>
              <Text style={styles.runtime}>{getContentInfo()}</Text>
            </View>

            <Text style={styles.description} numberOfLines={4}>
              {content.description}
            </Text>

            <View style={styles.castInfo}>
              <Text style={styles.castLabel}>Starring: </Text>
              <Text style={styles.castText}>{getCastString()}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <FocusableButton
                title="▶ PLAY"
                variant="primary"
                size="large"
                onPress={onPlayPress}
                hasTVPreferredFocus={true}
                style={styles.playButton}
              />
              
              <FocusableButton
                title="TRAILER"
                variant="secondary"
                size="large"
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
    height: dimensions.heroHeight,
    width: screenWidth,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  leftGradient: {
    ...StyleSheet.absoluteFillObject,
    width: screenWidth * 0.7,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.xxl,
    justifyContent: 'space-between',
  },
  leftContent: {
    flex: 1,
    justifyContent: 'flex-end',
    maxWidth: screenWidth * 0.6,
  },
  rightContent: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingLeft: theme.spacing.xl,
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
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
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
  castInfo: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xl,
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
  },
  largeTitleText: {
    fontSize: 120,
    fontWeight: 'bold',
    color: theme.colors.text,
    letterSpacing: -2,
    textTransform: 'uppercase',
  },
}); 