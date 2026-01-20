import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { SelectionGroup } from '@/components/onboarding/SelectionGroup';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import { getInternalFounderData, setInternalFounderData } from '@/utils/storage/onboarding';
import { FounderOnboardingData } from '@/utils/storage/types';

const BUSINESS_MODELS = [
  'B2B', 'B2C', 'B2B2C', 'Subscription', 'Marketplace', 'SaaS', 'Hybrid', 'Other'
].map(l => ({ label: l, value: l }));

const TARGET_MARKETS = [
  'Urban Consumers', 'Rural Consumers', 'MSMEs', 'Enterprise', 
  'Government', 'NGOs', 'International', 'Other'
].map(l => ({ label: l, value: l }));

const FUNDING_HISTORY = [
  'Bootstrapped', 'Friends & Family', 'Angel Round', 'Seed Round', 
  'Pre-Series A', 'Series A +'
].map(l => ({ label: l, value: l }));

const INVESTOR_TYPES = [
  'No Preference', 'Angel Investor', 'VC', 'Family Office', 
  'Impact Fund', 'Accelerator', 'Other'
].map(l => ({ label: l, value: l }));

const STEP = 3;
const TOTAL_STEPS = 4;

export default function BusinessSnapshotScreen() {
  const router = useRouter();
  const theme = useThemeColor();
  
  const [model, setModel] = useState<string[]>([]);
  const [targetMarket, setTargetMarket] = useState<string[]>([]);
  const [fundingHistory, setFundingHistory] = useState<string[]>([]);
  const [investorType, setInvestorType] = useState<string[]>([]);

  useEffect(() => {
    const data = getInternalFounderData();
    if (data.model) setModel(data.model);
    if (data.targetMarket) setTargetMarket(data.targetMarket);
    if (data.fundingHistory) setFundingHistory(data.fundingHistory);
    if (data.investorType) setInvestorType(data.investorType);
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
    const update: Partial<FounderOnboardingData> = {
        model, targetMarket, fundingHistory, investorType
    };
    setInternalFounderData(update);
    router.push('/(onboarding)/founder/4-optional');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: theme.text }]}>Founder Profile</Text>
        <ProgressBar progress={STEP / TOTAL_STEPS} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionHeader, { color: theme.primary, marginTop: 0 }]}>Business Snapshot</Text>
        <SelectionGroup title="Business Model" options={BUSINESS_MODELS} selectedValues={model} onSelect={(v) => handleSelect(model, setModel, v, true)} multiSelect />
        <SelectionGroup title="Target Market Type" options={TARGET_MARKETS} selectedValues={targetMarket} onSelect={(v) => handleSelect(targetMarket, setTargetMarket, v, false)} />
        <SelectionGroup title="Funding History" options={FUNDING_HISTORY} selectedValues={fundingHistory} onSelect={(v) => handleSelect(fundingHistory, setFundingHistory, v, true)} multiSelect />
        <SelectionGroup title="Preferred Investor Type" options={INVESTOR_TYPES} selectedValues={investorType} onSelect={(v) => handleSelect(investorType, setInvestorType, v, true)} multiSelect />
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
