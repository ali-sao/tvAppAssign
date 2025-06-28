import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { VideoPlayerScreen } from '../screens/VideoPlayerScreen';
import { ProfileSettingsScreen } from '../screens/ProfileSettingsScreen';
import { ContinueWatchingScreen } from '../screens/ContinueWatchingScreen';
import { RootStackParamList } from '../types';
import { theme } from '../constants/theme';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.surface,
          notification: theme.colors.accent,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '900',
          },
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: false, // Disable gestures for TV
          cardStyleInterpolator: ({ current }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'Home',
          }}
        />
        <Stack.Screen 
          name="Player" 
          component={VideoPlayerScreen}
          options={{
            title: 'Video Player',
          }}
        />
        <Stack.Screen 
          name="ProfileSettings" 
          component={ProfileSettingsScreen}
          options={{
            title: 'Profile & Settings',
          }}
        />
        <Stack.Screen 
          name="ContinueWatching" 
          component={ContinueWatchingScreen}
          options={{
            title: 'Continue Watching',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 