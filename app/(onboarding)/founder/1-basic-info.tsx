import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { SelectionGroup } from '@/components/onboarding/SelectionGroup';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import { getInternalFounderData, setInternalFounderData } from '@/utils/storage/onboarding';
import { FounderOnboardingData } from '@/utils/storage/types';

const ROLES = [
  'Founder', 'Co-Founder', 'CEO', 'CTO', 'COO', 'CMO', 'Other'
].map(l => ({ label: l, value: l }));

const SECTORS = [
  'AgriTech', 'FinTech', 'HealthTech', 'EdTech', 'ClimateTech', 
  'SaaS', 'ConsumerTech', 'AI-ML', 'D2C', 'Mobility', 
  'Clean Energy', 'DeepTech', 'Other'
].map(l => ({ label: l, value: l }));

const STAGES = [
  'Idea', 'Prototype', 'MVP', 'Early Revenue', 'Growth', 
  'Scaling', 'Profitable', 'Exit-Ready'
].map(l => ({ label: l, value: l }));

const REGIONS = [
  'India', 'SEA', 'Middle East', 'Europe', 'North America', 'Other'
].map(l => ({ label: l, value: l }));

const TEAM_SIZES = [
  '1-5', '6-10', '11-25', '26-50', '51-100', '100+'
].map(l => ({ label: l, value: l }));

const STEP = 1;
const TOTAL_STEPS = 4;

export default function BasicInfoScreen() {
  const router = useRouter();
  const theme = useThemeColor();
  
  // Local state
  const [role, setRole] = useState<string[]>([]);
  const [sector, setSector] = useState<string[]>([]);
  const [stage, setStage] = useState<string[]>([]);
  const [region, setRegion] = useState<string[]>([]);
  const [teamSize, setTeamSize] = useState<string[]>([]);

  // Load data on mount
  useEffect(() => {
    const data = getInternalFounderData();
    if (data.role) setRole(data.role);
    if (data.sector) setSector(data.sector);
    if (data.stage) setStage(data.stage);
    if (data.region) setRegion(data.region);
    if (data.teamSize) setTeamSize(data.teamSize);
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
    // Save to MMKV
    const update: Partial<FounderOnboardingData> = {
        role, sector, stage, region, teamSize
    };
    setInternalFounderData(update);
    router.push('/(onboarding)/founder/2-founding-year');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: theme.text }]}>Founder Profile</Text>
        <ProgressBar progress={STEP / TOTAL_STEPS} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionHeader, { color: theme.primary, marginTop: 0 }]}>Basic Information</Text>
        <SelectionGroup title="Role" options={ROLES} selectedValues={role} onSelect={(v) => handleSelect(role, setRole, v, false)} />
        <SelectionGroup title="Industry / Sector" options={SECTORS} selectedValues={sector} onSelect={(v) => handleSelect(sector, setSector, v, true)} multiSelect />
        <SelectionGroup title="Company Stage" options={STAGES} selectedValues={stage} onSelect={(v) => handleSelect(stage, setStage, v, false)} />
        <SelectionGroup title="HQ Location" options={REGIONS} selectedValues={region} onSelect={(v) => handleSelect(region, setRegion, v, false)} />
        <SelectionGroup title="Team Size" options={TEAM_SIZES} selectedValues={teamSize} onSelect={(v) => handleSelect(teamSize, setTeamSize, v, false)} />
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
