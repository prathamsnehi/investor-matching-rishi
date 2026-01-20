import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { SelectionGroup } from '@/components/onboarding/SelectionGroup';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import { getInternalFounderData, setInternalFounderData, setUserOnboardingStatus } from '@/utils/storage/onboarding';
import { FounderOnboardingData } from '@/utils/storage/types';

const REVENUE_BRACKETS = [
  'None yet', '< ₹1 L', '₹1–5 L', '₹5–10 L', '₹10–50 L', '₹50 L +'
].map(l => ({ label: l, value: l }));

const FUNDING_NEEDS = [
  '< ₹25 L', '₹25 L–₹1 Cr', '₹1–3 Cr', '₹3–10 Cr', '₹10 Cr +'
].map(l => ({ label: l, value: l }));

const RUNWAYS = [
  '< 3', '3–6', '6–12', '12 +'
].map(l => ({ label: l, value: l }));

const LEGAL_STATUSES = [
  'Sole Proprietorship', 'Pvt Ltd', 'LLP', 'Partnership', 'Other'
].map(l => ({ label: l, value: l }));

const STEP = 4;
const TOTAL_STEPS = 4;

export default function OptionalInfoScreen() {
  const router = useRouter();
  const theme = useThemeColor();
  
  const [revenue, setRevenue] = useState<string[]>([]);
  const [fundingNeed, setFundingNeed] = useState<string[]>([]);
  const [runway, setRunway] = useState<string[]>([]);
  const [legal, setLegal] = useState<string[]>([]);

  useEffect(() => {
    const data = getInternalFounderData();
    if (data.revenue) setRevenue(data.revenue);
    if (data.fundingNeed) setFundingNeed(data.fundingNeed);
    if (data.runway) setRunway(data.runway);
    if (data.legal) setLegal(data.legal);
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
    const update: Partial<FounderOnboardingData> = {
        revenue, fundingNeed, runway, legal
    };
    setInternalFounderData(update);
    setUserOnboardingStatus(); // Mark as onboarded
    router.replace('/(tabs)/discover');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: theme.text }]}>Founder Profile</Text>
        <ProgressBar progress={STEP / TOTAL_STEPS} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.optionalHeader}>
           <Text style={[styles.sectionHeader, { color: theme.primary, marginBottom: 0, marginTop: 0 }]}>Optional Information</Text>
           <Button title="Skip All" variant="ghost" onPress={completeOnboarding} style={{ paddingVertical: 4, paddingHorizontal: 12 }} textStyle={{ fontSize: 14 }} />
        </View>
        <SelectionGroup title="Monthly Revenue Bracket" options={REVENUE_BRACKETS} selectedValues={revenue} onSelect={(v) => handleSelect(revenue, setRevenue, v, false)} />
        <SelectionGroup title="Funding Need Range" options={FUNDING_NEEDS} selectedValues={fundingNeed} onSelect={(v) => handleSelect(fundingNeed, setFundingNeed, v, false)} />
        <SelectionGroup title="Runway (months)" options={RUNWAYS} selectedValues={runway} onSelect={(v) => handleSelect(runway, setRunway, v, false)} />
        <SelectionGroup title="Legal Status" options={LEGAL_STATUSES} selectedValues={legal} onSelect={(v) => handleSelect(legal, setLegal, v, false)} />
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
  optionalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  footer: { padding: 24, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0 },
  footerButtonContainer: { flexDirection: 'row', justifyContent: 'space-between' }
});
