import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { RootStackParamList } from '../types';
import { theme } from '../constants/theme';
import { useTVRemote } from '../hooks/useTVRemote';
import { usePlayout } from '../hooks/useStreamingAPI';
import { PlayoutRequest } from '../types/api';

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
  const { contentId, contentTitle, playoutData, resumeTime = 0 } = route.params;
  
  const videoRef = useRef<Video>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  // Prepare playout request - memoize to prevent infinite re-renders
  const playoutRequest = useMemo<PlayoutRequest>(() => ({
    contentId,
    drmSchema: Platform.OS === 'ios' ? 'fairplay' : 'widevine',
    streamingProtocol: Platform.OS === 'ios' ? 'hls' : 'dash',
    deviceType: Platform.OS === 'ios' ? 'tvos' : 'android',
  }), [contentId]);

  // Get playout data
  const { data: playout, loading: playoutLoading, error: playoutError } = usePlayout(playoutRequest);

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
      console.log('Saving playback position:', position, 'for content:', contentId);
      // TODO: Call heartbeat API to save progress
      // await streamingAPI.sendHeartbeat({
      //   contentId,
      //   progressInSeconds: position,
      //   sessionId: generateSessionId()
      // });
    } catch (error) {
      console.log('Error saving playback position:', error);
    }
  }, [contentId]);

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
    if (!playout?.mediaURL) return;
    
    setControls(prev => ({
      ...prev,
      error: null,
      loading: true,
    }));
    if (videoRef.current) {
      await videoRef.current.loadAsync({ uri: playout.mediaURL });
    }
  }, [playout?.mediaURL]);

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

  // Initialize video when playout data is available
  useEffect(() => {
    if (playout?.mediaURL && videoRef.current) {
      const loadVideo = async () => {
        try {
          await videoRef.current?.loadAsync({ 
            uri: playout.mediaURL,
            headers: playout.drm ? {
              'User-Agent': 'ThamaneyahStreamingApp/1.0',
              'X-Content-ID': contentId.toString(),
            } : undefined,
          });
          
          // Set initial position if resuming
          if (resumeTime > 0) {
            await videoRef.current?.setPositionAsync(resumeTime * 1000); // Convert to milliseconds
          }
          
          // Start playing
          await videoRef.current?.playAsync();
          setControls(prev => ({ ...prev, paused: false }));
          
          // Hide controls after initial load
          hideControlsAfterDelay();
        } catch (error) {
          console.error('Error loading video:', error);
          setControls(prev => ({
            ...prev,
            error: 'Failed to load video',
            loading: false,
          }));
        }
      };
      
      loadVideo();
    }
  }, [playout?.mediaURL, resumeTime, contentId, hideControlsAfterDelay]);

  // Show loading screen while fetching playout data
  if (playoutLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar hidden />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Preparing video...</Text>
        <Text style={styles.loadingSubText}>{contentTitle}</Text>
      </View>
    );
  }

  // Show error screen if playout failed
  if (playoutError || !playout) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar hidden />
        <Text style={styles.errorTitle}>Unable to Play Video</Text>
        <Text style={styles.errorMessage}>
          {playoutError || 'Failed to get video information'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Video Player */}
      <Video
        ref={videoRef}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={false}
        isLooping={false}
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        useNativeControls={false}
      />

      {/* Loading Overlay */}
      {controls.loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {/* Buffering Overlay */}
      {controls.buffering && !controls.loading && (
        <View style={styles.bufferingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {/* Error Overlay */}
      {controls.error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorTitle}>Playback Error</Text>
          <Text style={styles.errorMessage}>{controls.error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retryVideo}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Player Controls */}
      <Animated.View
        style={[
          styles.controlsContainer,
          { opacity: fadeAnim },
          !controls.visible && styles.hiddenControls,
        ]}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.videoTitle} numberOfLines={1}>
            {contentTitle}
          </Text>
          <View style={styles.spacer} />
        </View>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(controls.currentTime)}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${getProgressPercentage()}%` },
                ]}
              />
            </View>
            <Text style={styles.timeText}>{formatTime(controls.duration)}</Text>
          </View>

          {/* Control Buttons */}
          <View style={styles.controlButtons}>
            <TouchableOpacity style={styles.controlButton} onPress={seekBackward}>
              <Text style={styles.controlButtonText}>⏪</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
              <Text style={styles.playButtonText}>
                {controls.paused ? '▶️' : '⏸️'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={seekForward}>
              <Text style={styles.controlButtonText}>⏩</Text>
            </TouchableOpacity>
          </View>

          {/* Video Info */}
          <View style={styles.videoInfo}>
            <Text style={styles.videoInfoText}>
              {playout.drm ? '🔒 DRM Protected' : '🔓 Free Content'}
            </Text>
            <Text style={styles.videoInfoText}>
              {playout.streamingProtocol?.toUpperCase()} • {Platform.OS === 'ios' ? 'iOS' : 'Android'}
            </Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: screenWidth,
    height: screenHeight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 16,
    fontWeight: '600',
  },
  loadingSubText: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 32,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 32,
  },
  errorTitle: {
    color: theme.colors.error,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 32,
  },
  hiddenControls: {
    pointerEvents: 'none',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  videoTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  spacer: {
    width: 16,
  },
  bottomBar: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    minWidth: 50,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginHorizontal: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlButton: {
    padding: 12,
    marginHorizontal: 8,
  },
  controlButtonText: {
    fontSize: 24,
  },
  playButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  playButtonText: {
    fontSize: 24,
  },
  videoInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoInfoText: {
    color: '#ccc',
    fontSize: 12,
  },
}); 