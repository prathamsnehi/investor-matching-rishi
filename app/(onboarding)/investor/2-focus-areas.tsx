import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { SelectionGroup } from '@/components/onboarding/SelectionGroup';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import { getInternalInvestorData, setInternalInvestorData } from '@/utils/storage/onboarding';
import { InvestorOnboardingData } from '@/utils/storage/types';

const TICKET_SIZES = [
  '< $50k', '$50k - $200k', '$200k - $500k', '$500k - $1M', '$1M - $5M', '$5M+'
].map(l => ({ label: l, value: l }));

const FREQUENCIES = [
  '1-2 deals/year', '3-5 deals/year', '5-10 deals/year', 'Active (10+)'
].map(l => ({ label: l, value: l }));

const SECTORS = [
  'Sector Agnostic', 'AgriTech', 'FinTech', 'HealthTech', 'EdTech', 'ClimateTech', 
  'SaaS', 'DeepTech', 'Consumer', 'Other'
].map(l => ({ label: l, value: l }));

const STEP = 2;
const TOTAL_STEPS = 3;

export default function FocusAreasScreen() {
  const router = useRouter();
  const theme = useThemeColor();
  
  const [ticketSize, setTicketSize] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<string[]>([]);
  const [sector, setSector] = useState<string[]>([]);

  useEffect(() => {
    const data = getInternalInvestorData();
    if (data.ticketSize) setTicketSize(data.ticketSize);
    if (data.frequency) setFrequency(data.frequency);
    if (data.sector) setSector(data.sector);
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
        ticketSize, frequency, sector
    };
    setInternalInvestorData(update);
    router.push('/(onboarding)/investor/3-preferences');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: theme.text }]}>Investor Profile</Text>
        <ProgressBar progress={STEP / TOTAL_STEPS} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionHeader, { color: theme.primary, marginTop: 0 }]}>Focus Areas</Text>
        <SelectionGroup title="Typical Ticket Size" options={TICKET_SIZES} selectedValues={ticketSize} onSelect={(v) => handleSelect(ticketSize, setTicketSize, v, true)} multiSelect />
        <SelectionGroup title="Investment Frequency" options={FREQUENCIES} selectedValues={frequency} onSelect={(v) => handleSelect(frequency, setFrequency, v, false)} />
        <SelectionGroup title="Sector Preference" options={SECTORS} selectedValues={sector} onSelect={(v) => handleSelect(sector, setSector, v, true)} multiSelect />
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
