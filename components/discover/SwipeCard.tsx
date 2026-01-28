import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  runOnJS, 
  interpolate, 
  Extrapolation,
  useAnimatedReaction
} from 'react-native-reanimated';
import { StoryContent } from './StoryContent';

const { width, height } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;

interface SwipeCardProps {
  profile: any;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSuperLike?: () => void;
  onUiUpdate?: (x: number) => void;
}

export interface SwipeCardRef {
  swipeLeft: () => void;
  swipeRight: () => void;
  superLike: () => void;
}

export const SwipeCard = forwardRef<SwipeCardRef, SwipeCardProps>(({ profile, onSwipeLeft, onSwipeRight, onSuperLike, onUiUpdate }, ref) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);

  // Notify parent of updates (Background Animation)
  // We use useAnimatedReaction to run this on the UI thread effectively
  useAnimatedReaction(
    () => translateX.value,
    (currentX) => {
      if (onUiUpdate) {
        onUiUpdate(currentX);
      }
    }
  );

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    swipeLeft: () => {
      translateX.value = withTiming(-width * 1.5, { duration: 300 }, () => {
        runOnJS(onSwipeLeft)();
      });
    },
    swipeRight: () => {
      translateX.value = withTiming(width * 1.5, { duration: 300 }, () => {
        runOnJS(onSwipeRight)();
      });
    },
    superLike: () => {
      translateY.value = withTiming(-height, { duration: 300 }, () => {
        if (onSuperLike) runOnJS(onSuperLike)();
        else runOnJS(onSwipeRight)(); // Fallback
      });
    }
  }));

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY * 0.2; // Slight vertical movement
      rotation.value = interpolate(
        event.translationX,
        [-width/2, 0, width/2],
        [-10, 0, 10],
        Extrapolation.CLAMP
      );
    })
    .onEnd(() => {
      if (translateX.value > SWIPE_THRESHOLD) {
        // Swipe Right
        translateX.value = withTiming(width * 1.5, { duration: 300 }, () => {
          runOnJS(onSwipeRight)();
        });
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        // Swipe Left
        translateX.value = withTiming(-width * 1.5, { duration: 300 }, () => {
          runOnJS(onSwipeLeft)();
        });
      } else {
        // Return to center
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotation.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` }
    ]
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <StoryContent stories={profile.stories} onFinished={() => {}} />
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  card: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    backgroundColor: 'white', // Ensure solid background even if content is transparent
    overflow: 'visible', // Visible for shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
