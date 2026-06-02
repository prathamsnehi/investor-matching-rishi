import { Stack } from 'expo-router';
import { useThemeColor } from '@/utils/contexts/ColorProvider';

export default function ProfileLayout() {
  const theme = useThemeColor();
  return (
    <Stack>
        <Stack.Screen name='index' options={{
            title: "Profile",
            headerStyle: { backgroundColor: theme.background },
            headerTitleStyle: { color: theme.text },
            headerTintColor: theme.primary
        }}/>
    </Stack>
  );
}
