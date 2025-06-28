import React, { useMemo, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Platform,
  Dimensions,
  TouchableOpacity,
  BackHandler,
  TVEventHandler,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Video, { 
  VideoRef, 
  OnLoadData, 
  OnProgressData, 
  OnBufferData,
  OnVideoErrorData,
  ResizeMode,
} from 'react-native-video';
import { RootStackParamList } from '../types';
import { theme } from '../constants/theme';
import { usePlayout } from '../hooks/useStreamingAPI';
import { PlayoutRequest } from '../types/api';
import { useDirection } from '../contexts/DirectionContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type VideoPlayerScreenRouteProp = RouteProp<RootStackParamList, 'Player'>;
type VideoPlayerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Player'>;

interface PlayerState {
  paused: boolean;
  currentTime: number;
  duration: number;
  loading: boolean;
  buffering: boolean;
  muted: boolean;
  lastRemoteAction?: string;
}

export const VideoPlayerScreen: React.FC = () => {
  const route = useRoute<VideoPlayerScreenRouteProp>();
  const navigation = useNavigation<VideoPlayerScreenNavigationProp>();
  const { contentId, contentTitle, resumeTime = 0 } = route.params;
  const { isRTL } = useDirection();
  
  const videoRef = useRef<VideoRef>(null);
  
  // Player state
  const [playerState, setPlayerState] = useState<PlayerState>({
    paused: false, // Start playing
    currentTime: resumeTime,
    duration: 0,
    loading: true,
    buffering: false,
    muted: false,
    lastRemoteAction: undefined,
  });
  
  // Prepare playout request
  const playoutRequest = useMemo<PlayoutRequest>(() => ({
    contentId,
    drmSchema: Platform.OS === 'ios' ? 'fairplay' : 'widevine',
    streamingProtocol: Platform.OS === 'ios' ? 'hls' : 'dash',
    deviceType: Platform.OS === 'ios' ? 'tvos' : 'android',
  }), [contentId]);

  // Fetch playout data
  const { data: playout, loading: playoutLoading, error: playoutError } = usePlayout(playoutRequest);

  // Control handlers
  const handleBackPress = useCallback(() => {
    console.log('🔙 Back button pressed');
    navigation.goBack();
  }, [navigation]);

  const togglePlayPause = useCallback(() => {
    const newPaused = !playerState.paused;
    console.log(`${newPaused ? '⏸️' : '▶️'} ${newPaused ? 'Pausing' : 'Playing'} video`);
    setPlayerState(prev => ({ ...prev, paused: newPaused }));
  }, [playerState.paused]);

  const seekBackward = useCallback(() => {
    const newTime = Math.max(playerState.currentTime - 10, 0);
    console.log(`⏪ Seeking backward to ${Math.floor(newTime)}s`);
    videoRef.current?.seek(newTime);
    setPlayerState(prev => ({ ...prev, currentTime: newTime }));
  }, [playerState.currentTime]);

  const seekForward = useCallback(() => {
    const newTime = Math.min(playerState.currentTime + 10, playerState.duration);
    console.log(`⏩ Seeking forward to ${Math.floor(newTime)}s`);
    videoRef.current?.seek(newTime);
    setPlayerState(prev => ({ ...prev, currentTime: newTime }));
  }, [playerState.currentTime, playerState.duration]);

  const toggleMute = useCallback(() => {
    const newMuted = !playerState.muted;
    console.log(`${newMuted ? '🔇' : '🔊'} ${newMuted ? 'Muting' : 'Unmuting'} video`);
    setPlayerState(prev => ({ ...prev, muted: newMuted }));
  }, [playerState.muted]);

  // Video Event Handlers
  const onLoad = useCallback((data: OnLoadData) => {
    console.log('✅ Video loaded successfully:', {
      duration: data.duration,
      naturalSize: data.naturalSize,
      audioTracks: data.audioTracks.length,
      textTracks: data.textTracks.length,
    });
    
    setPlayerState(prev => ({
      ...prev,
      duration: data.duration,
      loading: false,
    }));
    
    // Seek to resume time if provided
    if (resumeTime > 0) {
      console.log(`⏭️ Seeking to resume time: ${resumeTime}s`);
      videoRef.current?.seek(resumeTime);
    }
  }, [resumeTime]);

  const onProgress = useCallback((data: OnProgressData) => {
    setPlayerState(prev => ({
      ...prev,
      currentTime: data.currentTime,
    }));
    
    // Log progress every 10 seconds to avoid spam
    if (Math.floor(data.currentTime) % 10 === 0) {
      console.log(`⏱️ Progress: ${Math.floor(data.currentTime)}s / ${Math.floor(data.seekableDuration)}s`);
    }
  }, []);

  const onBuffer = useCallback((data: OnBufferData) => {
    console.log('📡 Buffer status:', data.isBuffering ? 'Buffering...' : 'Ready');
    setPlayerState(prev => ({
      ...prev,
      buffering: data.isBuffering,
    }));
  }, []);

  const onError = useCallback((error: OnVideoErrorData) => {
    console.error('❌ Video error:', {
      error: error.error,
      errorString: error.error?.errorString,
      errorCode: error.error?.errorCode,
    });
  }, []);

  const onLoadStart = useCallback(() => {
    console.log('🚀 Video load started');
    setPlayerState(prev => ({ ...prev, loading: true }));
  }, []);

  const onEnd = useCallback(() => {
    console.log('🏁 Video playback ended');
    setPlayerState(prev => ({ ...prev, paused: true }));
  }, []);

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const getProgressPercentage = (): number => {
    return playerState.duration > 0 ? (playerState.currentTime / playerState.duration) * 100 : 0;
  };

  // Show remote action feedback
  const showRemoteAction = useCallback((action: string) => {
    setPlayerState(prev => ({ ...prev, lastRemoteAction: action }));
    // Clear the action after 1 second
    setTimeout(() => {
      setPlayerState(prev => ({ ...prev, lastRemoteAction: undefined }));
    }, 1000);
  }, []);

  // Handle TV remote events
  React.useEffect(() => {
    const handleTVEvent = (event: any) => {
      const { eventType, eventKeyAction } = event;
      console.log('🎮 TV Remote Event:', eventType, 'KeyAction:', eventKeyAction);
      
      // Handle key events (eventKeyAction 1 on this platform)
      if (eventKeyAction !== 1) {
        console.log('🎮 Ignoring event with keyAction:', eventKeyAction);
        return;
      }
      
      switch (eventType) {
        case 'playPause':
        case 'select':
          // Enter/Select button - toggle play/pause
          console.log('📺 Calling togglePlayPause');
          showRemoteAction('Play/Pause');
          togglePlayPause();
          break;
          
        case 'right':
          // Right arrow - seek forward
          console.log('📺 Calling seekForward');
          showRemoteAction('Seek Forward +10s');
          seekForward();
          break;
          
        case 'left':
          // Left arrow - seek backward
          console.log('📺 Calling seekBackward');
          showRemoteAction('Seek Backward -10s');
          seekBackward();
          break;
          
        case 'up':
          // Up arrow - could be used for volume or other controls
          console.log('📺 Up pressed');
          showRemoteAction('Up (Reserved)');
          break;
          
        case 'down':
          // Down arrow - could be used for volume or other controls
          console.log('📺 Down pressed');
          showRemoteAction('Down (Reserved)');
          break;
          
        case 'menu':
          // Menu button - go back
          console.log('📺 Calling handleBackPress');
          showRemoteAction('Back');
          handleBackPress();
          break;
          
        default:
          console.log('🎮 Unhandled TV event:', eventType);
      }
    };
    
    const subscription = TVEventHandler.addListener(handleTVEvent);
    
    return () => {
      subscription?.remove();
    };
  }, [togglePlayPause, seekForward, seekBackward, handleBackPress, showRemoteAction]);

  // Handle hardware back button
  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBackPress();
      return true;
    });
    return () => backHandler.remove();
  }, [handleBackPress]);

  // Debug logging
  // console.log('VideoPlayerScreen - Step 3: Player Controls (RTL-aware)');
  // console.log('Player State:', playerState);
  // console.log('Direction:', { isRTL });

  // Show loading screen while fetching playout data
  if (playoutLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar hidden />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.text}>Fetching video information...</Text>
        <Text style={styles.subText}>{contentTitle}</Text>
        <Text style={styles.debugText}>Content ID: {contentId}</Text>
      </View>
    );
  }

  // Show error screen if playout failed
  if (playoutError || !playout) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar hidden />
        <Text style={styles.errorText}>Failed to fetch video information</Text>
        <Text style={styles.text}>Error: {playoutError || 'No playout data'}</Text>
        <Text style={styles.debugText}>Content ID: {contentId}</Text>
      </View>
    );
  }

  // Main video player screen
  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      {/* Video Player */}
      <Video
        ref={videoRef}
        source={{ 
          uri: playout.mediaURL,
          headers: {
            'User-Agent': 'ThamaneyahStreamingApp/1.0',
          },
        }}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        paused={playerState.paused}
        muted={playerState.muted}
        volume={1.0}
        rate={1.0}
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch="ignore"
        mixWithOthers="duck"
        repeat={false}
        reportBandwidth={true}
        onLoadStart={onLoadStart}
        onLoad={onLoad}
        onProgress={onProgress}
        onBuffer={onBuffer}
        onError={onError}
        onEnd={onEnd}
        progressUpdateInterval={1000}
        controls={false}
      />

      {/* Loading Overlay */}
      {playerState.loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      )}

      {/* Buffering Overlay */}
      {playerState.buffering && !playerState.loading && (
        <View style={styles.bufferingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.bufferingText}>Buffering...</Text>
        </View>
      )}

      {/* Remote Action Feedback */}
      {playerState.lastRemoteAction && (
        <View style={styles.remoteActionOverlay}>
          <Text style={styles.remoteActionText}>{playerState.lastRemoteAction}</Text>
        </View>
      )}

      {/* Player Controls */}
      <View style={styles.controlsContainer}>
        {/* Top Bar */}
        <View style={[styles.topBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>
              {isRTL ? 'رجوع ←' : '← Back'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.videoTitle, { 
            marginLeft: isRTL ? 0 : 16, 
            marginRight: isRTL ? 16 : 0,
            textAlign: isRTL ? 'right' : 'left'
          }]} numberOfLines={1}>
            {contentTitle}
          </Text>
          <TouchableOpacity style={styles.muteButton} onPress={toggleMute}>
            <Text style={styles.muteButtonText}>
              {playerState.muted ? '🔇' : '🔊'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Bar */}
        <View style={styles.bottomBar}>
          {/* Progress Bar */}
          <View style={[styles.progressContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={styles.timeText}>
              {isRTL ? formatTime(playerState.duration) : formatTime(playerState.currentTime)}
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${getProgressPercentage()}%` },
                ]}
              />
            </View>
            <Text style={styles.timeText}>
              {isRTL ? formatTime(playerState.currentTime) : formatTime(playerState.duration)}
            </Text>
          </View>

          {/* Control Buttons */}
          <View style={[styles.controlButtons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity style={styles.controlButton} onPress={isRTL ? seekForward : seekBackward}>
              <Text style={styles.controlButtonText}>{isRTL ? '⏩' : '⏪'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
              <Text style={styles.playButtonText}>
                {playerState.paused ? '▶️' : '⏸️'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={isRTL ? seekBackward : seekForward}>
              <Text style={styles.controlButtonText}>{isRTL ? '⏪' : '⏩'}</Text>
            </TouchableOpacity>
          </View>

          {/* Video Info */}
          <View style={[styles.videoInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.videoInfoText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {playout.drm ? '🔒 DRM Protected' : '🔓 Free Content'}
            </Text>
            <Text style={[styles.videoInfoText, { textAlign: 'center' }]}>
              {playout.streamingProtocol?.toUpperCase()} • {Platform.OS === 'ios' ? 'iOS' : 'Android'}
            </Text>
            <Text style={[styles.videoInfoText, { textAlign: isRTL ? 'left' : 'right' }]}>
              Content ID: {contentId}
            </Text>
          </View>
        </View>
      </View>
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
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  debugText: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
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
  bufferingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  controlsContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 32,
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
  },
  muteButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    borderRadius: 50,
  },
  muteButtonText: {
    color: '#fff',
    fontSize: 24,
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
    overflow: 'hidden',
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
  remoteActionOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -25 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  remoteActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 200,
  },
}); 