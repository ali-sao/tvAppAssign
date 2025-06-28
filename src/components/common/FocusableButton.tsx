import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, focusStyles } from '../../constants/theme';
import { FocusableComponentProps } from '../../types';

interface FocusableButtonProps extends FocusableComponentProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const FocusableButton: React.FC<FocusableButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  icon,
  disabled = false,
  onPress,
  onFocus,
  onBlur,
  hasTVPreferredFocus,
  style,
  textStyle,
  ...tvProps
}) => {
  const [focused, setFocused] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const handleFocus = () => {
    setFocused(true);
    Animated.spring(scaleAnim, {
      toValue: focusStyles.scale,
      useNativeDriver: true,
    }).start();
    onFocus?.();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    onBlur?.();
  };

  const handlePress = () => {
    if (!disabled) {
      onPress?.();
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle = styles[size];
    const variantStyle = styles[variant];
    
    return {
      ...baseStyle,
      ...variantStyle,
      ...(focused && styles.focused),
      ...(disabled && styles.disabled),
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle = textStyles[size];
    const variantTextStyle = textStyles[variant];
    
    return {
      ...baseTextStyle,
      ...variantTextStyle,
      ...(disabled && textStyles.disabled),
      ...textStyle,
    };
  };

  const renderButton = () => (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={handlePress}
        onFocus={handleFocus}
        onBlur={handleBlur}
        hasTVPreferredFocus={hasTVPreferredFocus}
        disabled={disabled}
        activeOpacity={0.8}
        {...tvProps}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={getTextStyle()}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  if (variant === 'primary' && !disabled) {
    return (
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={[styles.gradient, style]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
      >
        {renderButton()}
      </LinearGradient>
    );
  }

  return renderButton();
};

const styles = StyleSheet.create({
  // Size styles
  small: {
    // paddingHorizontal: theme.spacing.md,
    // paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    minWidth: 80,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  medium: {
    // paddingHorizontal: theme.spacing.lg,
    // paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    minWidth: 120,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  large: {
    // paddingHorizontal: theme.spacing.xl,
    // paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    minWidth: 160,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  // Variant styles
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.text,
  },
  // State styles
  focused: {
    borderWidth: focusStyles.borderWidth,
    borderColor: focusStyles.borderColor,
    shadowColor: focusStyles.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: focusStyles.shadowOpacity,
    shadowRadius: focusStyles.shadowRadius,
    elevation: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    borderRadius: theme.borderRadius.md,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
});

const textStyles = StyleSheet.create({
  // Size text styles
  small: {
    fontSize: 14,
    fontWeight: '600',
  },
  medium: {
    fontSize: 16,
    fontWeight: '600',
  },
  large: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Variant text styles
  primary: {
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
  secondary: {
    color: theme.colors.text,
    textAlign: 'center',
  },
  outline: {
    color: theme.colors.text,
    textAlign: 'center',
  },
  disabled: {
    color: theme.colors.textSecondary,
  },
}); 