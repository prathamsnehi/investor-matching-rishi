import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { SelectionGroup } from '@/components/onboarding/SelectionGroup';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import { getInternalInvestorData, setInternalInvestorData } from '@/utils/storage/onboarding';
import { InvestorOnboardingData } from '@/utils/storage/types';

const FUND_TYPES = [
  'Angel Syndicate', 'Micro VC', 'Early Stage VC', 'Growth VC', 'Corporate VC', 'Family Office', 'PE Fund', 'Other'
].map(l => ({ label: l, value: l }));

const REGIONS = [
  'India', 'SEA', 'Middle East', 'Europe', 'North America', 'Global'
].map(l => ({ label: l, value: l }));

const STAGES = [
  'Pre-Seed', 'Seed', 'Pre-Series A', 'Series A', 'Series B+'
].map(l => ({ label: l, value: l }));

const STEP = 1;
const TOTAL_STEPS = 3;

export default function StrategyScreen() {
  const router = useRouter();
  const theme = useThemeColor();
  
  const [fundType, setFundType] = useState<string[]>([]);
  const [region, setRegion] = useState<string[]>([]);
  const [stage, setStage] = useState<string[]>([]);

  useEffect(() => {
    const data = getInternalInvestorData();
    if (data.fundType) setFundType(data.fundType);
    if (data.region) setRegion(data.region);
    if (data.stage) setStage(data.stage);
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

  const nextStep = () => {
    const update: Partial<InvestorOnboardingData> = {
        fundType, region, stage
    };
    setInternalInvestorData(update);
    router.push('/(onboarding)/investor/2-focus-areas');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: theme.text }]}>Investor Profile</Text>
        <ProgressBar progress={STEP / TOTAL_STEPS} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionHeader, { color: theme.primary, marginTop: 0 }]}>Investment Strategy</Text>
        <SelectionGroup title="Fund Structure / Type" options={FUND_TYPES} selectedValues={fundType} onSelect={(v) => handleSelect(fundType, setFundType, v, true)} multiSelect />
        <SelectionGroup title="Primary Geography Focus" options={REGIONS} selectedValues={region} onSelect={(v) => handleSelect(region, setRegion, v, true)} multiSelect />
        <SelectionGroup title="Preferred Stage(s)" options={STAGES} selectedValues={stage} onSelect={(v) => handleSelect(stage, setStage, v, true)} multiSelect />
        <View style={{ height: 100 }} /> 
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.gray }]}>
        <View style={styles.footerButtonContainer}>
           <Button 
            title="Cancel" 
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
  content: { padding: 24, paddingTop: 0 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  footer: { padding: 24, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0 },
  footerButtonContainer: { flexDirection: 'row', justifyContent: 'space-between' }
});
