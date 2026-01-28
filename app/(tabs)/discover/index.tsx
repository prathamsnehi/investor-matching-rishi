import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { SwipeCard, SwipeCardRef } from '@/components/discover/SwipeCard';
import { ActionButtons } from '@/components/discover/ActionButtons';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  interpolate, 
  Extrapolation,
  withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// --- Dummy Data ---
const DUMMY_PROFILES = [
  {
    id: '1',
    name: 'TechFlow Solutions',
    stories: [
      { title: 'TechFlow Solutions', content: 'Revolutionizing supply chain logistics with AI-driven insights.', emoji: '🚛' },
      { title: 'Business Model', content: 'B2B SaaS with tiered subscription model. $50k MRR.', emoji: '💼' },
      { title: 'The Team', content: 'Founded by ex-Amazon logistics experts. Team of 12 based in Seattle.', emoji: '👥' },
    ]
  },
  {
    id: '2',
    name: 'GreenLeaf Energy',
    stories: [
      { title: 'GreenLeaf Energy', content: 'Portable solar solutions for remote workforce.', emoji: '☀️' },
      { title: 'Market Size', content: '$10B TAM. Growing at 15% YoY.', emoji: '📈' },
    ]
  },
  {
    id: '3',
    name: 'Urban Bites',
    stories: [
      { title: 'Urban Bites', content: 'Hyper-local food delivery for suburban areas.', emoji: '🍔' },
      { title: 'Traction', content: '10,000 monthly active users in pilot city.', emoji: '🚀' },
      { title: 'Ask', content: 'Raising $1M Seed to expand to 5 new cities.', emoji: '💰' },
    ]
  }
];

export default function DiscoverScreen() {
  const theme = useThemeColor();
  const router = useRouter();
  const topCardRef = useRef<SwipeCardRef>(null);

  // Double Buffered Animation Values to avoid race conditions
  // Group A (Used for even indices)
  const bgScaleA = useSharedValue(0.95);
  const bgTranslateYA = useSharedValue(10);
  
  // Group B (Used for odd indices)
  const bgScaleB = useSharedValue(0.95);
  const bgTranslateYB = useSharedValue(10);

  // State to track cards
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset the "previous" group after index changes
  useEffect(() => {
    // If we just moved to Index 1 (Odd), Group A (Even) was just used and is at 1.0. Reset it.
    // If we moved to Index 2 (Even), Group B (Odd) was just used. Reset it.
    const isOdd = currentIndex % 2 !== 0;
    if (isOdd) {
        bgScaleA.value = 0.95;
        bgTranslateYA.value = 10;
    } else {
        bgScaleB.value = 0.95;
        bgTranslateYB.value = 10;
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % DUMMY_PROFILES.length);
  }, []);

  const currentProfile = DUMMY_PROFILES[currentIndex];
  const nextProfileIndex = (currentIndex + 1) % DUMMY_PROFILES.length;
  const nextProfile = DUMMY_PROFILES[nextProfileIndex];

  // Manual Actions
  const handleNope = () => topCardRef.current?.swipeLeft();
  const handleLike = () => topCardRef.current?.swipeRight();
  const handleSuperLike = () => topCardRef.current?.superLike();

  // Determine which values to drive
  const isEven = currentIndex % 2 === 0;
  // If current is Even (0), BG is Odd (1) -> Use Group A? 
  // Let's stick to: Index 0 uses Group A for BG. Index 1 uses Group B.
  
  const handleUiUpdate = (currentX: number) => {
    'worklet';
    const offset = Math.abs(currentX);
    const scale = interpolate(offset, [0, width * 0.5], [0.95, 1], Extrapolation.CLAMP);
    const transY = interpolate(offset, [0, width * 0.5], [10, 0], Extrapolation.CLAMP);

    if (isEven) {
        bgScaleA.value = scale;
        bgTranslateYA.value = transY;
    } else {
        bgScaleB.value = scale;
        bgTranslateYB.value = transY;
    }
  };

  const backgroundStyle = useAnimatedStyle(() => {
    const scale = isEven ? bgScaleA.value : bgScaleB.value;
    const transY = isEven ? bgTranslateYA.value : bgTranslateYB.value;
    return {
      transform: [
        { scale },
        { translateY: transY }
      ]
    };
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      
      <View style={styles.cardsContainer}>
        {/* Background Card (Next) */}
        <Animated.View 
          style={[styles.cardWrapper, backgroundStyle]} 
          key={nextProfile.id + '-next'} 
        >
           <SwipeCard 
             profile={nextProfile}
             onSwipeLeft={() => {}}
             onSwipeRight={() => {}}
           />
        </Animated.View>

        {/* Foreground Card (Current) */}
        <View style={styles.cardWrapper} key={currentProfile.id + '-' + currentIndex}>
          <SwipeCard 
            ref={topCardRef}
            profile={currentProfile}
            onSwipeLeft={handleNext}
            onSwipeRight={handleNext}
            onSuperLike={handleNext}
            onUiUpdate={handleUiUpdate}
          />
        </View>
      </View>

      <ActionButtons 
        onNope={handleNope}
        onLike={handleLike}
        onSuperLike={handleSuperLike}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  cardWrapper: {
    position: 'absolute',
    width: '90%',
    height: '100%',
  },
});
