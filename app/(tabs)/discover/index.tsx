import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import mmkvStorage from '@/utils/storage/mmkvStorage';

export default function DiscoverScreen() {
  const router = useRouter();
  const theme = useThemeColor();

  const handleClearData = () => {
    mmkvStorage.clearAll();
    router.replace('/');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.emoji]}>🔥</Text>
        <Text style={[styles.title, { color: theme.text }]}>Coming Soon</Text>
        <Text style={[styles.subtitle, { color: theme.icon }]}>
          Tinder-style investor/founder discovery is under construction.
        </Text>

        <View style={styles.spacer} />

        <Button 
          title="Clear Onboarding Data" 
          variant="outline" 
          onPress={handleClearData}
          style={{ width: '100%', borderColor: theme.error }}
          textStyle={{ color: theme.error }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24 
  },
  emoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 24,
  },
  spacer: {
    height: 40,
  },
});
