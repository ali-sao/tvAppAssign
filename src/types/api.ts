// Content Entity Types
export interface ContentEntity {
  id: number;
  title: string;
  description: string;
  logoTitleImage: string;
  posterImage: string;
  type: 'show' | 'episode' | 'movie' | 'live_event' | 'serialized';
  heroImage: string;
  durationInSeconds: number;
  trailerID: number;
  cast: string[];
  availableLanguages: string[];
  contentRating: string;
  tags: string[];
  drm: boolean; // Indicates if content requires DRM protection
}

// Playout Response
export interface PlayoutResponse {
  durationInSeconds: number;
  drm: boolean;
  drmConfig?: {
    type: 'fairplay' | 'widevine' | 'playready';
    licenseUrl: string;
    certificateUrl?: string; // Only for FairPlay
    keyId: string;
  };
  thumbnailPreview: string;
  streamingProtocol: 'dash' | 'hls' | 'smoothStreaming';
  startMarker: number;
  endMarker: number;
  mediaURL: string;
  // Enhanced playout information
  qualityLevels?: Array<{
    resolution: string;
    bitrate: number;
    fps: number;
    codec: string;
  }>;
  audioTracks?: Array<{
    id: string;
    language: string;
    label: string;
    codec: string;
    channels: string;
    bitrate: number;
  }>;
  subtitleTracks?: Array<{
    id: string;
    language: string;
    label: string;
    format: string;
    url: string;
  }>;
  chapters?: Array<{
    start: number;
    end: number;
    title: string;
  }>;
  advertising?: {
    enabled: boolean;
    preroll: Array<{
      duration: number;
      url: string;
      clickthrough: string;
    }>;
    midroll: Array<{
      position: number;
      duration: number;
      url: string;
      clickthrough: string;
    }>;
    postroll: Array<{
      duration: number;
      url: string;
      clickthrough: string;
    }>;
  };
  thumbnails?: {
    preview: string;
    sprite: string;
    interval: number;
  };
  markers?: {
    intro: {
      start: number;
      end: number;
    };
    credits: {
      start: number;
      end: number;
    };
    skipIntro: number;
    skipCredits: number;
  };
}

// Progress Tracking
export interface WatchProgress {
  contentId: number;
  progressInSeconds: number;
  lastWatched: string; // ISO date string
  completed: boolean;
}

// Continue Watching Item
export interface ContinueWatchingItem extends ContentEntity {
  progress: WatchProgress;
}

// API Response Types
export interface HomepageResponse {
  featured: ContentEntity[];
  trending: ContentEntity[];
  newReleases: ContentEntity[];
  recommended: ContentEntity[];
}

export interface MyListResponse {
  items: ContentEntity[];
  totalCount: number;
}

export interface BrowseResponse {
  items: ContentEntity[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SearchResponse {
  items: ContentEntity[];
  totalResults: number;
  query: string;
}

export interface ContinueWatchingResponse {
  items: ContinueWatchingItem[];
}

// API Request Types
export interface BrowseRequest {
  page?: number;
  pageSize?: number;
  genre?: string;
  type?: ContentEntity['type'];
  sortBy?: 'title' | 'releaseDate' | 'rating' | 'duration';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchRequest {
  query: string;
  limit?: number;
  type?: ContentEntity['type'];
}

export interface PlayoutRequest {
  contentId: number;
  drmSchema?: 'fairplay' | 'widevine' | 'playready';
  streamingProtocol?: 'hls' | 'dash' | 'smoothStreaming';
  deviceType?: 'tvos' | 'android' | 'web';
}

export interface HeartbeatRequest {
  contentId: number;
  progressInSeconds: number;
  sessionId: string;
}

// API Error Response
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
} 