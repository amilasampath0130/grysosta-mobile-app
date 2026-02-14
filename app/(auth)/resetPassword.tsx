import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Theme } from "@/theme";

const resetPassword = () => {
  return (
    <View style={styles.maincontainer}>
      <Text>password</Text>
    </View>
  );
};

export default resetPassword;

const styles = StyleSheet.create({
  maincontainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background_cream,
  },
});
