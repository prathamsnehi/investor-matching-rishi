import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useThemeColor } from "@/utils/contexts/ColorProvider";
import { signup, login } from "@/utils/api/auth";
import { setAuthSession } from "@/utils/storage/auth";
import { routeAfterAuth } from "@/utils/navigation";
import { isValidEmail, isValidUrl, showError } from "@/utils/validation";
import { ApiError } from "@/utils/api/client";
import { AccountRole } from "@/constants/enums";

const ROLE_OPTIONS: { role: AccountRole; title: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { role: "FOUNDER", title: "Founder", icon: "rocket-outline" },
  { role: "INVESTOR", title: "Investor", icon: "cash-outline" },
];

export default function SignupScreen() {
  const router = useRouter();
  const theme = useThemeColor();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [role, setRole] = useState<AccountRole | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName.trim()) return showError("Please enter your full name.");
    if (!isValidEmail(email)) return showError("Please enter a valid email address.");
    if (!mobile.trim()) return showError("Please enter your mobile number.");
    if (password.length < 8) return showError("Password must be at least 8 characters.");
    if (!role) return showError("Please select whether you're a founder or an investor.");
    if (linkedin.trim() && !isValidUrl(linkedin)) {
      return showError("LinkedIn URL must start with http:// or https://");
    }

    setLoading(true);
    try {
      await signup({
        full_name: fullName.trim(),
        email_address: email.trim(),
        mobile_number: mobile.trim(),
        password,
        role,
        linkedin_profile_url: linkedin.trim() || null,
      });

      // Sign-up returns no token, so log in immediately to start the session.
      const session = await login(email.trim(), password);
      setAuthSession({
        access_token: session.access_token,
        role: session.role,
        email: session.email,
      });
      routeAfterAuth();
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Unable to create your account. Please try again.";
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={[styles.title, { color: theme.text }]}>Create your account</Text>
          <Text style={[styles.subtitle, { color: theme.icon }]}>
            Tell us a bit about you to get started.
          </Text>

          <Text style={[styles.roleLabel, { color: theme.text }]}>I am a</Text>
          <View style={styles.roleRow}>
            {ROLE_OPTIONS.map((opt) => {
              const selected = role === opt.role;
              return (
                <TouchableOpacity
                  key={opt.role}
                  style={[
                    styles.roleCard,
                    {
                      borderColor: selected ? theme.primary : theme.gray,
                      backgroundColor: selected ? theme.secondary : "transparent",
                    },
                  ]}
                  onPress={() => setRole(opt.role)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={opt.icon}
                    size={28}
                    color={selected ? theme.primary : theme.icon}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      { color: selected ? theme.primary : theme.text },
                    ]}
                  >
                    {opt.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TextField
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Ada Lovelace"
            autoComplete="name"
          />
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <TextField
            label="Mobile number"
            value={mobile}
            onChangeText={setMobile}
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
            helperText="Include your country code, e.g. +91."
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 8 characters"
            secureTextEntry
            autoCapitalize="none"
          />
          <TextField
            label="LinkedIn URL (optional)"
            value={linkedin}
            onChangeText={setLinkedin}
            placeholder="https://www.linkedin.com/in/you"
            keyboardType="url"
            autoCapitalize="none"
          />

          <Button
            title="Create account"
            variant="primary"
            loading={loading}
            onPress={handleSignup}
            style={{ marginTop: 8 }}
          />

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.replace("/(auth)/login")}
          >
            <Text style={[styles.linkText, { color: theme.icon }]}>
              Already have an account?{" "}
              <Text style={{ color: theme.primary, fontWeight: "600" }}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 40, flexGrow: 1 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 28 },
  roleLabel: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  roleRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  roleCard: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
    gap: 8,
  },
  roleText: { fontSize: 16, fontWeight: "600" },
  linkRow: { marginTop: 24, alignItems: "center" },
  linkText: { fontSize: 14 },
});
