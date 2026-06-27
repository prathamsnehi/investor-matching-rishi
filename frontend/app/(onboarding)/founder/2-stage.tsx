import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { SelectionGroup } from '@/components/onboarding/SelectionGroup';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import { getInternalFounderData, setInternalFounderData } from '@/utils/storage/onboarding';
import { showError } from '@/utils/validation';
import {
  FUNDING_STAGE_OPTIONS,
  TRL_OPTIONS,
  labelsToValues,
  valuesToLabels,
} from '@/constants/enums';

const STEP = 2;
const TOTAL_STEPS = 4;

const STAGE_LABELS = FUNDING_STAGE_OPTIONS.map((o) => o.label);
const TRL_LABELS = TRL_OPTIONS.map((o) => o.label);

export default function StageScreen() {
  const router = useRouter();
  const theme = useThemeColor();

  const [stage, setStage] = useState<string[]>([]);
  const [trl, setTrl] = useState<string[]>([]);

  useEffect(() => {
    const data = getInternalFounderData();
    if (data.stage) setStage(valuesToLabels(FUNDING_STAGE_OPTIONS, [data.stage]));
    if (data.trl) setTrl(valuesToLabels(TRL_OPTIONS, [data.trl]));
  }, []);

  const nextStep = () => {
    if (stage.length === 0) return showError('Please select your fundraising stage.');
    if (trl.length === 0) return showError('Please select your technology readiness level.');

    setInternalFounderData({
      stage: labelsToValues(FUNDING_STAGE_OPTIONS, stage)[0],
      trl: labelsToValues(TRL_OPTIONS, trl)[0],
    });
    router.push('/(onboarding)/founder/3-fundraising');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: theme.text }]}>Founder Profile</Text>
        <ProgressBar progress={STEP / TOTAL_STEPS} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.sectionHeader, { color: theme.primary }]}>Stage & Readiness</Text>

        <SelectionGroup title="Fundraising stage" options={STAGE_LABELS} selected={stage} onSelect={setStage} />
        <SelectionGroup title="Technology readiness level" options={TRL_LABELS} selected={trl} onSelect={setTrl} />

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
