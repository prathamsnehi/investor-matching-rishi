import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import { getInternalFounderData, setInternalFounderData, setUserOnboardingStatus } from '@/utils/storage/onboarding';
import { FounderOnboardingData } from '@/utils/storage/types';
import { showValidationError } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';

const STEP = 5;
const TOTAL_STEPS = 5;

export default function PitchDeckScreen() {
  const router = useRouter();
  const theme = useThemeColor();
  
  const [pitchDeckUri, setPitchDeckUri] = useState<string | undefined>();
  const [pitchDeckName, setPitchDeckName] = useState<string | undefined>();

  useEffect(() => {
    const data = getInternalFounderData();
    if (data.pitchDeckUri) {
      setPitchDeckUri(data.pitchDeckUri);
      setPitchDeckName("Selected Pitch Deck"); 
    }
  }, []);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf', 
          'application/vnd.ms-powerpoint', 
          'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setPitchDeckUri(result.assets[0].uri);
        setPitchDeckName(result.assets[0].name);
      }
    } catch (error) {
      console.log('Error picking document:', error);
      showValidationError('Failed to select the file. Please try again.');
    }
  };

  const handleComplete = () => {
    if (!pitchDeckUri) {
      showValidationError('Please upload a pitch deck to continue.');
      return;
    }
    const update: Partial<FounderOnboardingData> = {
        pitchDeckUri
    };
    setInternalFounderData(update);
    setUserOnboardingStatus(); // Mark as onboarded
    router.replace('/(tabs)/discover');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: theme.text }]}>Founder Profile</Text>
        <ProgressBar progress={STEP / TOTAL_STEPS} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionHeader, { color: theme.primary, marginTop: 0 }]}>Pitch Deck Upload</Text>
        <Text style={[styles.subText, { color: theme.icon }]}>Upload your pitch deck for other investors to see. PDF or PPTX.</Text>

        <View style={styles.uploadContainer}>
          <View style={{ height: 220, width: '100%', alignItems: 'center' }}>
            <TouchableOpacity 
              style={[styles.uploadBox, { borderColor: theme.primary, backgroundColor: theme.secondary }]} 
              onPress={handleUpload}
              activeOpacity={0.7}
            >
              <Ionicons name="cloud-upload-outline" size={48} color={theme.primary} />
              <Text style={[styles.uploadBoxText, { color: theme.primary }]}>
                {pitchDeckUri ? "Replace Pitch Deck" : "Tap to Upload"}
              </Text>
            </TouchableOpacity>
            
            {pitchDeckName && (
               <View style={[styles.fileContainer, { backgroundColor: theme.secondary }]}>
                  <Ionicons name="document" size={24} color={theme.primary} />
                  <Text style={[styles.fileName, { color: theme.text }]} numberOfLines={1}>
                    {pitchDeckName}
                  </Text>
               </View>
            )}
          </View>
        </View>
      </View>

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
  uploadContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  uploadBox: { width: 220, height: 220, borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  uploadBoxText: { marginTop: 16, fontSize: 16, fontWeight: '600' },
  fileContainer: { position: 'absolute', top: 236, flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, width: '100%' },
  fileName: { marginLeft: 12, fontSize: 16, flex: 1 },
  footer: { padding: 24, borderTopWidth: 1, position: 'absolute', bottom: 0, left: 0, right: 0 },
  footerButtonContainer: { flexDirection: 'row', justifyContent: 'space-between' }
});
