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
  Pressable,
  BackHandler,
  TVEventHandler,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
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
import { VTTCue, loadVTTFile, getCurrentSubtitle } from '../utils/vttParser';
import { SubtitleSelector, SubtitleTrack } from '../components/common/SubtitleSelector';

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
  seekDirection?: 'forward' | 'backward' | null;
  subtitleTracks: SubtitleTrack[];
  selectedSubtitleTrack: number;
  showSubtitleModal: boolean;
  currentSubtitle: string | null;
  subtitleCues: VTTCue[];
}

export const VideoPlayerScreen: React.FC = () => {
  const route = useRoute<VideoPlayerScreenRouteProp>();
  const navigation = useNavigation<VideoPlayerScreenNavigationProp>();
  const { contentId, contentTitle, resumeTime = 0 } = route.params;
  const { isRTL } = useDirection();
  
  const videoRef = useRef<VideoRef>(null);
  
  // Animation refs for seek buttons
  const seekBackwardAnimTranslate = useRef(new Animated.Value(0)).current;
  const seekForwardAnimTranslate = useRef(new Animated.Value(0)).current;
  
  // Player state
  const [playerState, setPlayerState] = useState<PlayerState>({
    paused: false, // Start playing
    currentTime: resumeTime,
    duration: 0,
    loading: true,
    buffering: false,
    muted: false,
    lastRemoteAction: undefined,
    seekDirection: null,
    subtitleTracks: [],
    selectedSubtitleTrack: -1, // -1 means no subtitles
    showSubtitleModal: false,
    currentSubtitle: null,
    subtitleCues: [],
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
    setPlayerState(prev => ({ ...prev, paused: newPaused }));
  }, [playerState.paused]);

  // Animate seek button
  const animateSeekButton = useCallback((direction: 'forward' | 'backward') => {
    const translateAnim = direction === 'forward' ? seekForwardAnimTranslate : seekBackwardAnimTranslate;
    const translateValue = direction === 'forward' ? 15 : -15;
    
    console.log(`🎬 Starting ${direction} animation`);
    
    // Stop any existing animation on this button
    translateAnim.stopAnimation();
    
    // Reset to initial position
    translateAnim.setValue(0);
    
    // Set seek direction state
    setPlayerState(prev => ({ ...prev, seekDirection: direction }));
    
    // Quick snap animation - move then snap back
    Animated.sequence([
      Animated.timing(translateAnim, {
        toValue: translateValue,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start((finished) => {
      console.log(`🎬 ${direction} animation finished:`, finished);
      // Clear seek direction after animation
      setPlayerState(prev => ({ ...prev, seekDirection: null }));
    });
  }, [seekForwardAnimTranslate, seekBackwardAnimTranslate]);

  const seekBackward = useCallback(() => {
    console.log(`⏪ seekBackward called - current animation state:`, playerState.seekDirection);
    
    // Prevent multiple calls during animation
    if (playerState.seekDirection === 'backward') {
      console.log('⏪ Ignoring backward seek - already animating');
      return;
    }
    
    const newTime = Math.max(playerState.currentTime - 10, 0);
    console.log(`⏪ Seeking backward to ${Math.floor(newTime)}s`);
    videoRef.current?.seek(newTime);
    setPlayerState(prev => ({ ...prev, currentTime: newTime }));
    animateSeekButton('backward');
  }, [playerState.currentTime, playerState.seekDirection, animateSeekButton]);

  const seekForward = useCallback(() => {
    console.log(`⏩ seekForward called - current animation state:`, playerState.seekDirection);
    
    // Prevent multiple calls during animation
    if (playerState.seekDirection === 'forward') {
      console.log('⏩ Ignoring forward seek - already animating');
      return;
    }
    
    const newTime = Math.min(playerState.currentTime + 10, playerState.duration);
    console.log(`⏩ Seeking forward to ${Math.floor(newTime)}s`);
    videoRef.current?.seek(newTime);
    setPlayerState(prev => ({ ...prev, currentTime: newTime }));
    animateSeekButton('forward');
  }, [playerState.currentTime, playerState.duration, playerState.seekDirection, animateSeekButton]);

  const toggleMute = useCallback(() => {
    const newMuted = !playerState.muted;
    console.log(`${newMuted ? '🔇' : '🔊'} ${newMuted ? 'Muting' : 'Unmuting'} video`);
    setPlayerState(prev => ({ ...prev, muted: newMuted }));
  }, [playerState.muted]);

  const toggleSubtitles = useCallback(() => {
    console.log('📝 Toggle subtitles pressed');
    setPlayerState(prev => ({ ...prev, showSubtitleModal: true }));
  }, []);

  // Load and parse VTT file using utility functions
  const loadSubtitleTrack = useCallback(async (track: SubtitleTrack) => {
    try {
      console.log(`📝 Loading subtitle track: ${track.label} from ${track.url}`);
      const cues = await loadVTTFile(track.url);
      
      console.log(`📝 Loaded ${cues.length} subtitle cues:`, cues.slice(0, 3)); // Log first 3 cues for debugging
      
      setPlayerState(prev => ({
        ...prev,
        subtitleCues: cues,
        currentSubtitle: null
      }));
      
      console.log(`📝 Successfully loaded ${cues.length} subtitle cues for ${track.language}`);
    } catch (error) {
      console.error('📝 Failed to load subtitle track:', error);
      setPlayerState(prev => ({
        ...prev,
        subtitleCues: [],
        currentSubtitle: null
      }));
    }
  }, []);

  const selectSubtitleTrack = useCallback((trackIndex: number) => {
    console.log(`📝 Selected subtitle track: ${trackIndex}`);
    setPlayerState(prev => ({ 
      ...prev, 
      selectedSubtitleTrack: trackIndex,
      showSubtitleModal: false,
      currentSubtitle: null,
      subtitleCues: []
    }));
    
    // Reset focus to controls when modal closes
    setFocusedButton('controls');
    
    // Load VTT file if a track is selected
    if (trackIndex >= 0 && playerState.subtitleTracks[trackIndex]) {
      console.log(`📝 Loading subtitle track: ${playerState.subtitleTracks[trackIndex].label}`);
      loadSubtitleTrack(playerState.subtitleTracks[trackIndex]);
    } else {
      console.log('📝 No subtitles selected or clearing subtitles');
    }
  }, [playerState.subtitleTracks, loadSubtitleTrack]);

  // Video Event Handlers
  const onLoad = useCallback((data: OnLoadData) => {
    console.log('✅ Video loaded successfully:', {
      duration: data.duration,
      naturalSize: data.naturalSize,
      audioTracks: data.audioTracks.length,
      textTracks: data.textTracks.length,
    });
    
    // Use subtitle tracks from playout response instead of video metadata
    const subtitleTracks: SubtitleTrack[] = playout?.subtitleTracks || [];
    
    setPlayerState(prev => ({
      ...prev,
      duration: data.duration,
      loading: false,
      subtitleTracks,
    }));
    
    // Seek to resume time if provided
    if (resumeTime > 0) {
      console.log(`⏭️ Seeking to resume time: ${resumeTime}s`);
      videoRef.current?.seek(resumeTime);
    }
  }, [resumeTime, playout]);

  const onProgress = useCallback((data: OnProgressData) => {
    setPlayerState(prev => {
      const newState = {
        ...prev,
        currentTime: data.currentTime,
      };

      // Update current subtitle based on time using utility function
      if (prev.subtitleCues.length > 0 && prev.selectedSubtitleTrack >= 0) {
        const subtitle = getCurrentSubtitle(prev.subtitleCues, data.currentTime);
        newState.currentSubtitle = subtitle;
        
        // Debug logging for subtitle display
        if (subtitle !== prev.currentSubtitle) {
          console.log(`📝 Subtitle changed at ${data.currentTime.toFixed(1)}s:`, subtitle || 'null');
        }
      } else {
        newState.currentSubtitle = null;
      }

      return newState;
    });
    
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
    // Don't show text overlay for seek actions - they have their own animation
    if (action.includes('Seek')) {
      return;
    }
    
    setPlayerState(prev => ({ ...prev, lastRemoteAction: action }));
    // Clear the action after 1 second
    setTimeout(() => {
      setPlayerState(prev => ({ ...prev, lastRemoteAction: undefined }));
    }, 1000);
  }, []);

  // Track focus state for styling
  const [focusedButton, setFocusedButton] = React.useState<string | null>(null);

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
          // Enter/Select button - toggle play/pause or handle modal
           if (focusedButton !== 'subtitle' && !playerState.showSubtitleModal) {
            togglePlayPause();
          }
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
          break;
          
        case 'down':
          // Down arrow - could be used for volume or other controls
          console.log('📺 Down pressed');
          break;
          
        case 'menu':
          // Menu button - go back or close modal
          if (playerState.showSubtitleModal) {
            console.log('📺 Closing subtitle modal');
            setPlayerState(prev => ({ ...prev, showSubtitleModal: false }));
            setFocusedButton('controls'); // Reset focus when closing modal
          } else {
            console.log('📺 Calling handleBackPress');
            handleBackPress();
          }
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

      {/* Subtitle Display */}
      {playerState.currentSubtitle && (
        <View style={styles.subtitleOverlay}>
          <Text style={styles.subtitleText}>{playerState.currentSubtitle}</Text>
        </View>
      )}

      {/* Debug Info - Remove this after testing */}
      {__DEV__ && (
        <View style={{
          position: 'absolute',
          top: 100,
          left: 20,
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 8,
          borderRadius: 4,
          zIndex: 1000
        }}>
          <Text style={{ color: '#fff', fontSize: 12 }}>
            Selected Track: {playerState.selectedSubtitleTrack}
          </Text>
          <Text style={{ color: '#fff', fontSize: 12 }}>
            Cues Loaded: {playerState.subtitleCues.length}
          </Text>
          <Text style={{ color: '#fff', fontSize: 12 }}>
            Current Subtitle: {playerState.currentSubtitle ? 'YES' : 'NO'}
          </Text>
          <Text style={{ color: '#fff', fontSize: 12 }}>
            Time: {playerState.currentTime.toFixed(1)}s
          </Text>
        </View>
      )}

      {/* Subtitle Selection Modal */}
      <SubtitleSelector
        visible={playerState.showSubtitleModal}
        subtitleTracks={playerState.subtitleTracks}
        selectedSubtitleTrack={playerState.selectedSubtitleTrack}
        onSelectTrack={selectSubtitleTrack}
        onClose={() => {
          setPlayerState(prev => ({ ...prev, showSubtitleModal: false }));
          setFocusedButton('controls'); // Reset focus when closing modal
        }}
      />

      {/* Player Controls */}
      <View style={styles.controlsContainer}>
        {/* Top Bar with Gradient */}
        <LinearGradient
          colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.topBarGradient}
        >
          <View style={[styles.topBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.videoTitle, { 
              marginLeft: isRTL ? 0 : 16, 
              marginRight: isRTL ? 16 : 0,
              textAlign: isRTL ? 'right' : 'left'
            }]} numberOfLines={1}>
              {contentTitle}
            </Text>
            {/* Only show subtitle button if there are subtitle tracks */}
            {playerState.subtitleTracks.length > 0 && (
              <Pressable 
                style={[
                  styles.subtitleButton,
                  focusedButton === 'subtitle' && styles.focusedButton
                ]} 
                onPress={toggleSubtitles}
                onFocus={() => setFocusedButton('subtitle')}
                onBlur={() => setFocusedButton(null)}
                hasTVPreferredFocus={false}
              >
                <Icon 
                  name="language" 
                  size={24} 
                  color="#fff" 
                />
              </Pressable>
            )}
          </View>
        </LinearGradient>

        {/* Bottom Controls with Gradient */}
        <LinearGradient
          colors={['rgba(0,0,0,0.0)', 'rgba(0,0,0,0.5)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.bottomControlsGradient}
        >
          <Pressable 
             hasTVPreferredFocus={!playerState.showSubtitleModal}
             onFocus={() => setFocusedButton('controls')}
             onBlur={() => setFocusedButton(null)}
           >
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
            <TouchableOpacity 
              style={[
                styles.controlButton,
                focusedButton === 'seekBackward' && styles.focusedButton
              ]} 
              onPress={isRTL ? seekForward : seekBackward}
              onFocus={() => setFocusedButton('seekBackward')}
              onBlur={() => setFocusedButton(null)}
            >
              <Animated.View
                style={{
                  transform: [
                    { translateX: isRTL ? seekForwardAnimTranslate : seekBackwardAnimTranslate },
                  ],
                }}
              >
                <Icon 
                  name={isRTL ? 'play-forward' : 'play-back'} 
                  size={32} 
                  color="#fff" 
                />
              </Animated.View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                focusedButton === 'controls' || focusedButton === 'playPause' ? styles.playButtonFocused : styles.playButton,
                focusedButton === 'playPause' && styles.focusedButton
              ]} 
              onPress={togglePlayPause}
              onFocus={() => setFocusedButton('playPause')}
              onBlur={() => setFocusedButton(null)}
            >
              <Icon 
                name={playerState.paused ? 'play' : 'pause'} 
                size={36} 
                color="#fff" 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.controlButton,
                focusedButton === 'seekForward' && styles.focusedButton
              ]} 
              onPress={isRTL ? seekBackward : seekForward}
              onFocus={() => setFocusedButton('seekForward')}
              onBlur={() => setFocusedButton(null)}
            >
              <Animated.View
                style={{
                  transform: [
                    { translateX: isRTL ? seekBackwardAnimTranslate : seekForwardAnimTranslate },
                  ],
                }}
              >
                <Icon 
                  name={isRTL ? 'play-back' : 'play-forward'} 
                  size={32} 
                  color="#fff" 
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
          </Pressable>
        </LinearGradient>
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
  },
  topBarGradient: {
    width: '100%',
    paddingHorizontal: 32,
    paddingVertical: 24,
    paddingTop: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  videoTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitleButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 12,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusedButton: {
    backgroundColor: theme.colors.primary,
  },
  bottomControlsGradient: {
    width: '100%',
    paddingHorizontal: 32,
    paddingBottom: 32,
    paddingTop: 50,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  timeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    minWidth: 60,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    padding: 16,
    marginHorizontal: 12,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
  },
  playButtonFocused: {
    backgroundColor: theme.colors.primary,
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
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

  // Subtitle Display Styles
  subtitleOverlay: {
    position: 'absolute',
    bottom: 120, // Above the bottom controls
    left: 32,
    right: 32,
    alignItems: 'center',
    zIndex: 500,
  },
  subtitleText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    lineHeight: 24,
    maxWidth: '100%',
  },
}); 