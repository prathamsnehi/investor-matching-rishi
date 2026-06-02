import { Stack } from 'expo-router';
import { useThemeColor } from '@/utils/contexts/ColorProvider';

export default function InvestorLayout() {
  const theme = useThemeColor();

  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: theme.background },
      animation: 'slide_from_right'
    }}>
      <Stack.Screen name="1-strategy" />
      <Stack.Screen name="2-focus-areas" />
      <Stack.Screen name="3-preferences" />
    </Stack>
  );
}
