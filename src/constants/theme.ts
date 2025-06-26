import { AppTheme } from '../types';

export const theme: AppTheme = {
  colors: {
    primary: '#E50914', // Netflix red
    secondary: '#B81D24',
    background: '#141414',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    accent: '#F5C518', // IMDb yellow for ratings
    error: '#FF6B6B',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
  typography: {
    title: {
      fontSize: 48,
      fontWeight: 'bold',
    },
    heading: {
      fontSize: 24,
      fontWeight: '600',
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
    },
    caption: {
      fontSize: 14,
      fontWeight: '400',
    },
  },
};

export const focusStyles = {
  scale: 1.1,
  shadowOpacity: 0.3,
  shadowRadius: 10,
  shadowColor: theme.colors.text,
  borderWidth: 3,
  borderColor: theme.colors.text,
};

export const dimensions = {
  heroHeight: 560,
  posterWidth: 180,
  posterHeight: 270,
  carouselItemWidth: 200,
  carouselItemHeight: 300,
  buttonHeight: 50,
  buttonWidth: 120,
}; 