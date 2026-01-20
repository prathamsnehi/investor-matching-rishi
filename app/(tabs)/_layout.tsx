import { Tabs } from "expo-router";

export default function TabsLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="discover" options={{
                title: "Discover"
            }}/>
            <Tabs.Screen name="profile" options={{
                title: "Profile"
            }}/>
        </Tabs>
    )
}