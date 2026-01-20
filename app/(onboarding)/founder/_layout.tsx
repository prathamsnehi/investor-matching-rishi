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
      <Stack.Screen name="2-founding-year" />
      <Stack.Screen name="3-business-snapshot" />
      <Stack.Screen name="4-optional" />
    </Stack>
  );
}
