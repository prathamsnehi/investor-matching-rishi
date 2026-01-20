import { View, Text, StyleSheet } from "react-native";
import { Link, useRouter, Redirect } from "expo-router";
import { Button } from "@/components/ui/Button";
import { useThemeColor } from "@/utils/contexts/ColorProvider";
import { useEffect, useState } from "react";
import { getUserOnboardingStatus, setUserOnboardingStatus } from "@/utils/storage/onboarding";

export default function Index() {
  const [didUserOnboard, setDidUserOnboard] = useState(false);

  useEffect(() => {
    const status = getUserOnboardingStatus();
    setUserOnboardingStatus();
  })

  if (didUserOnboard) {
    return <Redirect href="/(tabs)/discover" />;
  }

  return <Redirect href="/(onboarding)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  button: {
    width: "100%",
  },
});

