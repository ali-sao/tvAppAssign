import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ApiResponse,
  ContentEntity,
  HomepageResponse,
  MyListResponse,
  BrowseResponse,
  SearchResponse,
  ContinueWatchingResponse,
  PlayoutResponse,
  BrowseRequest,
  SearchRequest,
  PlayoutRequest,
  HeartbeatRequest,
  WatchProgress,
  ContinueWatchingItem
} from '../types/api';
import {
  generateMockContent,
  generateMockWatchProgress,
  generateMockMyList,
  generatePlayoutDataForContent,
  getRandomItems,
  filterContentByType,
  searchContent
} from './mockData';

// Storage keys for AsyncStorage
const STORAGE_KEYS = {
  WATCH_PROGRESS: '@thamaneyah_watch_progress',
  MY_LIST: '@thamaneyah_my_list',
  ACTIVE_SESSIONS: '@thamaneyah_active_sessions'
};

// Simulate API delay
const simulateDelay = (ms: number = 500): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for mock data (in real app, this would be server-side)
let mockContent = generateMockContent();
let mockWatchProgress = generateMockWatchProgress();
let mockMyList = generateMockMyList();
let activeSessions: Map<string, { contentId: number; lastHeartbeat: number }> = new Map();

// AsyncStorage helper functions
const StorageHelper = {
  // Watch Progress
  async getWatchProgress(): Promise<WatchProgress[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.WATCH_PROGRESS);
      return stored ? JSON.parse(stored) : generateMockWatchProgress();
    } catch (error) {
      console.error('Failed to load watch progress from storage:', error);
      return generateMockWatchProgress();
    }
  },

  async saveWatchProgress(progress: WatchProgress[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WATCH_PROGRESS, JSON.stringify(progress));
      console.log('📱 Watch progress saved to storage');
    } catch (error) {
      console.error('Failed to save watch progress to storage:', error);
    }
  },

  // My List
  async getMyList(): Promise<number[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.MY_LIST);
      return stored ? JSON.parse(stored) : generateMockMyList();
    } catch (error) {
      console.error('Failed to load my list from storage:', error);
      return generateMockMyList();
    }
  },

  async saveMyList(myList: number[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MY_LIST, JSON.stringify(myList));
      console.log('📱 My list saved to storage');
    } catch (error) {
      console.error('Failed to save my list to storage:', error);
    }
  },

  // Active Sessions
  async getActiveSessions(): Promise<Map<string, { contentId: number; lastHeartbeat: number }>> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_SESSIONS);
      if (stored) {
        const sessionsArray = JSON.parse(stored);
        return new Map(sessionsArray);
      }
      return new Map();
    } catch (error) {
      console.error('Failed to load active sessions from storage:', error);
      return new Map();
    }
  },

  async saveActiveSessions(sessions: Map<string, { contentId: number; lastHeartbeat: number }>): Promise<void> {
    try {
      const sessionsArray = Array.from(sessions.entries());
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_SESSIONS, JSON.stringify(sessionsArray));
      console.log('📱 Active sessions saved to storage');
    } catch (error) {
      console.error('Failed to save active sessions to storage:', error);
    }
  },

  // Clear all data (useful for testing/reset)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.WATCH_PROGRESS,
        STORAGE_KEYS.MY_LIST,
        STORAGE_KEYS.ACTIVE_SESSIONS
      ]);
      console.log('📱 All storage data cleared');
    } catch (error) {
      console.error('Failed to clear storage data:', error);
    }
  }
};

class StreamingAPI {
  private baseURL = 'https://api.thamaneyah-streaming.com/v1';
  private initialized = false;

  // Initialize API with stored data
  private async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      console.log('🔄 Initializing API with stored data...');
      
      // Load data from AsyncStorage
      mockWatchProgress = await StorageHelper.getWatchProgress();
      mockMyList = await StorageHelper.getMyList();
      activeSessions = await StorageHelper.getActiveSessions();
      
