import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, LayoutChangeEvent, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SelectionGroup } from '@/components/onboarding/SelectionGroup';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import { getInternalFounderData, setInternalFounderData } from '@/utils/storage/onboarding';
import { FounderOnboardingData } from '@/utils/storage/types';
import { validateMandatoryFields, showValidationError } from '@/utils/validation';

const ROLES = [
  'Solo Founder', 'Co-founder', 'Not a Founder'
];

const SECTORS = [
  'Fintech', 'Healthtech / Biotech', 'Edtech', 'Agritech', 'Climate / Energy', 
  'Mobility / Logistics', 'Consumer Internet', 'Enterprise Software', 
  'Industrial / Manufacturing', 'Deep Tech (AI, Robotics, Quantum, etc.)', 'Other'
];

const STAGES = [
  'Idea (pre-product)', 'MVP Built (pre-revenue)', 'Early Revenue', 
  'Product-Market Fit', 'Scaling (rapid growth)', 'Late Stage', 'Pre-Exit'
];

const REGIONS = [
  'India', 'South Asia (ex-India)', 'Southeast Asia', 'Middle East & North Africa', 
  'Europe', 'North America', 'Latin America', 'Africa', 'Oceania'
];

const TEAM_SIZES = [
  '1-5', '6-10', '11-25', '26-50', '51-100', '100+'
];

const INVESTMENT_RANGES = [
  '< ₹25 L', '₹25 L–₹1 Cr', '₹1–3 Cr', '₹3–10 Cr', '₹10 Cr +'
];

const STEP = 1;
const TOTAL_STEPS = 4;

export default function BasicInfoScreen() {
  const router = useRouter();
  const theme = useThemeColor();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Layout positions for auto-scroll
  const layoutMap = useRef<Record<string, number>>({});

  // Local state
  const [role, setRole] = useState<string[]>([]);
  const [sector, setSector] = useState<string[]>([]);
  const [stage, setStage] = useState<string[]>([]);
  const [region, setRegion] = useState<string[]>([]);
  const [teamSize, setTeamSize] = useState<string[]>([]);
  const [fundingNeed, setFundingNeed] = useState<string[]>([]);

  // Load data on mount
  useEffect(() => {
    const data = getInternalFounderData();
    if (data.role) setRole(data.role);
    if (data.sector) setSector(data.sector);
    if (data.stage) setStage(data.stage);
    if (data.region) setRegion(data.region);
    if (data.teamSize) setTeamSize(data.teamSize);
    if (data.fundingNeed) setFundingNeed(data.fundingNeed);
  }, []);

  const handleSelect = (
    current: string[], 
    setter: (v: string[]) => void, 
    value: string[], 
    multi: boolean
  ) => {
    // SelectionGroup now returns the full array, so we just set it
    setter(value);
  };

  const captureLayout = (field: string, event: LayoutChangeEvent) => {
    layoutMap.current[field] = event.nativeEvent.layout.y;
  };

  const nextStep = () => {
    const data = { role, sector, stage, region, teamSize, fundingNeed };
    const fields = ['role', 'sector', 'stage', 'region', 'teamSize', 'fundingNeed'];
    
    const { isValid, pendingField } = validateMandatoryFields(data, fields);

    if (!isValid && pendingField) {
        showValidationError(pendingField);
        // Scroll to error
        const y = layoutMap.current[pendingField];
        if (y !== undefined && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: y - 20, animated: true }); // -20 for padding
        }
        return;
    }

    // Save to MMKV
    const update: Partial<FounderOnboardingData> = {
        role, sector, stage, region, teamSize, fundingNeed
    };
    setInternalFounderData(update);
    router.push('/(onboarding)/founder/2-founding-year');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
      >
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: theme.text }]}>Founder Profile</Text>
        <ProgressBar progress={STEP / TOTAL_STEPS} />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.sectionHeader, { color: theme.primary, marginTop: 0 }]}>Basic Information</Text>
        
        <View onLayout={(e) => captureLayout('role', e)}>
            <SelectionGroup title="Role" options={ROLES} selected={role} onSelect={setRole} />
        </View>

        <View onLayout={(e) => captureLayout('sector', e)}>
            <SelectionGroup title="Industry / Sector" options={SECTORS} selected={sector} onSelect={setSector} maxSelect={10} />
        </View>

        <View onLayout={(e) => captureLayout('stage', e)}>
            <SelectionGroup title="Company Stage" options={STAGES} selected={stage} onSelect={setStage} maxSelect={10} />
        </View>

        <View onLayout={(e) => captureLayout('region', e)}>
            <SelectionGroup title="Target Market Geography" options={REGIONS} selected={region} onSelect={setRegion} maxSelect={10} />
        </View>

        <View onLayout={(e) => captureLayout('teamSize', e)}>
            <SelectionGroup title="Team Size" options={TEAM_SIZES} selected={teamSize} onSelect={setTeamSize} />
        </View>

        <View onLayout={(e) => captureLayout('fundingNeed', e)}>
            <SelectionGroup title="Investment Ask Range" options={INVESTMENT_RANGES} selected={fundingNeed} onSelect={setFundingNeed} />
        </View>

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
      </KeyboardAvoidingView>
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
