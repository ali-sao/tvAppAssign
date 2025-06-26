import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  StatusBar,
  BackHandler,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { RootStackParamList } from '../types';
import { theme } from '../constants/theme';
import { useTVRemote } from '../hooks/useTVRemote';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type VideoPlayerScreenRouteProp = RouteProp<RootStackParamList, 'Player'>;
type VideoPlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Player'>;

interface PlayerControls {
  visible: boolean;
  paused: boolean;
  currentTime: number;
  duration: number;
  loading: boolean;
  error: string | null;
  buffering: boolean;
}

export const VideoPlayerScreen: React.FC = () => {
  const route = useRoute<VideoPlayerScreenRouteProp>();
  const navigation = useNavigation<VideoPlayerScreenNavigationProp>();
  const { videoUrl, title, resumeTime = 0 } = route.params;
  
  const videoRef = useRef<Video>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  const [controls, setControls] = useState<PlayerControls>({
    visible: true,
    paused: false,
    currentTime: resumeTime,
    duration: 0,
    loading: true,
    error: null,
    buffering: false,
  });

  const hideControls = useCallback(() => {
    setControls(prev => ({ ...prev, visible: false }));
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Auto-hide controls after 5 seconds
  const hideControlsAfterDelay = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      hideControls();
    }, 5000);
  }, [hideControls]);

  const showControls = useCallback(() => {
    setControls(prev => ({ ...prev, visible: true }));
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    hideControlsAfterDelay();
  }, [hideControlsAfterDelay, fadeAnim]);

  // Save playback position for resume functionality
  const savePlaybackPosition = useCallback(async (position: number) => {
    try {
      // In a real app, you would save this to AsyncStorage or your backend
      console.log('Saving playback position:', position);
    } catch (error) {
      console.log('Error saving playback position:', error);
    }
  }, []);

  const handleBackPress = useCallback((): boolean => {
    // Save current position before exiting
    savePlaybackPosition(controls.currentTime);
    navigation.goBack();
    return true;
  }, [savePlaybackPosition, controls.currentTime, navigation]);

  const togglePlayPause = useCallback(async (): Promise<void> => {
    if (videoRef.current) {
      if (controls.paused) {
        await videoRef.current.playAsync();
      } else {
        await videoRef.current.pauseAsync();
      }
      setControls(prev => ({ ...prev, paused: !prev.paused }));
      showControls();
    }
  }, [controls.paused, showControls]);

  const seekBackward = useCallback(async (): Promise<void> => {
    if (videoRef.current) {
      const newTime = Math.max(controls.currentTime - 10000, 0); // expo-av uses milliseconds
      await videoRef.current.setPositionAsync(newTime);
      setControls(prev => ({ ...prev, currentTime: newTime / 1000 }));
      showControls();
    }
  }, [controls.currentTime, showControls]);

  const seekForward = useCallback(async (): Promise<void> => {
    if (videoRef.current) {
      const newTime = Math.min(controls.currentTime + 10000, controls.duration * 1000);
      await videoRef.current.setPositionAsync(newTime);
      setControls(prev => ({ ...prev, currentTime: newTime / 1000 }));
      showControls();
    }
  }, [controls.currentTime, controls.duration, showControls]);

  // TV Remote Control Handler
  useTVRemote({
    onBackPress: () => handleBackPress(),
    onSelectPress: () => void togglePlayPause(),
    onLeftPress: () => void seekBackward(),
    onRightPress: () => void seekForward(),
    onUpPress: () => showControls(),
    onDownPress: () => showControls(),
    onPlayPausePress: () => void togglePlayPause(),
  });

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setControls(prev => ({
        ...prev,
        duration: (status.durationMillis || 0) / 1000,
        currentTime: (status.positionMillis || 0) / 1000,
        loading: false,
        buffering: status.isBuffering || false,
        error: null,
      }));

      // Auto-save progress every 30 seconds
      const currentSeconds = Math.floor((status.positionMillis || 0) / 1000);
      if (currentSeconds % 30 === 0) {
        savePlaybackPosition(currentSeconds);
      }
    } else if (status.error) {
      setControls(prev => ({
        ...prev,
        error: 'Failed to load video. Please check your connection and try again.',
        loading: false,
      }));
    }
  }, [savePlaybackPosition]);

  const retryVideo = useCallback(async () => {
    setControls(prev => ({
      ...prev,
      error: null,
      loading: true,
    }));
    if (videoRef.current) {
      await videoRef.current.loadAsync({ uri: videoUrl });
    }
  }, [videoUrl]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    return controls.duration > 0 ? (controls.currentTime / controls.duration) * 100 : 0;
  };

  // Handle hardware back button for Android TV
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [handleBackPress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      // Save final position
      savePlaybackPosition(controls.currentTime);
    };
  }, [controls.currentTime, savePlaybackPosition]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Video Player */}
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: videoUrl }}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={!controls.paused}
        isLooping={false}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        useNativeControls={false}
        volume={1.0}
        isMuted={false}
        onLoad={() => {
          setControls(prev => ({ ...prev, loading: false }));
          hideControlsAfterDelay();
        }}
        onError={() => {
          setControls(prev => ({
            ...prev,
            error: 'Failed to load video. Please check your connection and try again.',
            loading: false,
          }));
        }}
      />

      {/* Loading Spinner */}
      {(controls.loading || controls.buffering) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>
            {controls.loading ? 'Loading video...' : 'Buffering...'}
          </Text>
        </View>
      )}

      {/* Error State */}
      {controls.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Playback Error</Text>
          <Text style={styles.errorMessage}>{controls.error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={retryVideo}
            hasTVPreferredFocus
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Player Controls Overlay */}
      {controls.visible && !controls.error && (
        <Animated.View style={[styles.controlsOverlay, { opacity: fadeAnim }]}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.videoTitle} numberOfLines={1}>
              {title}
            </Text>
            <View style={styles.spacer} />
          </View>

          {/* Center Play/Pause Button */}
          <View style={styles.centerControls}>
            <TouchableOpacity 
              style={styles.playPauseButton}
              onPress={() => void togglePlayPause()}
              hasTVPreferredFocus
            >
              <Text style={styles.playPauseText}>
                {controls.paused ? '▶️' : '⏸️'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>
                {formatTime(controls.currentTime)} / {formatTime(controls.duration)}
              </Text>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${getProgressPercentage()}%` }
                  ]} 
                />
              </View>
            </View>

            {/* Seek Controls */}
            <View style={styles.seekControls}>
              <TouchableOpacity style={styles.seekButton} onPress={() => void seekBackward()}>
                <Text style={styles.seekButtonText}>⏪ 10s</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.seekButton} onPress={() => void seekForward()}>
                <Text style={styles.seekButtonText}>10s ⏩</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: 18,
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: theme.spacing.xl,
  },
  errorTitle: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  errorMessage: {
    color: theme.colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  backButtonText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  videoTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '600',
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  spacer: {
    width: 40,
  },
  centerControls: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  playPauseText: {
    fontSize: 32,
  },
  bottomControls: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: theme.spacing.lg,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  timeText: {
    color: theme.colors.text,
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: theme.spacing.md,
  },
  progressBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  seekControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  seekButton: {
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.sm,
  },
  seekButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
}); 