import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
} from 'react-native';
import { theme, dimensions } from '../../constants/theme';
import { ContentEntity } from '../../types/api';
import { useDirection } from '../../contexts/DirectionContext';
import { Card } from './Card';

const { width: screenWidth } = Dimensions.get('window');

interface CarouselProps {
  title: string;
  items: ContentEntity[];
  onItemPress: (item: ContentEntity) => void;
  onItemFocus?: (item: ContentEntity) => void;
}

export const Carousel: React.FC<CarouselProps> = ({
  title,
  items,
  onItemPress,
  onItemFocus,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isRTL } = useDirection();

  const handleItemPress = useCallback((item: ContentEntity) => {
    onItemPress(item);
  }, [onItemPress]);

  const handleItemFocus = useCallback((item: ContentEntity, index: number) => {
    setCurrentIndex(index);
    onItemFocus?.(item);
    
    // Auto-scroll to keep focused item visible
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }
  }, [onItemFocus]);

  const renderItem = ({ item, index }: { item: ContentEntity; index: number }) => (
    <Card
      item={item}
      index={index}
      onPress={() => handleItemPress(item)}
      onFocus={() => handleItemFocus(item, index)}
    />
  );

  const getItemLayout = (data: any, index: number) => ({
    length: dimensions.carouselItemWidth + theme.spacing.md,
    offset: (dimensions.carouselItemWidth + theme.spacing.md) * index,
    index,
  });

  return (
    <View style={styles.container}>
      <Text style={[
        styles.sectionTitle,
        isRTL && styles.sectionTitleRTL
      ]}>
        {title}
      </Text>
      
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        getItemLayout={getItemLayout}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ 
              index: info.index, 
              animated: true 
            });
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.heading.fontSize,
    fontWeight: theme.typography.heading.fontWeight as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.xxl,
  },
  sectionTitleRTL: {
    marginLeft: 0,
    marginRight: theme.spacing.xxl,
    textAlign: 'right',
  },
  listContainer: {
    paddingHorizontal: theme.spacing.xxl,
  },
  separator: {
    width: theme.spacing.md,
  },
}); 