      this.initialized = true;
      console.log('✅ API initialized with stored data');
      console.log(`📊 Loaded ${mockWatchProgress.length} watch progress entries`);
      console.log(`📋 Loaded ${mockMyList.length} my list items`);
      console.log(`🔗 Loaded ${activeSessions.size} active sessions`);
    } catch (error) {
      console.error('❌ Failed to initialize API:', error);
      this.initialized = true; // Continue with defaults
    }
  }

  // 1. Fetch Homepage entities
  async getHomepage(): Promise<ApiResponse<HomepageResponse>> {
    try {
      await simulateDelay();

      const featured = getRandomItems(mockContent, 5);
      const trending = getRandomItems(mockContent, 8);
      const newReleases = getRandomItems(mockContent.filter(c => c.type === 'movie'), 6);
      const recommended = getRandomItems(mockContent, 10);

      const data: HomepageResponse = {
        featured,
        trending,
        newReleases,
        recommended
      };

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'HOMEPAGE_ERROR',
          message: 'Failed to fetch homepage content',
          details: error
        }
      };
    }
  }

  // 2. My List - Get all favorites
  async getMyList(): Promise<ApiResponse<MyListResponse>> {
    try {
      await this.initialize(); // Ensure data is loaded
      await simulateDelay();

      const items = mockContent.filter(content => mockMyList.includes(content.id));
      
      console.log(`📋 My list: ${items.length} items loaded from storage`);
      
      const data: MyListResponse = {
        items,
        totalCount: items.length
      };

      return { success: true, data };
    } catch (error) {
      console.error('❌ My list error:', error);
      return {
        success: false,
        error: {
          code: 'MYLIST_ERROR',
          message: 'Failed to fetch my list',
          details: error
        }
      };
    }
  }

  // 3. Add to My List
  async addToMyList(contentId: number): Promise<ApiResponse<{ success: boolean }>> {
    try {
      await this.initialize(); // Ensure data is loaded
      await simulateDelay(300);

      const content = mockContent.find(c => c.id === contentId);
      if (!content) {
        return {
          success: false,
          error: {
            code: 'CONTENT_NOT_FOUND',
            message: 'Content not found'
          }
        };
      }

      if (!mockMyList.includes(contentId)) {
        mockMyList.push(contentId);
        await StorageHelper.saveMyList(mockMyList);
        console.log(`➕ Added "${content.title}" to my list`);
      } else {
        console.log(`⚠️ "${content.title}" already in my list`);
      }

      return { 
        success: true, 
        data: { success: true } 
      };
    } catch (error) {
      console.error('❌ Add to my list error:', error);
      return {
        success: false,
        error: {
          code: 'ADD_TO_MYLIST_ERROR',
          message: 'Failed to add content to my list',
          details: error
        }
      };
    }
  }

  // Remove from My List
  async removeFromMyList(contentId: number): Promise<ApiResponse<{ success: boolean }>> {
    try {
      await this.initialize(); // Ensure data is loaded
      await simulateDelay(300);

      const content = mockContent.find(c => c.id === contentId);
      const wasInList = mockMyList.includes(contentId);

      mockMyList = mockMyList.filter(id => id !== contentId);

      if (wasInList) {
        await StorageHelper.saveMyList(mockMyList);
        console.log(`➖ Removed "${content?.title || contentId}" from my list`);
      } else {
        console.log(`⚠️ Content "${content?.title || contentId}" was not in my list`);
      }

      return { 
        success: true, 
        data: { success: true } 
      };
    } catch (error) {
      console.error('❌ Remove from my list error:', error);
      return {
        success: false,
        error: {
          code: 'REMOVE_FROM_MYLIST_ERROR',
          message: 'Failed to remove content from my list',
          details: error
        }
      };
    }
  }

  // 4. Continue Watching items
  async getContinueWatching(): Promise<ApiResponse<ContinueWatchingResponse>> {
    try {
      await this.initialize(); // Ensure data is loaded
      await simulateDelay();

      const items: ContinueWatchingItem[] = mockWatchProgress
        .filter(progress => !progress.completed && progress.progressInSeconds > 30) // Only show if watched more than 30 seconds
        .map(progress => {
          const content = mockContent.find(c => c.id === progress.contentId);
          if (!content) return null;
          
          return {
            ...content,
            progress
          };
        })
        .filter(Boolean) as ContinueWatchingItem[];

      // Sort by last watched (most recent first)
      items.sort((a, b) => 
        new Date(b.progress.lastWatched).getTime() - new Date(a.progress.lastWatched).getTime()
      );

      console.log(`📺 Continue watching: ${items.length} items loaded from storage`);

      const data: ContinueWatchingResponse = { items };

      return { success: true, data };
    } catch (error) {
      console.error('❌ Continue watching error:', error);
      return {
        success: false,
        error: {
          code: 'CONTINUE_WATCHING_ERROR',
          message: 'Failed to fetch continue watching items',
          details: error
        }
      };
    }
  }

  // 5. Heartbeat service - Log progress
  async sendHeartbeat(request: HeartbeatRequest): Promise<ApiResponse<{ success: boolean }>> {
    try {
      await this.initialize(); // Ensure data is loaded
      await simulateDelay(100); // Faster response for heartbeat

      const { contentId, progressInSeconds, sessionId } = request;

      console.log(`💓 Heartbeat received - Content: ${contentId}, Progress: ${Math.floor(progressInSeconds)}s, Session: ${sessionId}`);

      // Update active session
      activeSessions.set(sessionId, {
        contentId,
        lastHeartbeat: Date.now()
      });

      // Update or create watch progress
      const existingProgressIndex = mockWatchProgress.findIndex(p => p.contentId === contentId);
      const content = mockContent.find(c => c.id === contentId);
      
      if (!content) {
        return {
          success: false,
          error: {
            code: 'CONTENT_NOT_FOUND',
            message: 'Content not found'
          }
        };
      }

      const isCompleted = progressInSeconds >= (content.durationInSeconds * 0.9); // 90% completion
      const progressPercentage = ((progressInSeconds / content.durationInSeconds) * 100).toFixed(1);

      const newProgress: WatchProgress = {
        contentId,
        progressInSeconds,
        lastWatched: new Date().toISOString(),
        completed: isCompleted
      };

      if (existingProgressIndex >= 0) {
        mockWatchProgress[existingProgressIndex] = newProgress;
        console.log(`📝 Updated watch progress for "${content.title}": ${progressPercentage}% (${Math.floor(progressInSeconds)}s)`);
      } else {
        mockWatchProgress.push(newProgress);
        console.log(`📝 Created new watch progress for "${content.title}": ${progressPercentage}% (${Math.floor(progressInSeconds)}s)`);
      }

      // Persist to AsyncStorage
      await Promise.all([
        StorageHelper.saveWatchProgress(mockWatchProgress),
        StorageHelper.saveActiveSessions(activeSessions)
      ]);

      if (isCompleted) {
        console.log(`🎉 Content "${content.title}" marked as completed!`);
      }

      return { 
        success: true, 
        data: { success: true } 
      };
    } catch (error) {
      console.error('❌ Heartbeat error:', error);
      return {
        success: false,
        error: {
          code: 'HEARTBEAT_ERROR',
          message: 'Failed to send heartbeat',
          details: error
        }
      };
    }
  }

  // 6. Playout API - Get playback information
  async getPlayout(request: PlayoutRequest): Promise<ApiResponse<PlayoutResponse>> {
    try {
      await simulateDelay();

      const { contentId, drmSchema, streamingProtocol, deviceType } = request;
      const content = mockContent.find(c => c.id === contentId);
      const playoutInfo = generatePlayoutDataForContent(contentId);

      if (!content || !playoutInfo) {
        return {
          success: false,
          error: {
            code: 'CONTENT_NOT_FOUND',
            message: 'Content not found'
          }
        };
      }

      // Determine streaming protocol and DRM based on device and preferences
      let finalProtocol: 'dash' | 'hls' | 'smoothStreaming' = 'dash';
      let finalDrm = false;
      let mediaURL = '';
      let drmConfig: any = null;

      // Device-specific logic - use content.drm to determine if DRM should be applied
      if (deviceType === 'tvos' || Platform.OS === 'ios') {
        finalProtocol = 'hls';
        if (content.drm && drmSchema === 'fairplay') {
          finalDrm = true;
          mediaURL = playoutInfo.hls.fairplay;
          drmConfig = {
            type: 'fairplay',
            licenseUrl: playoutInfo.drm.fairplay.licenseUrl,
            certificateUrl: playoutInfo.drm.fairplay.certificateUrl,
            keyId: playoutInfo.drm.fairplay.keyId
          };
        } else {
          mediaURL = playoutInfo.hls.clear;
        }
      } else if (streamingProtocol === 'smoothStreaming') {
        // Windows/Xbox
        finalProtocol = 'smoothStreaming';
        if (content.drm && drmSchema === 'playready') {
          finalDrm = true;
          mediaURL = playoutInfo.smoothStreaming.playready;
          drmConfig = {
            type: 'playready',
            licenseUrl: playoutInfo.drm.playready.licenseUrl,
            keyId: playoutInfo.drm.playready.keyId
          };
        } else {
          mediaURL = playoutInfo.smoothStreaming.clear;
        }
      } else {
        // Android/Web - Default to DASH
        finalProtocol = 'dash';
        if (content.drm && drmSchema === 'widevine') {
          finalDrm = true;
          mediaURL = playoutInfo.dash.widevine;
          drmConfig = {
            type: 'widevine',
            licenseUrl: playoutInfo.drm.widevine.licenseUrl,
            keyId: playoutInfo.drm.widevine.keyId
          };
        } else {
          mediaURL = playoutInfo.dash.clear;
        }
      }

      const data: PlayoutResponse = {
        durationInSeconds: content.durationInSeconds,
        drm: finalDrm,
        drmConfig,
        thumbnailPreview: playoutInfo.thumbnails.preview,
        streamingProtocol: finalProtocol,
        startMarker: playoutInfo.markers.skipIntro,
        endMarker: playoutInfo.markers.skipCredits,
        mediaURL,
        // Additional playout information from mock data
        qualityLevels: playoutInfo.qualityLevels,
        audioTracks: playoutInfo.audioTracks,
        subtitleTracks: playoutInfo.subtitleTracks,
        chapters: playoutInfo.chapters,
        advertising: playoutInfo.advertising,
        thumbnails: {
          preview: playoutInfo.thumbnails.preview,
          sprite: playoutInfo.thumbnails.sprite,
          interval: playoutInfo.thumbnails.interval
        },
        markers: {
          intro: playoutInfo.markers.intro,
          credits: playoutInfo.markers.credits,
          skipIntro: playoutInfo.markers.skipIntro,
          skipCredits: playoutInfo.markers.skipCredits
        }
      };

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PLAYOUT_ERROR',
          message: 'Failed to get playout information',
          details: error
        }
      };
    }
  }

  // 7. Search endpoint
  async search(request: SearchRequest): Promise<ApiResponse<SearchResponse>> {
    try {
      await simulateDelay();

      const { query, limit = 20, type } = request;
      
      if (!query || query.trim().length === 0) {
        return {
          success: false,
          error: {
            code: 'INVALID_QUERY',
            message: 'Search query cannot be empty'
          }
        };
      }

      let results = searchContent(mockContent, query);
      
      if (type) {
        results = filterContentByType(results, type);
      }

      const items = results.slice(0, limit);

      const data: SearchResponse = {
        items,
        totalResults: results.length,
        query
      };

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: 'Failed to search content',
          details: error
        }
      };
    }
  }

  // 8. Browse content - Paginated grid view
  async browseContent(request: BrowseRequest = {}): Promise<ApiResponse<BrowseResponse>> {
    try {
      await simulateDelay();

      const { 
        page = 1, 
        pageSize = 20, 
        genre, 
        type, 
        sortBy = 'title', 
        sortOrder = 'asc' 
      } = request;

      let filteredContent = [...mockContent];

      // Filter by type
      if (type) {
        filteredContent = filterContentByType(filteredContent, type);
      }

      // Filter by genre (tag)
      if (genre) {
        filteredContent = filteredContent.filter(content =>
          content.tags.some(tag => tag.toLowerCase().includes(genre.toLowerCase()))
        );
      }

      // Sort content
      filteredContent.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (sortBy) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'duration':
            aValue = a.durationInSeconds;
            bValue = b.durationInSeconds;
            break;
          case 'rating':
            aValue = a.contentRating;
            bValue = b.contentRating;
            break;
          default:
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
        }

        if (sortOrder === 'desc') {
          return aValue < bValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });

      // Pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const items = filteredContent.slice(startIndex, endIndex);

      const data: BrowseResponse = {
        items,
        totalCount: filteredContent.length,
        page,
        pageSize,
        hasMore: endIndex < filteredContent.length
      };

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BROWSE_ERROR',
          message: 'Failed to browse content',
          details: error
        }
      };
    }
  }

  // Utility method to check if content is in my list
  async isInMyList(contentId: number): Promise<boolean> {
    await this.initialize(); // Ensure data is loaded
    return mockMyList.includes(contentId);
  }

  // Utility method to get content by ID
  async getContentById(contentId: number): Promise<ApiResponse<ContentEntity>> {
    try {
      const content = mockContent.find(c => c.id === contentId);
      
      if (!content) {
        return {
          success: false,
          error: {
            code: 'CONTENT_NOT_FOUND',
            message: 'Content not found'
          }
        };
      }

      return { success: true, data: content };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_CONTENT_ERROR',
          message: 'Failed to get content',
          details: error
        }
      };
    }
  }

  // Get watch progress for specific content
  async getWatchProgress(contentId: number): Promise<ApiResponse<WatchProgress | null>> {
    try {
      await this.initialize(); // Ensure data is loaded
      
      const progress = mockWatchProgress.find(p => p.contentId === contentId);
      return { success: true, data: progress || null };
    } catch (error) {
      console.error('❌ Get watch progress error:', error);
      return {
        success: false,
        error: {
          code: 'GET_PROGRESS_ERROR',
          message: 'Failed to get watch progress',
          details: error
        }
      };
    }
  }

  // Session management
  async createSession(contentId: number): Promise<ApiResponse<{ sessionId: string }>> {
    try {
      await this.initialize(); // Ensure data is loaded
      
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      activeSessions.set(sessionId, {
        contentId,
        lastHeartbeat: Date.now()
      });

      await StorageHelper.saveActiveSessions(activeSessions);
      
      const content = mockContent.find(c => c.id === contentId);
      console.log(`🔗 Created session ${sessionId} for "${content?.title || contentId}"`);

      return { 
        success: true, 
        data: { sessionId } 
      };
    } catch (error) {
      console.error('❌ Create session error:', error);
      return {
        success: false,
        error: {
          code: 'CREATE_SESSION_ERROR',
          message: 'Failed to create session',
          details: error
        }
      };
    }
  }

  async endSession(sessionId: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      await this.initialize(); // Ensure data is loaded
      
      const session = activeSessions.get(sessionId);
      if (session) {
        activeSessions.delete(sessionId);
        await StorageHelper.saveActiveSessions(activeSessions);
        
        const content = mockContent.find(c => c.id === session.contentId);
        console.log(`🔚 Ended session ${sessionId} for "${content?.title || session.contentId}"`);
      }

      return { 
        success: true, 
        data: { success: true } 
      };
    } catch (error) {
      console.error('❌ End session error:', error);
      return {
        success: false,
        error: {
          code: 'END_SESSION_ERROR',
          message: 'Failed to end session',
          details: error
        }
      };
    }
  }

  // Clear all stored data (useful for testing/reset)
  async clearAllData(): Promise<ApiResponse<{ success: boolean }>> {
    try {
      await StorageHelper.clearAllData();
      
      // Reset in-memory data to defaults
      mockWatchProgress = generateMockWatchProgress();
      mockMyList = generateMockMyList();
      activeSessions.clear();
      this.initialized = false;

      console.log('🗑️ All data cleared and reset to defaults');

      return { 
        success: true, 
        data: { success: true } 
      };
    } catch (error) {
      console.error('❌ Clear data error:', error);
      return {
        success: false,
        error: {
          code: 'CLEAR_DATA_ERROR',
          message: 'Failed to clear data',
          details: error
        }
      };
    }
  }
}

// Export singleton instance
export const streamingAPI = new StreamingAPI();
export default streamingAPI; 