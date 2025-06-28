import { Platform } from 'react-native';
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

// Simulate API delay
const simulateDelay = (ms: number = 500): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for mock data (in real app, this would be server-side)
let mockContent = generateMockContent();
let mockWatchProgress = generateMockWatchProgress();
let mockMyList = generateMockMyList();
let activeSessions: Map<string, { contentId: number; lastHeartbeat: number }> = new Map();

class StreamingAPI {
  private baseURL = 'https://api.thamaneyah-streaming.com/v1';

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
      await simulateDelay();

      const items = mockContent.filter(content => mockMyList.includes(content.id));
      
      const data: MyListResponse = {
        items,
        totalCount: items.length
      };

      return { success: true, data };
    } catch (error) {
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
      await simulateDelay(300);

      if (!mockMyList.includes(contentId)) {
        mockMyList.push(contentId);
      }

      return { 
        success: true, 
        data: { success: true } 
      };
    } catch (error) {
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
      await simulateDelay(300);

      mockMyList = mockMyList.filter(id => id !== contentId);

      return { 
        success: true, 
        data: { success: true } 
      };
    } catch (error) {
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
      await simulateDelay();

      const items: ContinueWatchingItem[] = mockWatchProgress
        .filter(progress => !progress.completed)
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

      const data: ContinueWatchingResponse = { items };

      return { success: true, data };
    } catch (error) {
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
      await simulateDelay(100); // Faster response for heartbeat

      const { contentId, progressInSeconds, sessionId } = request;

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

      const newProgress: WatchProgress = {
        contentId,
        progressInSeconds,
        lastWatched: new Date().toISOString(),
        completed: isCompleted
      };

      if (existingProgressIndex >= 0) {
        mockWatchProgress[existingProgressIndex] = newProgress;
      } else {
        mockWatchProgress.push(newProgress);
      }

      return { 
        success: true, 
        data: { success: true } 
      };
    } catch (error) {
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
}

// Export singleton instance
export const streamingAPI = new StreamingAPI();
export default streamingAPI; 