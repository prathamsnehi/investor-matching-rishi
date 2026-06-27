import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import {
  getInternalInvestorData,
  setInternalInvestorData,
  setUserOnboardingStatus,
} from '@/utils/storage/onboarding';
import { submitInvestorOnboarding, InvestorOnboardingRequest } from '@/utils/api/onboarding';
import { parseRupeeAmount, showError } from '@/utils/validation';
import { ApiError } from '@/utils/api/client';

const STEP = 3;
const TOTAL_STEPS = 3;

const formatInr = (raw: string): string | undefined => {
  const value = parseRupeeAmount(raw);
  if (value === null) return undefined;
  return `≈ ₹${value.toLocaleString('en-IN')}`;
};

export default function ChequeScreen() {
  const router = useRouter();
  const theme = useThemeColor();

  const [minCheque, setMinCheque] = useState('');
  const [maxCheque, setMaxCheque] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const data = getInternalInvestorData();
    if (data.min_cheque_inr) setMinCheque(String(data.min_cheque_inr));
    if (data.max_cheque_inr) setMaxCheque(String(data.max_cheque_inr));
  }, []);

  const buildPayload = (min: number, max: number): InvestorOnboardingRequest | null => {
    const d = getInternalInvestorData();
    if (!d.investor_type || !d.brief_bio || !d.preferred_stages?.length || !d.min_trl_accepted) {
      return null;
    }
    return {
      investor_type: d.investor_type,
      brief_bio: d.brief_bio,
      preferred_stages: d.preferred_stages,
      min_trl_accepted: d.min_trl_accepted,
      min_cheque_inr: min,
      max_cheque_inr: max,
    };
  };

  const handleComplete = async () => {
    const min = parseRupeeAmount(minCheque);
    const max = parseRupeeAmount(maxCheque);

    if (min === null || min <= 0) return showError('Please enter a valid minimum cheque size.');
    if (max === null || max <= 0) return showError('Please enter a valid maximum cheque size.');
    if (min > max) return showError('Minimum cheque size cannot exceed the maximum.');

    setInternalInvestorData({ min_cheque_inr: min, max_cheque_inr: max });

    const payload = buildPayload(min, max);
    if (!payload) {
      showError('Some details are missing. Please go back and complete the earlier steps.');
      return;
    }

    setSubmitting(true);
    try {
      await submitInvestorOnboarding(payload);
      setUserOnboardingStatus();
      router.replace('/(tabs)/discover');
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : 'Could not complete onboarding. Please check your connection and try again.';
      showError(message);
    } finally {
      setSubmitting(false);
    }
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
          <Text style={[styles.sectionHeader, { color: theme.primary }]}>Cheque & Deployment</Text>

          <TextField
            label="Minimum cheque size (₹)"
            value={minCheque}
            onChangeText={setMinCheque}
            placeholder="e.g. 10 L or 1000000"
            keyboardType="numbers-and-punctuation"
            helperText={formatInr(minCheque) ?? 'Supports values like "10 L" or "1 Cr".'}
          />
          <TextField
            label="Maximum cheque size (₹)"
            value={maxCheque}
            onChangeText={setMaxCheque}
            placeholder="e.g. 5 Cr or 50000000"
            keyboardType="numbers-and-punctuation"
            helperText={formatInr(maxCheque) ?? 'Per-investment ceiling.'}
          />

          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.gray }]}>
          <View style={styles.footerButtonContainer}>
            <Button
              title="Back"
              variant="outline"
              onPress={() => router.back()}
              style={{ flex: 1, marginRight: 12 }}
              disabled={submitting}
            />
            <Button
              title="Complete"
              variant="primary"
              loading={submitting}
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
  footerButtonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
});
