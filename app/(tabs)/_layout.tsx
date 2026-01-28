import { Tabs } from "expo-router";
import { useThemeColor } from "@/utils/contexts/ColorProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';


export default function TabsLayout() {
    const theme = useThemeColor();
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: theme.background
            }
        }}>
            <Tabs.Screen name="discover" options={{
                title: "Discover",
                tabBarIcon: () => (
                    <Ionicons name="home" size={24} color={theme.primary} />
                )
            }}/>
            <Tabs.Screen name="profile" options={{
                title: "Profile"
            }}/>
        </Tabs>
    )
}