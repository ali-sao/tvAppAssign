import { useState, useEffect, useCallback } from 'react';
import {
  HomepageResponse,
  MyListResponse,
  BrowseResponse,
  SearchResponse,
  ContinueWatchingResponse,
  PlayoutResponse,
  ContentEntity,
  BrowseRequest,
  SearchRequest,
  PlayoutRequest,
  HeartbeatRequest,
  ApiResponse
} from '../types/api';
import streamingAPI from '../services/api';

// Generic hook for API calls
function useAPICall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error?.message || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook for homepage data
export function useHomepage() {
  return useAPICall(() => streamingAPI.getHomepage());
}

// Hook for my list
export function useMyList() {
  return useAPICall(() => streamingAPI.getMyList());
}

// Hook for continue watching
export function useContinueWatching() {
  return useAPICall(() => streamingAPI.getContinueWatching());
}

// Hook for browse content with parameters
export function useBrowseContent(request: BrowseRequest = {}) {
  return useAPICall(
    () => streamingAPI.browseContent(request),
    [request.page, request.pageSize, request.genre, request.type, request.sortBy, request.sortOrder]
  );
}

// Hook for search with debouncing
export function useSearch(query: string, options: Omit<SearchRequest, 'query'> = {}) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return useAPICall(
    () => {
      if (!debouncedQuery.trim()) {
        return Promise.resolve({ success: true, data: { items: [], totalResults: 0, query: '' } });
      }
      return streamingAPI.search({ query: debouncedQuery, ...options });
    },
    [debouncedQuery, options.limit, options.type]
  );
}

// Hook for content details
export function useContentDetails(contentId: number) {
  return useAPICall(
    () => streamingAPI.getContentById(contentId),
    [contentId]
  );
}

// Hook for my list operations
export function useMyListOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addToMyList = useCallback(async (contentId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await streamingAPI.addToMyList(contentId);
      
      if (!response.success) {
        setError(response.error?.message || 'Failed to add to my list');
        return false;
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromMyList = useCallback(async (contentId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await streamingAPI.removeFromMyList(contentId);
      
      if (!response.success) {
        setError(response.error?.message || 'Failed to remove from my list');
        return false;
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkInMyList = useCallback(async (contentId: number) => {
    try {
      return await streamingAPI.isInMyList(contentId);
    } catch (err) {
      return false;
    }
  }, []);

  return {
    addToMyList,
    removeFromMyList,
    checkInMyList,
    loading,
    error
  };
}

// Hook for playout - simplified version using useAPICall
export function usePlayout(request: PlayoutRequest | null) {
  if (!request) {
    return { data: null, loading: false, error: 'No request provided' };
  }

  return useAPICall(
    () => streamingAPI.getPlayout(request),
    [request.contentId, request.drmSchema, request.streamingProtocol, request.deviceType]
  );
}

// Hook for heartbeat service
export function useHeartbeat() {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  const sendHeartbeat = useCallback(async (contentId: number, progressInSeconds: number) => {
    try {
      const request: HeartbeatRequest = {
        contentId,
        progressInSeconds,
        sessionId
      };
      
      const response = await streamingAPI.sendHeartbeat(request);
      return response.success;
    } catch (err) {
      console.error('Heartbeat failed:', err);
      return false;
    }
  }, [sessionId]);

  return { sendHeartbeat, sessionId };
}

// Hook for paginated data loading
export function usePaginatedBrowse(initialRequest: BrowseRequest = {}) {
  const [allItems, setAllItems] = useState<ContentEntity[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await streamingAPI.browseContent({
        ...initialRequest,
        page: currentPage,
        pageSize: initialRequest.pageSize || 20
      });

      if (response.success && response.data) {
        const responseData = response.data;
        if (currentPage === 1) {
          setAllItems(responseData.items);
        } else {
          setAllItems(prev => [...prev, ...responseData.items]);
        }
        
        setHasMore(responseData.hasMore);
        setCurrentPage(prev => prev + 1);
      } else {
        setError(response.error?.message || 'Failed to load content');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [currentPage, hasMore, loading, initialRequest]);

  const reset = useCallback(() => {
    setAllItems([]);
    setCurrentPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  useEffect(() => {
    reset();
    loadMore();
  }, [initialRequest.genre, initialRequest.type, initialRequest.sortBy, initialRequest.sortOrder]);

  return {
    items: allItems,
    loading,
    error,
    hasMore,
    loadMore,
    reset
  };
} 