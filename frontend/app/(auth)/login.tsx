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
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useThemeColor } from "@/utils/contexts/ColorProvider";
import { login } from "@/utils/api/auth";
import { setAuthSession } from "@/utils/storage/auth";
import { routeAfterAuth } from "@/utils/navigation";
import { isValidEmail, showError } from "@/utils/validation";
import { ApiError } from "@/utils/api/client";

export default function LoginScreen() {
  const router = useRouter();
  const theme = useThemeColor();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!isValidEmail(email)) {
      showError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      showError("Please enter your password.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      setAuthSession({
        access_token: res.access_token,
        role: res.role,
        email: res.email,
      });
      routeAfterAuth();
    } catch (e) {
      const message =
        e instanceof ApiError ? e.message : "Unable to sign in. Please try again.";
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
          <Text style={[styles.title, { color: theme.text }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: theme.icon }]}>
            Sign in to continue to your account.
          </Text>

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
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry
            autoCapitalize="none"
          />

          <Button
            title="Sign in"
            variant="primary"
            loading={loading}
            onPress={handleLogin}
            style={{ marginTop: 8 }}
          />

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => router.replace("/(auth)/signup")}
          >
            <Text style={[styles.linkText, { color: theme.icon }]}>
              Don&apos;t have an account?{" "}
              <Text style={{ color: theme.primary, fontWeight: "600" }}>Create one</Text>
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
  subtitle: { fontSize: 16, marginBottom: 32 },
  linkRow: { marginTop: 24, alignItems: "center" },
  linkText: { fontSize: 14 },
});
