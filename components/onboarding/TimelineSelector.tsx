import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useThemeColor } from '@/utils/contexts/ColorProvider';

interface TimelineSelectorProps {
  years: string[];
  selectedYear: string | null;
  onSelect: (year: string) => void;
}

export const TimelineSelector = ({ years, selectedYear, onSelect }: TimelineSelectorProps) => {
  const theme = useThemeColor();
  const scrollViewRef = useRef<ScrollView>(null);

  // Scroll to selected year on mount or change
  useEffect(() => {
    if (selectedYear) {
      const index = years.indexOf(selectedYear);
      if (index !== -1 && scrollViewRef.current) {
        // Approximate scroll position: item height + margin
        // This is a simple estimation; for perfect centering, we'd need onLayout
        scrollViewRef.current.scrollTo({ y: index * 60, animated: true });
      }
    }
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {years.map((year, index) => {
          const isSelected = year === selectedYear;
          // Check if this year is "older" (below) the selected year
          const selectedIndex = selectedYear ? years.indexOf(selectedYear) : -1;
          const isOlder = selectedIndex !== -1 && index > selectedIndex;
          
          return (
            <View key={year} style={styles.itemContainer}>
              <View style={[styles.dotContainer, { backgroundColor: theme.background }]}>
                {/* Line segment connecting to next item */}
                {index < years.length - 1 && (
                  <View 
                    style={[
                      styles.connectingLine, 
                      { 
                        backgroundColor: (isSelected || (selectedIndex !== -1 && index < selectedIndex)) ? theme.primary : theme.gray 
                      }
                    ]} 
                  />
                )}
                
                {!isOlder && (
                  <TouchableOpacity
                    style={[
                      styles.dot,
                      {
                        borderColor: isSelected ? theme.primary : theme.gray,
                        backgroundColor: isSelected ? theme.primary : 'transparent',
                      },
                    ]}
                    onPress={() => onSelect(year)}
                  />
                )}
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
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 400,
    position: 'relative',
    marginVertical: 20,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    marginBottom: 0,
  },
  dotContainer: {
    width: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    position: 'relative',
    height: '100%',
  },
  connectingLine: {
    position: 'absolute',
    top: '50%', // Start from center of this dot
    bottom: -30, // Extend to center of next dot (height is 60, half is 30)
    width: 2,
    left: 20, // Center horizontally (42/2 - 1)
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    zIndex: 1, // Ensure dot is above line
  },
  yearText: {
    marginLeft: 10,
  },
});
