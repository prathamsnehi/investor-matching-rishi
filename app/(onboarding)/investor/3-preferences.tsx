import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { SelectionGroup } from '@/components/onboarding/SelectionGroup';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import { getInternalInvestorData, setInternalInvestorData, setUserOnboardingStatus } from '@/utils/storage/onboarding';
import { InvestorOnboardingData } from '@/utils/storage/types';

const GEO_FOCUS = [
  'City-Specific', 'Country-Specific', 'Global'
].map(l => ({ label: l, value: l }));

const INVOLVEMENT = [
  'Passive / Hands-off', 'Board Seat', 'Strategic Mentorship', 'Network & Hiring Support'
].map(l => ({ label: l, value: l }));

const EXIT_EXPECTATIONS = [
  'Short Term (3-5 years)', 'Medium Term (5-7 years)', 'Long Term (7+ years)', 'IPO'
].map(l => ({ label: l, value: l }));

const STEP = 3;
const TOTAL_STEPS = 3;

export default function PreferencesScreen() {
  const router = useRouter();
  const theme = useThemeColor();
  
  const [geoFocus, setGeoFocus] = useState<string[]>([]);
  const [involvement, setInvolvement] = useState<string[]>([]);
  const [exit, setExit] = useState<string[]>([]);

  useEffect(() => {
    const data = getInternalInvestorData();
    if (data.geoFocus) setGeoFocus(data.geoFocus);
    if (data.involvement) setInvolvement(data.involvement);
    if (data.exit) setExit(data.exit);
  }, []);

  const handleSelect = (
    current: string[], 
    setter: (v: string[]) => void, 
    value: string, 
    multi: boolean
  ) => {
    if (multi) {
      if (current.includes(value)) {
        setter(current.filter(v => v !== value));
      } else {
        setter([...current, value]);
      }
    } else {
      if (current.includes(value)) {
        setter([]);
      } else {
        setter([value]);
      }
    }
  };

  const completeOnboarding = () => {
    const update: Partial<InvestorOnboardingData> = {
        geoFocus, involvement, exit
    };
    setInternalInvestorData(update);
    setUserOnboardingStatus();
    router.replace('/(tabs)/discover');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: theme.text }]}>Investor Profile</Text>
        <ProgressBar progress={STEP / TOTAL_STEPS} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionHeader, { color: theme.primary, marginTop: 0 }]}>Preferences</Text>
        <SelectionGroup title="Geo Focus" options={GEO_FOCUS} selectedValues={geoFocus} onSelect={(v) => handleSelect(geoFocus, setGeoFocus, v, false)} />
        <SelectionGroup title="Involvement Level" options={INVOLVEMENT} selectedValues={involvement} onSelect={(v) => handleSelect(involvement, setInvolvement, v, true)} multiSelect />
        <SelectionGroup title="Exit Expectations" options={EXIT_EXPECTATIONS} selectedValues={exit} onSelect={(v) => handleSelect(exit, setExit, v, false)} />
        <View style={{ height: 100 }} /> 
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.gray }]}>
        <View style={styles.footerButtonContainer}>
           <Button 
            title="Back" 
            variant="outline" 
            onPress={() => router.back()} 
            style={{ flex: 1, marginRight: 12 }}
           />
           <Button 
            title="Complete" 
            variant="primary" 
            onPress={completeOnboarding} 
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
  content: { padding: 24, paddingTop: 0 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  footer: { padding: 24, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0 },
  footerButtonContainer: { flexDirection: 'row', justifyContent: 'space-between' }
});
