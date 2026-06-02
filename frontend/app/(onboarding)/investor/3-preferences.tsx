import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, LayoutChangeEvent, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SelectionGroup } from '@/components/onboarding/SelectionGroup';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import { getInternalInvestorData, setInternalInvestorData, setUserOnboardingStatus } from '@/utils/storage/onboarding';
import { InvestorOnboardingData } from '@/utils/storage/types';
import { validateMandatoryFields, showValidationError } from '@/utils/validation';

const INVOLVEMENT = [
  'Passive capital only', 'Active advisory role', 
  'Strategic guidance when requested', 
  'Board seat required', 
  'Hands-on operator support'
];

const EXIT_EXPECTATIONS = [
  'Short Term (2–5 yrs)', 'Medium Term (5–8 yrs)', 'Long Term (8+ yrs)'
];

const STEP = 3;
const TOTAL_STEPS = 3;

export default function PreferencesScreen() {
  const router = useRouter();
  const theme = useThemeColor();
  const scrollViewRef = useRef<ScrollView>(null);
  const layoutMap = useRef<Record<string, number>>({});
  
  const [involvement, setInvolvement] = useState<string[]>([]);
  const [exit, setExit] = useState<string[]>([]);

  useEffect(() => {
    const data = getInternalInvestorData();
    if (data.involvement) setInvolvement(data.involvement);
    if (data.exit) setExit(data.exit);
  }, []);

  const captureLayout = (field: string, event: LayoutChangeEvent) => {
    layoutMap.current[field] = event.nativeEvent.layout.y;
  };

  const handleComplete = () => {
    const data = { involvement, exit };
    const fields = ['involvement', 'exit'];
    
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
        involvement, exit
    };
    setInternalInvestorData(update);
    setUserOnboardingStatus();
    router.replace('/(tabs)/discover');
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
        <Text style={[styles.sectionHeader, { color: theme.primary, marginTop: 0 }]}>Preferences</Text>
        
        <View onLayout={(e) => captureLayout('involvement', e)}>
            <SelectionGroup title="Involvement Level" options={INVOLVEMENT} selected={involvement} onSelect={setInvolvement} maxSelect={10} />
        </View>

        <View onLayout={(e) => captureLayout('exit', e)}>
            <SelectionGroup title="Exit Expectations" options={EXIT_EXPECTATIONS} selected={exit} onSelect={setExit} />
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
            title="Complete" 
            variant="primary" 
            onPress={handleComplete} 
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


