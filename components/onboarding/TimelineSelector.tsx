import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ListRenderItem } from 'react-native';
import { useThemeColor } from '@/utils/contexts/ColorProvider';

interface TimelineSelectorProps {
  years: string[];
  selectedYear: string | null;
  onSelect: (year: string) => void;
}

const CURRENT_YEAR = 2026;
const ITEM_HEIGHT = 60; // Fixed height for optimization

const getEmojiForYear = (yearStr: string | null) => {
  if (!yearStr) return '📅';
  const year = parseInt(yearStr);
  const age = CURRENT_YEAR - year;
  
  if (age < 5) return '👶';
  if (age < 30) return '👨';
  return '👴';
};

export const TimelineSelector = ({ years, selectedYear, onSelect }: TimelineSelectorProps) => {
  const theme = useThemeColor();
  const flatListRef = useRef<FlatList>(null);

  // Scroll to selected year on mount
  useEffect(() => {
    if (selectedYear) {
      const index = years.indexOf(selectedYear);
      if (index !== -1 && flatListRef.current) {
        flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
      }
    }
  }, []);

  const currentEmoji = getEmojiForYear(selectedYear);
  const displayHeader = selectedYear ? `${selectedYear}  ${currentEmoji}` : 'Select Year 📅';

  const renderItem: ListRenderItem<string> = ({ item: year, index }) => {
    const isSelected = year === selectedYear;
    return (
      <View style={styles.itemContainer}>
        <View style={styles.dotContainer}>
           {/* Continuous Line */}
           <View style={[styles.line, { backgroundColor: theme.gray }]} />

           <TouchableOpacity
            style={[
              styles.dot,
              isSelected 
                  ? { 
                      width: 20, 
                      height: 20, 
                      borderRadius: 10, 
                      backgroundColor: theme.primary,
                    }
                  : { 
                      width: 12, 
                      height: 12, 
                      borderRadius: 6, 
                      backgroundColor: theme.gray 
                    }
            ]}
            onPress={() => onSelect(year)}
          />
        </View>
        <TouchableOpacity onPress={() => onSelect(year)} activeOpacity={0.8}>
          <Text
            style={[
              styles.yearText,
              {
                color: isSelected ? theme.primary : theme.icon,
                fontWeight: isSelected ? '700' : '400',
                fontSize: isSelected ? 24 : 18,
              },
            ]}
          >
            {year}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={[styles.headerText, { color: theme.text }]}>{displayHeader}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={years}
        renderItem={renderItem}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        getItemLayout={(data, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        initialNumToRender={15}
        maxToRenderPerBatch={20}
        windowSize={10}
        extraData={selectedYear} // Critical for re-rendering on selection change
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 480,
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    height: 40,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingVertical: 10,
    paddingBottom: 40,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: ITEM_HEIGHT,
  },
  dotContainer: {
    width: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    height: '100%',
    position: 'relative',
  },
  line: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
  },
  dot: {
    zIndex: 1,
  },
  yearText: {
    marginLeft: 10,
  },
});
