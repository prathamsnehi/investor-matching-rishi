import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { SelectionGroup } from '@/components/onboarding/SelectionGroup';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import { getInternalInvestorData, setInternalInvestorData } from '@/utils/storage/onboarding';
import { showError } from '@/utils/validation';
import {
  FUNDING_STAGE_OPTIONS,
  TRL_OPTIONS,
  labelsToValues,
  valuesToLabels,
} from '@/constants/enums';

const STEP = 2;
const TOTAL_STEPS = 3;
const STAGE_LABELS = FUNDING_STAGE_OPTIONS.map((o) => o.label);
const TRL_LABELS = TRL_OPTIONS.map((o) => o.label);

export default function ThesisScreen() {
  const router = useRouter();
  const theme = useThemeColor();

  const [stages, setStages] = useState<string[]>([]);
  const [minTrl, setMinTrl] = useState<string[]>([]);

  useEffect(() => {
    const data = getInternalInvestorData();
    if (data.preferred_stages) setStages(valuesToLabels(FUNDING_STAGE_OPTIONS, data.preferred_stages));
    if (data.min_trl_accepted) setMinTrl(valuesToLabels(TRL_OPTIONS, [data.min_trl_accepted]));
  }, []);

  const nextStep = () => {
    if (stages.length === 0) return showError('Please select at least one preferred stage.');
    if (minTrl.length === 0) return showError('Please select the minimum technology readiness level.');

    setInternalInvestorData({
      preferred_stages: labelsToValues(FUNDING_STAGE_OPTIONS, stages),
      min_trl_accepted: labelsToValues(TRL_OPTIONS, minTrl)[0],
    });
    router.push('/(onboarding)/investor/3-cheque');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: theme.text }]}>Investor Profile</Text>
        <ProgressBar progress={STEP / TOTAL_STEPS} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionHeader, { color: theme.primary }]}>Investment Thesis</Text>

        <SelectionGroup title="Preferred fundraising stages" options={STAGE_LABELS} selected={stages} onSelect={setStages} maxSelect={STAGE_LABELS.length} />
        <SelectionGroup title="Minimum TRL you'll consider" options={TRL_LABELS} selected={minTrl} onSelect={setMinTrl} />

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.gray }]}>
        <View style={styles.footerButtonContainer}>
          <Button title="Back" variant="outline" onPress={() => router.back()} style={{ flex: 1, marginRight: 12 }} />
          <Button title="Next" variant="primary" onPress={nextStep} style={{ flex: 1 }} />
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
  footerButtonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
});
