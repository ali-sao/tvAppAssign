import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Animated,
} from 'react-native';
import { useDirection } from '../../contexts/DirectionContext';
import { useMenu } from '../../contexts/MenuContext';
import { theme } from '../../constants/theme';

const { height: screenHeight } = Dimensions.get('window');

interface MenuItem {
  id: string;
  icon: string;
  label: string;
  onPress: () => void;
}

interface SideMenuProps {
  onProfilePress: () => void;
  onHomePress: () => void;
  onMyListPress: () => void;
  onContinueWatchingPress: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  onProfilePress,
  onHomePress,
  onMyListPress,
  onContinueWatchingPress,
}) => {
  const { isRTL } = useDirection();
  const { setMenuFocused } = useMenu();
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showText, setShowText] = useState(false);
  
  // Animation values
  const menuWidthAnim = useRef(new Animated.Value(MENU_COLLAPSED_WIDTH)).current;
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      icon: '👤',
      label: 'Profile & Settings',
      onPress: onProfilePress,
    },
    {
      id: 'home',
      icon: '🏠',
      label: 'Home',
      onPress: onHomePress,
    },
    {
      id: 'mylist',
      icon: '❤️',
      label: 'My List',
      onPress: onMyListPress,
    },
    {
      id: 'continue',
      icon: '▶️',
      label: 'Continue Watching',
      onPress: onContinueWatchingPress,
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
      <View style={styles.menuContent}>
        {/* Menu Items */}
        <View style={styles.menuItems}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.id}
              style={[
                styles.menuItem,
                focusedIndex === index && styles.menuItemFocused,
                isRTL && styles.menuItemRTL
              ]}
              onPress={item.onPress}
              onFocus={() => handleFocus(index)}
              onBlur={handleBlur}
            >
              <Text style={[
                styles.menuIcon,
                isRTL && styles.menuIconRTL
              ]}>
                {item.icon}
              </Text>
              {showText && (
                <Text style={[
                  styles.menuLabel,
                  isRTL && styles.menuLabelRTL,
                  focusedIndex === index && styles.menuLabelFocused,
                ]}>
                  {item.label}
                </Text>
              )}
            </Pressable>
          ))}
        </View>

        {/* Direction Indicator */}
        <View style={styles.footer}>
          {showText && (
            <Text style={[
              styles.directionIndicator,
              isRTL && styles.directionIndicatorRTL
            ]}>
              {isRTL ? 'RTL →' : '← LTR'}
            </Text>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const MENU_EXPANDED_WIDTH = 280;
const MENU_COLLAPSED_WIDTH = 80;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderColor: theme.colors.surface,
  },
  containerLTR: {
    left: 0,
    borderRightWidth: 2,
  },
  containerRTL: {
    right: 0,
    borderLeftWidth: 2,
  },
  menuContent: {
    flex: 1,
    paddingVertical: theme.spacing.xl,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surface,
  },
  headerText: {
    fontSize: theme.typography.heading.fontSize,
    fontWeight: theme.typography.heading.fontWeight as any,
    color: theme.colors.text,
    textAlign: 'left',
  },
  headerTextRTL: {
    textAlign: 'right',
  },
  menuItems: {
    flex: 1,
    paddingTop: theme.spacing.lg,
  },
  menuItem: {
    position: 'relative',
    height: 60,
    marginVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  menuItemRTL: {
    // RTL handled by icon and label positioning
  },
  menuItemFocused: {
    backgroundColor: theme.colors.primary,
  },
  menuIcon: {
    position: 'absolute',
    fontSize: 24,
    textAlign: 'center',
    width: 32,
    left: 24, // Fixed position from left
    top: '50%',
    transform: [{ translateY: -12 }], // Center vertically
  },
  menuIconRTL: {
    left: undefined,
    right: 24, // Fixed position from right in RTL
  },
  menuLabel: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    marginLeft: 72, // Leave space for icon
    marginRight: theme.spacing.md,
    lineHeight: 24,
  },
  menuLabelRTL: {
    textAlign: 'right',
    marginLeft: theme.spacing.md,
    marginRight: 72, // Leave space for icon in RTL
  },
  menuLabelFocused: {
    fontWeight: '600',
    color: theme.colors.background,
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