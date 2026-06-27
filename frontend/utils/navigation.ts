import { router } from "expo-router";
import { getUserOnboardingStatus } from "@/utils/storage/onboarding";

/**
 * Sends a freshly-authenticated user to the right place:
 * onboarded users go to Discover, everyone else into the onboarding flow
 * (which itself routes by stored role).
 */
export const routeAfterAuth = () => {
  if (getUserOnboardingStatus()) {
    router.replace("/(tabs)/discover");
  } else {
    router.replace("/(onboarding)");
  }
};
