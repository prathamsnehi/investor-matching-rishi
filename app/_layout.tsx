import { Stack } from "expo-router";
import { ColorProvider, useThemeColor } from "@/utils/contexts/ColorProvider";

function RootLayoutContent() {
  const theme = useThemeColor();

  return (
    <Stack screenOptions={{
      headerShown: false,
    }}>
      <Stack.Screen name="(tabs)"/>
      <Stack.Screen name="(onboarding)" options={{
        title: "Onboarding"
      }}/>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ColorProvider>
      <RootLayoutContent />
    </ColorProvider>
  );
}
