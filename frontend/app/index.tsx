import { Redirect } from "expo-router";
import { getUserOnboardingStatus } from "@/utils/storage/onboarding";
import { isAuthenticated } from "@/utils/storage/auth";

export default function Index() {
  // Gate order: must be signed in -> must be onboarded -> app.
  if (!isAuthenticated()) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (!getUserOnboardingStatus()) {
    return <Redirect href="/(onboarding)" />;
  }

  return <Redirect href="/(tabs)/discover" />;
}
