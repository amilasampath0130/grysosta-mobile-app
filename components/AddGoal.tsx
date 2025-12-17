import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { Float } from "react-native/Libraries/Types/CodegenTypesNamespace";

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
    backgroundColor: "#6daaffff",
    borderRadius: 5,
  },
  goalListText: {
    color: "white",
    fontWeight: "bold",
  },
});
