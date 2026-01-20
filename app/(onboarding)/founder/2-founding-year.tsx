import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { TimelineSelector } from '@/components/onboarding/TimelineSelector';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import { getInternalFounderData, setInternalFounderData } from '@/utils/storage/onboarding';

// Years for timeline
const YEARS = Array.from({ length: 77 }, (_, i) => (2026 - i).toString());

const STEP = 2;
const TOTAL_STEPS = 4;

export default function FoundingYearScreen() {
  const router = useRouter();
  const theme = useThemeColor();
  const [year, setYear] = useState<string | null>(null);

  useEffect(() => {
    const data = getInternalFounderData();
    if (data.year && data.year.length > 0) {
        setYear(data.year[0]);
    }
  }, []);

  const nextStep = () => {
    if (year) {
        setInternalFounderData({ year: [year] });
    }
    router.push('/(onboarding)/founder/3-business-snapshot');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: theme.text }]}>Founder Profile</Text>
        <ProgressBar progress={STEP / TOTAL_STEPS} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionHeader, { color: theme.primary, marginTop: 0 }]}>When was it founded?</Text>
        <Text style={{ color: theme.icon, marginBottom: 16 }}>Select the year your startup began.</Text>
        <TimelineSelector 
            years={YEARS} 
            selectedYear={year} 
            onSelect={(y) => setYear(y)} 
        />
      </View>

      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.gray }]}>
        <View style={styles.footerButtonContainer}>
           <Button 
            title="Back" 
            variant="outline" 
            onPress={() => router.back()} 
            style={{ flex: 1, marginRight: 12 }}
           />
           <Button 
            title="Next" 
            variant="primary" 
            onPress={nextStep} 
            style={{ flex: 1 }}
           />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  content: { padding: 24, paddingTop: 0, flex: 1 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  footer: { padding: 24, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0 },
  footerButtonContainer: { flexDirection: 'row', justifyContent: 'space-between' }
});
