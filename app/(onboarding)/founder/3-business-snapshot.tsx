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

const BUSINESS_MODELS = [
  'B2B', 'B2C', 'B2B2C', 'Marketplace', 'Platform/API', 'Government / Enterprise Contracts'
];

const TARGET_MARKETS = [
  'Consumers (B2C)', 'SMB / MSMEs', 'Enterprises', 'Government', 
  'Non-profits / NGOs'
];

const FUNDING_HISTORY = [
  'Bootstrapped', 'Friends & Family', 'Angel Round', 'Seed Round', 
  'Pre-Series A', 'Series A +'
];

const INVESTOR_TYPES = [
  'No Preference', 'Angel Investor', 'VC', 'Family Office', 
  'Impact Fund', 'Accelerator'
];

const STEP = 3;
const TOTAL_STEPS = 4;

export default function BusinessSnapshotScreen() {
  const router = useRouter();
  const theme = useThemeColor();
  const scrollViewRef = useRef<ScrollView>(null);
  const layoutMap = useRef<Record<string, number>>({});
  
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

  const captureLayout = (field: string, event: LayoutChangeEvent) => {
    layoutMap.current[field] = event.nativeEvent.layout.y;
  };

  const nextStep = () => {
    const data = { model, targetMarket, fundingHistory, investorType };
    const fields = ['model', 'targetMarket', 'fundingHistory', 'investorType'];
    
    const { isValid, pendingField } = validateMandatoryFields(data, fields);

    if (!isValid && pendingField) {
        showValidationError(pendingField);
        const y = layoutMap.current[pendingField];
        if (y !== undefined && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: y - 20, animated: true });
        }
        return;
    }

    const update: Partial<FounderOnboardingData> = {
        model, targetMarket, fundingHistory, investorType
    };
    setInternalFounderData(update);
    // Updated route to 4-additional
    router.push('/(onboarding)/founder/4-additional');
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
        <Text style={[styles.sectionHeader, { color: theme.primary, marginTop: 0 }]}>Business Snapshot</Text>
        
        <View onLayout={(e) => captureLayout('model', e)}>
            <SelectionGroup title="Business Model" options={BUSINESS_MODELS} selected={model} onSelect={setModel} maxSelect={10} />
        </View>

        <View onLayout={(e) => captureLayout('targetMarket', e)}>
            <SelectionGroup title="Target Market Type" options={TARGET_MARKETS} selected={targetMarket} onSelect={setTargetMarket} maxSelect={10} />
        </View>

        <View onLayout={(e) => captureLayout('fundingHistory', e)}>
            <SelectionGroup title="Funding History" options={FUNDING_HISTORY} selected={fundingHistory} onSelect={setFundingHistory} maxSelect={10} />
        </View>

        <View onLayout={(e) => captureLayout('investorType', e)}>
            <SelectionGroup title="Preferred Investor Type" options={INVESTOR_TYPES} selected={investorType} onSelect={setInvestorType} maxSelect={10} />
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
