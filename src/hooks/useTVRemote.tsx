import { useEffect, useCallback } from 'react';
import { Platform, BackHandler } from 'react-native';

interface TVRemoteEvents {
  onUpPress?: () => void;
  onDownPress?: () => void;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  onSelectPress?: () => void;
  onBackPress?: () => void;
  onMenuPress?: () => void;
  onPlayPausePress?: () => void;
}

export const useTVRemote = (events: TVRemoteEvents) => {
  const handleHardwareBackPress = useCallback(() => {
    if (events.onBackPress) {
      events.onBackPress();
      return true; // Prevent default back behavior
    }
    return false;
  }, [events.onBackPress]);

  useEffect(() => {
    // Handle Android TV back button
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handleHardwareBackPress
      );

      return () => backHandler.remove();
    }
  }, [handleHardwareBackPress]);

  // For more advanced TV remote handling, you would integrate with
  // react-tv-space-navigation or similar TV-specific libraries
  return {
    // Return any utilities needed by components
  };
};

// TV remote key codes for reference
export const TVRemoteKeys = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown', 
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  SELECT: 'Select',
  ENTER: 'Enter',
  BACK: 'Back',
  MENU: 'Menu',
  PLAY_PAUSE: 'PlayPause',
} as const; 