import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDirection } from '../../contexts/DirectionContext';
import { useMenu } from '../../contexts/MenuContext';
import { theme } from '../../constants/theme';

const { height: screenHeight } = Dimensions.get('window');

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
  routeName?: string; // Route name to match for active state
}

interface SideMenuProps {
  onProfilePress: () => void;
  onHomePress: () => void;
  onMyListPress: () => void;
  onContinueWatchingPress: () => void;
  onBrowsePress?: () => void;
  onSearchPress?: () => void;
  onDownloadsPress?: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  onProfilePress,
  onHomePress,
  onMyListPress,
  onContinueWatchingPress,
  onBrowsePress,
  onSearchPress,
  onDownloadsPress,
}) => {
  const route = useRoute();
  const { isRTL } = useDirection();
  const { setMenuFocused } = useMenu();
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showText, setShowText] = useState(false);
  
  // Animation values
  const menuWidthAnim = useRef(new Animated.Value(MENU_COLLAPSED_WIDTH)).current;
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get current route name
  const currentRouteName = route.name;
  
  // Helper function to check if menu item is active
  const isMenuItemActive = (item: MenuItem): boolean => {
    return item.routeName === currentRouteName;
  };

  const menuItems: MenuItem[] = [
    {
      id: 'home',
      icon: 'home-outline',
      label: 'Home',
      onPress: onHomePress,
      routeName: 'Home',
    },
    {
      id: 'browse',
      icon: 'grid-outline',
      label: 'Browse',
      onPress: onBrowsePress || (() => {}),
      routeName: 'Browse',
    },
    {
      id: 'search',
      icon: 'search-outline',
      label: 'Search',
      onPress: onSearchPress || (() => {}),
      routeName: 'Search',
    },
    {
      id: 'mylist',
      icon: 'bookmark-outline',
      label: 'My List',
      onPress: onMyListPress,
      routeName: 'MyList',
    },
    {
      id: 'continue',
      icon: 'play-circle-outline',
      label: 'Continue Watching',
      onPress: onContinueWatchingPress,
      routeName: 'ContinueWatching',
    },
    {
      id: 'profile',
      icon: 'person-circle-outline',
      label: 'Profile & Settings',
      onPress: onProfilePress,
      // No routeName - this is a modal/action, not a route
    },
  ];

  // Handle menu expansion/collapse
  useEffect(() => {
    const shouldExpand = focusedIndex >= 0;
    const wasExpanded = isExpanded;
    
    // Only animate when transitioning between expanded/collapsed states
    if (shouldExpand && !wasExpanded) {
      // Entering menu: expand
      setIsExpanded(true);
      Animated.timing(menuWidthAnim, {
        toValue: MENU_EXPANDED_WIDTH,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        setShowText(true);
      });
    } else if (!shouldExpand && wasExpanded) {
      // Leaving menu: collapse
      setShowText(false);
      setIsExpanded(false);
      Animated.timing(menuWidthAnim, {
        toValue: MENU_COLLAPSED_WIDTH,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
    // If moving between menu items (shouldExpand is still true), do nothing
  }, [focusedIndex, isExpanded, menuWidthAnim]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const handleFocus = (index: number) => {
    // Clear any pending blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setFocusedIndex(index);
    setMenuFocused(true);
  };

  const handleBlur = () => {
    // Delay the blur to avoid flashing when moving between items
    blurTimeoutRef.current = setTimeout(() => {
      setFocusedIndex(-1);
      setMenuFocused(false);
    }, 50); // Small delay to allow focus to move to another menu item
  };

  return (
    <Animated.View style={[
      styles.container,
      isRTL ? styles.containerRTL : styles.containerLTR,
      { width: menuWidthAnim }
    ]}>
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 1)', 
          'rgba(0, 0, 0, 1)', 
          'rgba(0, 0, 0, 0.8)', 
          'rgba(0, 0, 0, 0.1)'
        ]}
        locations={[0, 0.65, 0.85, 1]}
        start={isRTL ? { x: 1, y: 0 } : { x: 0, y: 0 }}
        end={isRTL ? { x: 0, y: 0 } : { x: 1, y: 0 }}
        style={styles.gradientContainer}
      >
        <View style={styles.menuContent}>
          {/* Menu Items */}
          <View style={styles.menuItems}>
            {menuItems.map((item, index) => {
              const isFocused = focusedIndex === index;
              const isActive = isMenuItemActive(item);
              
              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.menuItem,
                    isRTL && styles.menuItemRTL
                  ]}
                  onPress={item.onPress}
                  onFocus={() => handleFocus(index)}
                  onBlur={handleBlur}
                >
                  {isFocused && (
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0)']}
                      start={isRTL ? { x: 1, y: 0 } : { x: 0, y: 0 }}
                      end={isRTL ? { x: 0, y: 0 } : { x: 1, y: 0 }}
                      style={styles.menuItemFocusedGradient}
                    />
                  )}
                                  <Icon
                    name={item.icon}
                    size={24}
                    style={[
                      styles.menuIcon,
                      isRTL && styles.menuIconRTL,
                      isActive && styles.menuIconActive,
                      isFocused && styles.menuIconFocused
                    ]}
                  />
                  {showText && (
                    <Text style={[
                      styles.menuLabel,
                      isRTL && styles.menuLabelRTL,
                      isActive && styles.menuLabelActive,
                      isFocused && styles.menuLabelFocused,
                    ]}>
                      {item.label}
                    </Text>
                  )}
                              </Pressable>
              );
            })}
            </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const MENU_EXPANDED_WIDTH = 380;
const MENU_COLLAPSED_WIDTH = 76;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 1000,
  },
  gradientContainer: {
    flex: 1,
  },
  containerLTR: {
    left: 0,
  },
  containerRTL: {
    right: 0,
    borderLeftWidth: 2,
  },
  menuContent: {
    flex: 1,
    paddingVertical: theme.spacing.xl,
  },
  menuItems: {
    flex: 1,
    paddingTop: theme.spacing.lg,
  },
  menuItem: {
    position: 'relative',
    height: 56,
    // marginVertical: theme.spacing.xs,
    marginHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  menuItemRTL: {
    // RTL handled by icon and label positioning
  },
  menuItemFocusedGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: theme.borderRadius.md,
  },
  menuIcon: {
    position: 'absolute',
    left: 15, // Fixed position from left
    top: '50%',
    transform: [{ translateY: -12 }], // Center vertically
    color: theme.colors.textSecondary,
  },
  menuIconRTL: {
    left: undefined,
    right: 20, // Fixed position from right in RTL
  },
  menuIconActive: {
    color: theme.colors.accent,
  },
  menuIconFocused: {
    color: '#FFFFFF',
  },
  menuLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginLeft: 56, // Leave space for icon
    marginRight: theme.spacing.md,
    lineHeight: 20,
    fontWeight: '500',
  },
  menuLabelRTL: {
    textAlign: 'right',
    marginLeft: theme.spacing.md,
    marginRight: 56, // Leave space for icon in RTL
  },
  menuLabelFocused: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  menuLabelActive: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surface,
  },
  directionIndicator: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'left',
  },
  directionIndicatorRTL: {
    textAlign: 'right',
  },
}); 