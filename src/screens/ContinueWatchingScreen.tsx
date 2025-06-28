import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { theme } from '../constants/theme';
import { streamingAPI } from '../services/api';
import { ContinueWatchingItem } from '../types/api';
import { useDirection } from '../contexts/DirectionContext';

const { width: screenWidth } = Dimensions.get('window');
const ITEM_WIDTH = (screenWidth - 120) / 6; // 3 items per row with spacing

type ContinueWatchingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ContinueWatching'>;

interface ContinueWatchingScreenState {
  items: ContinueWatchingItem[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

export const ContinueWatchingScreen: React.FC = () => {
  const navigation = useNavigation<ContinueWatchingScreenNavigationProp>();
  const { isRTL } = useDirection();
  
  const [state, setState] = useState<ContinueWatchingScreenState>({
    items: [],
    loading: true,
    error: null,
    refreshing: false,
  });

  // Fetch continue watching items
  const fetchContinueWatching = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setState(prev => ({ ...prev, refreshing: true, error: null }));
      } else {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }

      const response = await streamingAPI.getContinueWatching();
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          items: response.data!.items,
          loading: false,
          refreshing: false,
          error: null,
        }));
        console.log(`📺 Loaded ${response.data!.items.length} continue watching items`);
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          refreshing: false,
          error: response.error?.message || 'Failed to load continue watching items',
        }));
      }
    } catch (error) {
      console.error('❌ Failed to fetch continue watching items:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: 'Failed to load continue watching items',
      }));
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchContinueWatching(true);
  }, [fetchContinueWatching]);

  // Handle item press
  const handleItemPress = useCallback((item: ContinueWatchingItem) => {
    console.log(`📺 Playing content: ${item.title} from ${Math.floor(item.progress.progressInSeconds)}s`);
    navigation.navigate('Player', {
      contentId: item.id,
      contentTitle: item.title,
      resumeTime: item.progress.progressInSeconds,
    });
  }, [navigation]);

  // Handle remove from continue watching
  const handleRemoveItem = useCallback(async (item: ContinueWatchingItem) => {
    // This would typically call an API to remove the item
    console.log(`🗑️ Remove ${item.title} from continue watching`);
    // For now, just refresh the list
    await fetchContinueWatching(true);
  }, [fetchContinueWatching]);

  // Format progress percentage
  const getProgressPercentage = (item: ContinueWatchingItem): number => {
    return (item.progress.progressInSeconds / item.durationInSeconds) * 100;
  };

  // Format time remaining
  const getTimeRemaining = (item: ContinueWatchingItem): string => {
    const remaining = item.durationInSeconds - item.progress.progressInSeconds;
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    }
    return `${minutes}m left`;
  };

  // Render continue watching item
  const renderItem = ({ item, index }: { item: ContinueWatchingItem; index: number }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        style={styles.itemTouchable}
        onPress={() => handleItemPress(item)}
        hasTVPreferredFocus={index === 0}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.posterImage }} style={styles.itemImage} />
          
          {/* Progress Overlay */}
          <View style={styles.progressOverlay}>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${getProgressPercentage(item)}%` }
                ]}
              />
            </View>
          </View>
          
          {/* Play Icon */}
          <View style={styles.playIconContainer}>
            <Icon name="play-circle" size={48} color="rgba(255, 255, 255, 0.9)" />
          </View>
        </View>
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.itemProgress}>
            {getTimeRemaining(item)}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  // Render header
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon 
          name={isRTL ? "chevron-forward" : "chevron-back"} 
          size={28} 
          color="#fff" 
        />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Continue Watching</Text>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => fetchContinueWatching(true)}
      >
        <Icon name="refresh" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="play-circle-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
      <Text style={styles.emptyTitle}>No items to continue watching</Text>
      <Text style={styles.emptySubtitle}>
        Start watching something and it will appear here
      </Text>
    </View>
  );

  // Render error state
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Icon name="alert-circle-outline" size={64} color={theme.colors.error} />
      <Text style={styles.errorTitle}>Failed to load</Text>
      <Text style={styles.errorSubtitle}>{state.error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => fetchContinueWatching()}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {state.loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading continue watching...</Text>
        </View>
      ) : state.error ? (
        renderErrorState()
      ) : state.items.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={state.items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={6}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={state.refreshing}
          onRefresh={() => fetchContinueWatching(true)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 32,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    color: theme.colors.error,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
  },
  listContainer: {
    padding: 24,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    marginBottom: 24,
    marginHorizontal: 8,
    position: 'relative',
  },
  itemTouchable: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: ITEM_WIDTH * 1.5, // 3:2 aspect ratio
    backgroundColor: '#333',
  },
  progressOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  progressBarContainer: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  playIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
  },
  itemInfo: {
    paddingTop: 12,
  },
  itemTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemProgress: {
    color: '#ccc',
    fontSize: 14,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    padding: 4,
  },
}); 