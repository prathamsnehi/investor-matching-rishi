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

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ColorProvider>
        <RootLayoutContent />
      </ColorProvider>
    </GestureHandlerRootView>
  );
}
