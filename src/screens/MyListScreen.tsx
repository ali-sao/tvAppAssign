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
  Pressable,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { theme } from '../constants/theme';
import { streamingAPI } from '../services/api';
import { ContentEntity } from '../types/api';
import { useDirection } from '../contexts/DirectionContext';
import { FocusableButton } from '../components/common/FocusableButton';
const { width: screenWidth } = Dimensions.get('window');
const ITEM_WIDTH = (screenWidth - 120) / 6; // 6 items per row with spacing

type MyListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MyList'>;

interface MyListScreenState {
  items: ContentEntity[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

export const MyListScreen: React.FC = () => {
  const navigation = useNavigation<MyListScreenNavigationProp>();
  const { isRTL } = useDirection();
  
  const [state, setState] = useState<MyListScreenState>({
    items: [],
    loading: true,
    error: null,
    refreshing: false,
  });

  // Fetch my list items
  const fetchMyList = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setState(prev => ({ ...prev, refreshing: true, error: null }));
      } else {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }

      const response = await streamingAPI.getMyList();
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          items: response.data!.items,
          loading: false,
          refreshing: false,
          error: null,
        }));
        console.log(`📋 Loaded ${response.data!.items.length} my list items`);
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          refreshing: false,
          error: response.error?.message || 'Failed to load my list items',
        }));
      }
    } catch (error) {
      console.error('❌ Failed to fetch my list items:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: 'Failed to load my list items',
      }));
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    fetchMyList();
  }, [fetchMyList]);

  // Handle item press
  const handleItemPress = useCallback((item: ContentEntity) => {
    console.log(`📺 Playing content: ${item.title}`);
    navigation.navigate('Player', {
      contentId: item.id,
      contentTitle: item.title,
      resumeTime: 0, // Start from beginning, could get from continue watching API
    });
  }, [navigation]);

  // Handle remove from my list
  const handleRemoveItem = useCallback(async (item: ContentEntity) => {
    Alert.alert(
      'Remove from My List',
      `Are you sure you want to remove "${item.title}" from your list?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log(`🗑️ Removing ${item.title} from my list`);
              const response = await streamingAPI.removeFromMyList(item.id);
              
              if (response.success) {
                // Remove item from local state for immediate feedback
                setState(prev => ({
                  ...prev,
                  items: prev.items.filter(i => i.id !== item.id),
                }));
                console.log(`✅ Successfully removed ${item.title} from my list`);
              } else {
                Alert.alert('Error', 'Failed to remove item from your list');
              }
            } catch (error) {
              console.error('❌ Failed to remove item from my list:', error);
              Alert.alert('Error', 'Failed to remove item from your list');
            }
          },
        },
      ]
    );
  }, []);

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Render my list item
  const renderItem = ({ item, index }: { item: ContentEntity; index: number }) => (
    <View style={styles.itemContainer}>
         {/* Remove Button */}
      <FocusableButton
        title="Remove"
        variant="outline"
        size="small"
        // icon={<Icon name="close-circle" size={24} color="rgba(255, 255, 255, 0.7)" />}
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item)}
      />

      <TouchableOpacity
        style={styles.itemTouchable}
        onPress={() => handleItemPress(item)}
        hasTVPreferredFocus={index === 0}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.posterImage }} style={styles.itemImage} />
          
          {/* Play Icon */}
          <View style={styles.playIconContainer}>
            <Icon name="play-circle" size={48} color="rgba(255, 255, 255, 0.9)" />
          </View>
          
          {/* Content Type Badge */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>
              {item.type.toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.itemMeta}>
            {item.contentRating} • {formatDuration(item.durationInSeconds)}
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
      <Text style={styles.headerTitle}>My List</Text>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => fetchMyList(true)}
      >
        <Icon name="refresh" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="heart-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
      <Text style={styles.emptyTitle}>Your list is empty</Text>
      <Text style={styles.emptySubtitle}>
        Add movies and shows you want to watch to your list
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
        onPress={() => fetchMyList()}
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
          <Text style={styles.loadingText}>Loading your list...</Text>
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
          onRefresh={() => fetchMyList(true)}
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
  playIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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
  itemMeta: {
    color: '#ccc',
    fontSize: 14,
  },
  removeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    marginBottom: 8,
    // padding: 4,
  },
}); 