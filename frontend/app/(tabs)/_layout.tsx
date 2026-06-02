import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';


export default function TabsLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="discover">
        <Label>Discover</Label>
        <Icon sf="magnifyingglass" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf="person.fill" />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}