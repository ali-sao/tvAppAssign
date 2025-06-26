import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { I18nManager, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
type LayoutDirection = 'rtl' | 'ltr';

interface DirectionContextValue {
  isRTL: boolean;
  direction: LayoutDirection;
  toggleDirection: () => Promise<void>;
  setDirection: (direction: LayoutDirection) => Promise<void>;
}

interface DirectionProviderProps {
  children: ReactNode;
}

// Constants
const DIRECTION_STORAGE_KEY = '@thamaneyah_direction';
const DEFAULT_DIRECTION: LayoutDirection = 'rtl'; // RTL as default

// Create Context
const DirectionContext = createContext<DirectionContextValue | undefined>(undefined);

// Direction Provider Component
export const DirectionProvider: React.FC<DirectionProviderProps> = ({ children }) => {
  const [direction, setDirectionState] = useState<LayoutDirection>(DEFAULT_DIRECTION);

  // Initialize direction from storage or use default (RTL)
  useEffect(() => {
    const initializeDirection = async () => {
      try {
        const savedDirection = await AsyncStorage.getItem(DIRECTION_STORAGE_KEY);
        if (savedDirection && (savedDirection === 'rtl' || savedDirection === 'ltr')) {
          await setDirection(savedDirection as LayoutDirection);
        } else {
          // Use default RTL
          await setDirection(DEFAULT_DIRECTION);
        }
      } catch (error) {
        console.warn('Failed to load saved direction:', error);
        // Even on error, use RTL as default
        await setDirection(DEFAULT_DIRECTION);
      }
    };

    initializeDirection();
  }, []);

  // Set direction function
  const setDirection = async (newDirection: LayoutDirection) => {
    try {
      const isRTL = newDirection === 'rtl';
      
      // Update state
      setDirectionState(newDirection);
      
      // Save to storage
      await AsyncStorage.setItem(DIRECTION_STORAGE_KEY, newDirection);
      
      // Update React Native I18nManager
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(isRTL);
      
      console.log(`Direction set to: ${newDirection} (RTL: ${isRTL})`);
      
    } catch (error) {
      console.error('Failed to set direction:', error);
    }
  };

  // Toggle direction function
  const toggleDirection = async () => {
    const newDirection = direction === 'rtl' ? 'ltr' : 'rtl';
    await setDirection(newDirection);
  };

  const contextValue: DirectionContextValue = {
    isRTL: direction === 'rtl',
    direction,
    toggleDirection,
    setDirection,
  };

  return (
    <DirectionContext.Provider value={contextValue}>
      {children}
    </DirectionContext.Provider>
  );
};

// Custom hook to use direction context
export const useDirection = (): DirectionContextValue => {
  const context = useContext(DirectionContext);
  if (context === undefined) {
    throw new Error('useDirection must be used within a DirectionProvider');
  }
  return context;
}; 