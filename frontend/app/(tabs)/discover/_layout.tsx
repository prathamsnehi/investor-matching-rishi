import { Stack } from 'expo-router';
import { useThemeColor } from '@/utils/contexts/ColorProvider';

export default function DiscoverLayout() {
  const theme = useThemeColor();
  return (
    <Stack>
        <Stack.Screen name='index' options={{
            title: "Discover",
            headerShown: false,
        }}/>
    </Stack>
  );
}
