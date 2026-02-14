// ✅ Step 1: Define Props type OUTSIDE
type NewGoalProps = {
  onAddGoal: (text: string) => void;
};

import { StyleSheet, TextInput, View, Button } from "react-native";
import React, { useState } from "react";
import { Theme } from "@/theme";

// ✅ Step 2: Define component with props
const NewGoal: React.FC<NewGoalProps> = ({ onAddGoal }) => {
  const [newGoal, setNewGoal] = useState("");

  // ✅ Controlled input handler
  function handleGoalInput(text: string) {
    setNewGoal(text);
  }

  // ✅ Trigger parent callback
  function handleAddGoal() {
    if (newGoal.trim().length === 0) return;
    onAddGoal(newGoal);
    setNewGoal(""); // clear after adding
  }

  return (
    <View style={styles.NewgoalContainer}>
      <TextInput
        placeholder="enter your text here"
        placeholderTextColor={Theme.colors.text_earth}
        style={styles.textInput}
        onChangeText={handleGoalInput}
        value={newGoal} // ✅ Controlled input
      />
      <Button title="Add Goal" onPress={handleAddGoal} />
    </View>
  );
};
export default NewGoal;

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 2,
    width: "70%",
    borderColor: Theme.colors.background_sand,
    color: Theme.colors.text_charcoal,
    padding: 6,
    marginRight: 6,
  },
  NewgoalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
    alignItems: "center",
    paddingBottom: 2,
    paddingHorizontal: 4,
  },
});
