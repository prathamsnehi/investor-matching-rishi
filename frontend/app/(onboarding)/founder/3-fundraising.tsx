import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import { getInternalFounderData, setInternalFounderData } from '@/utils/storage/onboarding';
import { parseRupeeAmount, showError } from '@/utils/validation';

const STEP = 3;
const TOTAL_STEPS = 4;

const formatInr = (raw: string): string | undefined => {
  const value = parseRupeeAmount(raw);
  if (value === null) return undefined;
  return `≈ ₹${value.toLocaleString('en-IN')}`;
};

export default function FundraisingScreen() {
  const router = useRouter();
  const theme = useThemeColor();

  const [targetRaise, setTargetRaise] = useState('');
  const [minCheque, setMinCheque] = useState('');

  useEffect(() => {
    const data = getInternalFounderData();
    if (data.target_raise_inr) setTargetRaise(String(data.target_raise_inr));
    if (data.min_cheque_inr) setMinCheque(String(data.min_cheque_inr));
  }, []);

  const nextStep = () => {
    const target = parseRupeeAmount(targetRaise);
    const cheque = parseRupeeAmount(minCheque);

    if (target === null || target <= 0) return showError('Please enter a valid total raise amount.');
    if (cheque === null || cheque <= 0) return showError('Please enter a valid minimum cheque size.');
    if (cheque > target) return showError('Minimum cheque size cannot exceed your total raise.');

    setInternalFounderData({ target_raise_inr: target, min_cheque_inr: cheque });
    router.push('/(onboarding)/founder/4-pitch-deck');
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

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.sectionHeader, { color: theme.primary }]}>Fundraising</Text>

          <TextField
            label="Total amount being raised (₹)"
            value={targetRaise}
            onChangeText={setTargetRaise}
            placeholder="e.g. 2 Cr or 20000000"
            keyboardType="numbers-and-punctuation"
            helperText={formatInr(targetRaise) ?? 'Supports values like "2 Cr" or "50 L".'}
          />
          <TextField
            label="Minimum cheque size you'll accept (₹)"
            value={minCheque}
            onChangeText={setMinCheque}
            placeholder="e.g. 10 L or 1000000"
            keyboardType="numbers-and-punctuation"
            helperText={formatInr(minCheque) ?? 'Investors below this are filtered out.'}
          />

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.gray }]}>
          <View style={styles.footerButtonContainer}>
            <Button title="Back" variant="outline" onPress={() => router.back()} style={{ flex: 1, marginRight: 12 }} />
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
