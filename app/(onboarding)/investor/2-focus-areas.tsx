import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, LayoutChangeEvent, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SelectionGroup } from '@/components/onboarding/SelectionGroup';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import { getInternalInvestorData, setInternalInvestorData } from '@/utils/storage/onboarding';
import { InvestorOnboardingData } from '@/utils/storage/types';
import { validateMandatoryFields, showValidationError } from '@/utils/validation';

const FREQUENCIES = [
  '1-2 deals/year', '3-5 deals/year', '5-10 deals/year', 'Active (10+)'
];

const SECTORS = [
  'Sector Agnostic', 'AgriTech', 'FinTech', 'HealthTech', 'EdTech', 'ClimateTech', 
  'SaaS', 'DeepTech', 'Consumer', 'Other'
];

const STEP = 2;
const TOTAL_STEPS = 3;

export default function FocusAreasScreen() {
  const router = useRouter();
  const theme = useThemeColor();
  const scrollViewRef = useRef<ScrollView>(null);
  const layoutMap = useRef<Record<string, number>>({});
  
  const [frequency, setFrequency] = useState<string[]>([]);
  const [sector, setSector] = useState<string[]>([]);

  useEffect(() => {
    const data = getInternalInvestorData();
    if (data.frequency) setFrequency(data.frequency);
    if (data.sector) setSector(data.sector);
  }, []);

  const captureLayout = (field: string, event: LayoutChangeEvent) => {
    layoutMap.current[field] = event.nativeEvent.layout.y;
  };

  const nextStep = () => {
    const data = { frequency, sector };
    const fields = ['frequency', 'sector'];
    
    // Validate
    const { isValid, pendingField } = validateMandatoryFields(data, fields);

    if (!isValid && pendingField) {
        showValidationError(pendingField);
        const y = layoutMap.current[pendingField];
        if (y !== undefined && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: y - 20, animated: true });
        }
        return;
    }

    const update: Partial<InvestorOnboardingData> = {
        frequency, sector
    };
    setInternalInvestorData(update);
    router.push('/(onboarding)/investor/3-preferences');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
      >
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: theme.text }]}>Investor Profile</Text>
        <ProgressBar progress={STEP / TOTAL_STEPS} />
      </View>

      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.sectionHeader, { color: theme.primary, marginTop: 0 }]}>Focus Areas</Text>
        
        <View onLayout={(e) => captureLayout('frequency', e)}>
            <SelectionGroup title="Investment Frequency" options={FREQUENCIES} selected={frequency} onSelect={setFrequency} />
        </View>

        <View onLayout={(e) => captureLayout('sector', e)}>
            <SelectionGroup title="Sector Preference" options={SECTORS} selected={sector} onSelect={setSector} maxSelect={10} />
        </View>

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


