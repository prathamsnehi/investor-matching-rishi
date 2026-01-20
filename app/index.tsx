import { Redirect } from "expo-router";
import { getUserOnboardingStatus } from "@/utils/storage/onboarding";

export default function Index() {
  // synchronous onboarding status check:
  const isOnboarded = getUserOnboardingStatus();

  if (isOnboarded) {
    return <Redirect href="/(tabs)/discover" />;
  }

  return <Redirect href="/(onboarding)" />;
}
