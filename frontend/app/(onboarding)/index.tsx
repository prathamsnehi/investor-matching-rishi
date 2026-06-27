import { Redirect } from "expo-router";
import { getUserRole } from "@/utils/storage/auth";

export default function OnboardingIndex() {
  // Role is chosen at sign-up, so route straight into the matching flow.
  const role = getUserRole();

  if (role === "INVESTOR") {
    return <Redirect href="/(onboarding)/investor" />;
  }
  if (role === "FOUNDER") {
    return <Redirect href="/(onboarding)/founder" />;
  }

  // No role on record (shouldn't happen post sign-up) — send back to auth.
  return <Redirect href="/(auth)/welcome" />;
}
