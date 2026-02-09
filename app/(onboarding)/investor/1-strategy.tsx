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

const FUND_TYPES = [
  'Angel Syndicate', 'Micro VC', 'Early Stage VC', 'Growth VC', 'Corporate VC', 'Family Office', 'PE Fund', 'Other'
];

const REGIONS = [
  'India', 'SEA', 'Middle East', 'Europe', 'North America', 'Global'
];

const STAGES = [
  'Pre-Seed', 'Seed', 'Pre-Series A', 'Series A', 'Series B+'
];

const TICKET_SIZES = [
  '< ₹25 L', '₹25 L–₹1 Cr', '₹1–3 Cr', '₹3–10 Cr', '₹10 Cr +'
];

const STEP = 1;
const TOTAL_STEPS = 3;

export default function StrategyScreen() {
  const router = useRouter();
  const theme = useThemeColor();
  const scrollViewRef = useRef<ScrollView>(null);
  const layoutMap = useRef<Record<string, number>>({});
  
  const [fundType, setFundType] = useState<string[]>([]);
  const [region, setRegion] = useState<string[]>([]);
  const [stage, setStage] = useState<string[]>([]);
  const [ticketSize, setTicketSize] = useState<string[]>([]);

  useEffect(() => {
    const data = getInternalInvestorData();
    if (data.fundType) setFundType(data.fundType);
    if (data.region) setRegion(data.region);
    if (data.stage) setStage(data.stage);
    if (data.ticketSize) setTicketSize(data.ticketSize);
  }, []);

  const captureLayout = (field: string, event: LayoutChangeEvent) => {
    layoutMap.current[field] = event.nativeEvent.layout.y;
  };

  const nextStep = () => {
    const data = { fundType, region, stage, ticketSize };
    const fields = ['fundType', 'region', 'stage', 'ticketSize'];
    
    // Validate
    const { isValid, pendingField } = validateMandatoryFields(data, fields);

    if (!isValid && pendingField) {
        showValidationError(pendingField);
        // Scroll
        const y = layoutMap.current[pendingField];
        if (y !== undefined && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: y - 20, animated: true });
        }
        return;
    }

    const update: Partial<InvestorOnboardingData> = {
        fundType, region, stage, ticketSize
    };
    setInternalInvestorData(update);
    router.push('/(onboarding)/investor/2-focus-areas');
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
        <Text style={[styles.sectionHeader, { color: theme.primary, marginTop: 0 }]}>Investment Strategy</Text>
        
        <View onLayout={(e) => captureLayout('fundType', e)}>
            <SelectionGroup title="Fund Structure / Type" options={FUND_TYPES} selected={fundType} onSelect={setFundType} />
        </View>

        <View onLayout={(e) => captureLayout('ticketSize', e)}>
            <SelectionGroup title="Ticket Size" options={TICKET_SIZES} selected={ticketSize} onSelect={setTicketSize} />
        </View>

        <View onLayout={(e) => captureLayout('region', e)}>
            <SelectionGroup title="Primary Geography Focus" options={REGIONS} selected={region} onSelect={setRegion} maxSelect={10} />
        </View>

        <View onLayout={(e) => captureLayout('stage', e)}>
            <SelectionGroup title="Preferred Stage(s)" options={STAGES} selected={stage} onSelect={setStage} maxSelect={10} />
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


