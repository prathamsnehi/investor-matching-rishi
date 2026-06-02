import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/utils/contexts/ColorProvider';
import mmkvStorage from '@/utils/storage/mmkvStorage';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function ProfileScreen() {
  const router = useRouter();
  const theme = useThemeColor();

  const handleClearData = () => {
    Alert.alert(
      "Clear Onboarding Data",
      "Are you sure you want to clear all data and reset the app?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive", 
          onPress: () => {
            mmkvStorage.clearAll();
            router.replace('/');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* User Info Placeholder */}
        <View style={[styles.section, { backgroundColor: theme.background, borderColor: theme.gray }]}>
            <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={theme.icon} />
            </View>
            <View>
                <Text style={[styles.name, { color: theme.text }]}>Demo User</Text>
                <Text style={[styles.role, { color: theme.icon }]}>Founder</Text>
            </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.icon }]}>Developer Menu</Text>
        <View style={[styles.section, { backgroundColor: theme.background, borderColor: theme.gray, paddingVertical: 0 }]}>
            <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.gray }]} onPress={handleClearData}>
                <View style={styles.menuItemLeft}>
                    <Ionicons name="trash-outline" size={20} color={theme.error} />
                    <Text style={[styles.menuItemText, { color: theme.error }]}>Clear Onboarding Data</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.icon} />
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  role: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  menuItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  }
});
