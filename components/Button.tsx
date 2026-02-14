import { StyleSheet, Text, View, Pressable } from "react-native";
import React from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Theme } from "@/theme";

type Props = {
  label: String;
  theme?: "primary";
};
export default function Button({ label, theme }: Props) {
  if (theme === "primary") {
    return (
      <View
        style={[
          styles.buttonContainer,
          { borderColor: Theme.colors.accent_terracotta, borderWidth: 4 },
        ]}
      >
        <Pressable
          style={styles.button}
          onPress={() => alert("You pressed a button")}
        >
          <FontAwesome
            name="picture-o"
            size={18}
            color={Theme.colors.text_charcoal}
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonLable}>{label}</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View style={[styles.buttonContainer]}>
      <Pressable
        style={styles.button}
        onPress={() => alert("You pressed a button")}
      >
        <FontAwesome
          name="picture-o"
          size={18}
          color={Theme.colors.text_charcoal}
          style={styles.buttonIcon}
        />
        <Text style={styles.buttonLable}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonLable: {
    color: Theme.colors.text_charcoal,
    fontSize: 20,
    fontWeight: "bold",
  },
  button: {
    borderRadius: 10,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: Theme.colors.background_cream,
  },
  buttonContainer: {
    width: 320,
    height: 68,
    marginHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    padding: 3,
    marginBottom: 10,
  },
  buttonIcon: {
    paddingRight: 8,
  },
});
