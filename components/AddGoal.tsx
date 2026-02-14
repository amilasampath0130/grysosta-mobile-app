import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Theme } from "@/theme";

type AddGoalProps = {
  text: string;
};

const AddGoal = ({ text }: AddGoalProps) => {
  return (
    <View style={styles.goalList}>
      <Text style={styles.goalListText}>{text}</Text>
    </View>
  );
};

export default AddGoal;

const styles = StyleSheet.create({
  goalList: {
    margin: 8,
    padding: 8,
    backgroundColor: Theme.colors.background_sand,
    borderRadius: 5,
  },
  goalListText: {
    color: Theme.colors.text_charcoal,
    fontWeight: "bold",
  },
});
