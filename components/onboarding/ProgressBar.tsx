import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useThemeColor } from '@/utils/contexts/ColorProvider';

interface ProgressBarProps {
  progress: number; // 0 to 1
}

export const ProgressBar = ({ progress }: ProgressBarProps) => {
  const theme = useThemeColor();
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false, // width is not supported by native driver
    }).start();
  }, [progress]);

  const widthInterpolated = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.gray }]}>
      <Animated.View
        style={[
          styles.bar,
          {
            backgroundColor: theme.primary,
            width: widthInterpolated,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 24,
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
});
