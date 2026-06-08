import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { useThemeColor } from '@/utils/contexts/ColorProvider';

const { width } = Dimensions.get('window');

interface Story {
  title: string;
  content: string;
  emoji?: string;
  color?: string; // Optional background accent
}

interface StoryContentProps {
  stories: Story[];
  onFinished: () => void; // Called when last story finishes
}

const TAGS = ['Series A', 'B2B', 'SaaS']; // Dummy tags

export const StoryContent = ({ stories, onFinished }: StoryContentProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useThemeColor();

  const handlePress = (evt: any) => {
    const x = evt.nativeEvent.locationX;
    if (x < width * 0.3) {
      if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    } else {
      if (currentIndex < stories.length - 1) setCurrentIndex(currentIndex + 1);
    }
  };

  const currentStory = stories[currentIndex];

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={[styles.container, { backgroundColor: theme.primary, borderColor: theme.gray }]}>
        
        {/* Progress Bars */}
        <View style={styles.progressContainer}>
          {stories.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.progressBar, 
                { 
                  backgroundColor: index <= currentIndex ? theme.text : 'rgba(0,0,0,0.1)',
                  flex: 1
                }
              ]} 
            />
          ))}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
            <Text style={styles.emoji}>{currentStory.emoji || '📄'}</Text>
            <Text style={[styles.title, { color: theme.text }]}>{currentStory.title}</Text>
            <Text style={[styles.body, { color: theme.text }]}>{currentStory.content}</Text>
        </View>

        {/* Tags Footer */}
        <View style={styles.footer}>
           <View style={styles.tagsRow}>
             {TAGS.map(tag => (
               <View key={tag} style={[styles.tag, { backgroundColor: theme.background }]}>
                 <Text style={[styles.tagText, { color: theme.text }]}>{tag}</Text>
               </View>
             ))}
           </View>
        </View>

      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  progressContainer: {
    flexDirection: 'row',
    height: 4,
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 6,
    zIndex: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  body: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  }
});
