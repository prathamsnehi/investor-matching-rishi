import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SelectionGroup } from '@/components/onboarding/SelectionGroup';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import { getInternalInvestorData, setInternalInvestorData } from '@/utils/storage/onboarding';
import { showError } from '@/utils/validation';
import { INVESTOR_TYPE_OPTIONS, labelsToValues, valuesToLabels } from '@/constants/enums';

const STEP = 1;
const TOTAL_STEPS = 3;
const TYPE_LABELS = INVESTOR_TYPE_OPTIONS.map((o) => o.label);

export default function InvestorProfileScreen() {
  const router = useRouter();
  const theme = useThemeColor();

  const [investorType, setInvestorType] = useState<string[]>([]);
  const [briefBio, setBriefBio] = useState('');

  useEffect(() => {
    const data = getInternalInvestorData();
    if (data.investor_type) setInvestorType(valuesToLabels(INVESTOR_TYPE_OPTIONS, [data.investor_type]));
    if (data.brief_bio) setBriefBio(data.brief_bio);
  }, []);

  const nextStep = () => {
    if (investorType.length === 0) return showError('Please select how you invest.');
    if (!briefBio.trim()) return showError('Please add a brief bio.');

    setInternalInvestorData({
      investor_type: labelsToValues(INVESTOR_TYPE_OPTIONS, investorType)[0],
      brief_bio: briefBio.trim(),
    });
    router.push('/(onboarding)/investor/2-thesis');
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

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.sectionHeader, { color: theme.primary }]}>Your Profile</Text>

          <SelectionGroup title="I am investing as" options={TYPE_LABELS} selected={investorType} onSelect={setInvestorType} />
          <TextField
            label="Brief bio"
            value={briefBio}
            onChangeText={setBriefBio}
            placeholder="Your background and what you bring beyond capital."
            multiline
          />

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.gray }]}>
          <View style={styles.footerButtonContainer}>
            <Button title="Cancel" variant="outline" onPress={() => router.back()} style={{ flex: 1, marginRight: 12 }} />
            <Button title="Next" variant="primary" onPress={nextStep} style={{ flex: 1 }} />
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
  footerButtonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
});
