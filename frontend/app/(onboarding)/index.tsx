import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { RoleCard } from "@/components/onboarding/RoleCard";
import { useThemeColor } from "@/utils/contexts/ColorProvider";

export default function OnboardingIndex() {
  const router = useRouter();
  const theme = useThemeColor();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.header, { color: theme.text }]}>Choose your path</Text>
        <Text style={[styles.subheader, { color: theme.icon }]}>
          Are you looking for funding or looking to invest?
        </Text>

        <View style={styles.cardsContainer}>
          <RoleCard
            title="I'm a Founder"
            description="I have a startup and I'm looking for investors."
            iconName="rocket-outline"
            onPress={() => router.push("/(onboarding)/founder")}
          />
          
          <RoleCard
            title="I'm an Investor"
            description="I'm looking for promising startups to invest in."
            iconName="cash-outline"
            onPress={() => router.push("/(onboarding)/investor")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subheader: {
    fontSize: 16,
    marginBottom: 48,
    textAlign: "center",
    lineHeight: 24,
  },
  cardsContainer: {
    gap: 16,
  },
});
