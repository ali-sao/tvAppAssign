export interface Movie {
  id: string;
  title: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  videoUrl?: string;
  trailerUrl?: string;
  runtime: number; // minutes
  rating: string;
  year: number;
  genres: string[];
  cast: Actor[];
  director: string;
  featured?: boolean;
}

export interface Actor {
  id: string;
  name: string;
  character: string;
  profileUrl?: string;
}

export interface TVShow extends Omit<Movie, 'runtime' | 'director'> {
  seasons: number;
  episodes: number;
  status: 'ongoing' | 'completed' | 'cancelled';
}

export interface ContentRow {
  id: string;
  title: string;
  type: 'movie' | 'tvshow' | 'mixed';
  items: (Movie | TVShow)[];
}

export interface FocusableComponentProps {
  onFocus?: () => void;
  onBlur?: () => void;
  onPress?: () => void;
  hasTVPreferredFocus?: boolean;
  nextFocusDown?: number;
  nextFocusUp?: number;
  nextFocusLeft?: number;
  nextFocusRight?: number;
}

export interface CarouselItem {
  id: string;
  title: string;
  imageUrl: string;
  onPress: () => void;
}

export interface HeroContentProps {
  content: Movie | TVShow;
  onPlayPress: () => void;
  onTrailerPress: () => void;
  onMyListPress: () => void;
  isInMyList: boolean;
}

export interface NavigationState {
  currentFocusedElement: string | null;
  focusHistory: string[];
}

export type RootStackParamList = {
  Home: undefined;
  MovieDetail: { movieId: string };
  Player: { videoUrl: string; title: string; resumeTime?: number };
  Search: undefined;
  MyList: undefined;
};

export interface AppTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
    error: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  typography: {
    title: {
      fontSize: number;
      fontWeight: string;
    };
    heading: {
      fontSize: number;
      fontWeight: string;
    };
    body: {
      fontSize: number;
      fontWeight: string;
    };
    caption: {
      fontSize: number;
      fontWeight: string;
    };
  };
} 