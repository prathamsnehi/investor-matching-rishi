import { Stack } from 'expo-router';
import { useThemeColor } from '@/utils/contexts/ColorProvider';

export default function FounderLayout() {
  const theme = useThemeColor();

  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: theme.background },
      animation: 'slide_from_right'
    }}>
      <Stack.Screen name="1-basic-info" />
      <Stack.Screen name="2-stage" />
      <Stack.Screen name="3-fundraising" />
      <Stack.Screen name="4-pitch-deck" />
    </Stack>
  );
}
