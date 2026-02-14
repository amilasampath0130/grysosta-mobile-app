import { View, Text, StyleSheet } from "react-native";
import { Theme } from "@/theme";

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Page Not Found</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background_cream,
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
    color: Theme.colors.accent_terracotta,
  },
});
