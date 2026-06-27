import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import {
  getInternalFounderData,
  setInternalFounderData,
  setUserOnboardingStatus,
} from '@/utils/storage/onboarding';
import { submitFounderOnboarding, FounderOnboardingRequest } from '@/utils/api/onboarding';
import { uploadAndIngestPitchDeck } from '@/utils/api/ingestion';
import { showError } from '@/utils/validation';
import { ApiError } from '@/utils/api/client';

interface PickedDeck {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
}

const STEP = 4;
const TOTAL_STEPS = 4;

export default function PitchDeckScreen() {
  const router = useRouter();
  const theme = useThemeColor();

  const [deck, setDeck] = useState<PickedDeck | undefined>();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const data = getInternalFounderData();
    if (data.pitchDeckUri) {
      // Restore just the local reference; metadata is re-read if they re-pick.
      setDeck({ uri: data.pitchDeckUri, name: 'Selected pitch deck', mimeType: '', size: 0 });
    }
  }, []);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length) {
        const asset = result.assets[0];
        setDeck({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType ?? 'application/pdf',
          size: asset.size ?? 0,
        });
      }
    } catch {
      showError('Failed to select the file. Please try again.');
    }
  };

  // Pulls the validated founder payload out of the saved draft.
  const buildPayload = (): FounderOnboardingRequest | null => {
    const d = getInternalFounderData();
    if (
      !d.startup_name ||
      !d.one_line_desc ||
      !d.full_desc ||
      !d.stage ||
      !d.trl ||
      d.target_raise_inr == null ||
      d.min_cheque_inr == null
    ) {
      return null;
    }
    return {
      startup_name: d.startup_name,
      one_line_desc: d.one_line_desc,
      full_desc: d.full_desc,
      stage: d.stage,
      trl: d.trl,
      target_raise_inr: d.target_raise_inr,
      min_cheque_inr: d.min_cheque_inr,
    };
  };

  const handleComplete = async () => {
    const payload = buildPayload();
    if (!payload) {
      showError('Some details are missing. Please go back and complete the earlier steps.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Create the founder profile (required).
      await submitFounderOnboarding(payload);
      setUserOnboardingStatus();
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.message
          : 'Could not complete onboarding. Please check your connection and try again.';
      showError(message);
      setSubmitting(false);
      return;
    }

    // 2. Upload the deck (optional, best-effort): backend signs a URL, we PUT to
    //    it, then the backend ingests it. A failure here shouldn't block the user.
    if (deck?.uri && deck.size > 0) {
      try {
        const storagePath = await uploadAndIngestPitchDeck({
          localUri: deck.uri,
          filename: deck.name,
          contentType: deck.mimeType || 'application/pdf',
          sizeBytes: deck.size,
        });
        setInternalFounderData({ pitchDeckUri: deck.uri, pitchDeckPath: storagePath });
      } catch {
        Alert.alert(
          'Profile created',
          "We couldn't upload your pitch deck, but your profile is ready. You can add it later.",
        );
      }
    }

    setSubmitting(false);
    router.replace('/(tabs)/discover');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: theme.text }]}>Founder Profile</Text>
        <ProgressBar progress={STEP / TOTAL_STEPS} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionHeader, { color: theme.primary }]}>Pitch Deck</Text>
        <Text style={[styles.subText, { color: theme.icon }]}>
          Upload your pitch deck for matched investors to view. PDF or PPTX. This step is optional.
        </Text>

        <View style={styles.uploadContainer}>
          <TouchableOpacity
            style={[styles.uploadBox, { borderColor: theme.primary, backgroundColor: theme.secondary }]}
            onPress={handleUpload}
            activeOpacity={0.7}
            disabled={submitting}
          >
            <Ionicons name="cloud-upload-outline" size={48} color={theme.primary} />
            <Text style={[styles.uploadBoxText, { color: theme.primary }]}>
              {deck?.uri ? 'Replace pitch deck' : 'Tap to upload'}
            </Text>
          </TouchableOpacity>

          {deck?.name && (
            <View style={[styles.fileContainer, { backgroundColor: theme.secondary }]}>
              <Ionicons name="document" size={24} color={theme.primary} />
              <Text style={[styles.fileName, { color: theme.text }]} numberOfLines={1}>
                {deck.name}
              </Text>
            </View>
          )}
        </View>
      </View>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 },
  content: { padding: 24, paddingTop: 0, flex: 1 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  subText: { fontSize: 14, marginBottom: 40 },
  uploadContainer: { flex: 1, alignItems: 'center', paddingTop: 20 },
  uploadBox: {
    width: 220,
    height: 220,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  uploadBoxText: { marginTop: 16, fontSize: 16, fontWeight: '600' },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  fileName: { marginLeft: 12, fontSize: 16, flex: 1 },
  footer: { padding: 24, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0 },
  footerButtonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
});
