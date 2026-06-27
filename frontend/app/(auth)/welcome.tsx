import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { useThemeColor } from "@/utils/contexts/ColorProvider";

export default function WelcomeScreen() {
  const router = useRouter();
  const theme = useThemeColor();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.secondary }]}>
          <Ionicons name="git-compare-outline" size={48} color={theme.primary} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Investor Matching</Text>
        <Text style={[styles.subtitle, { color: theme.icon }]}>
          Where founders and investors find their perfect match.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="Create an account"
          variant="primary"
          onPress={() => router.push("/(auth)/signup")}
          style={{ marginBottom: 12 }}
        />
        <Button
          title="I already have an account"
          variant="outline"
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 12, textAlign: "center" },
  subtitle: { fontSize: 16, textAlign: "center", lineHeight: 24, paddingHorizontal: 12 },
  footer: { padding: 24 },
});
