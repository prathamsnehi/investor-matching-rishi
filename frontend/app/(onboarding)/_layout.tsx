import { Stack } from "expo-router";
import { useThemeColor } from "@/utils/contexts/ColorProvider";

export default function OnboardingLayout() {
  const theme = useThemeColor();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="index" options={{
        title: "Onboarding"
      }}/>
      </Stack>
  );
}
