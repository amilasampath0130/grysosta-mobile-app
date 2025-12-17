import {
  Button,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useState } from "react";
import { hide } from "expo-router/build/utils/splash";
import AddGoal from "@/components/AddGoal";
import NewGoal from "@/components/ui/NewGoal";


const testing = () => {

  type Goal = {
  text: string;
  key: string;
};
  const [enteredGoalText, setEnteredGoalText] = useState("");
  const [courseGoals, setCourseGoals] = useState<Goal[]>([]);

  function goalInputHandler(enteredText: string) {
    setEnteredGoalText(enteredText);
  }

  function addGoalHandler(enteredGoalText:string) {
    setCourseGoals((currentCourseGoals) => [
      ...currentCourseGoals,
      {text: enteredGoalText, key:Math.random().toString()},
    ]);
  }

  return (
    <View style={styles.container}>
      {/* goal input section */}
      <View style={styles.inputContainer}>

        <TextInput
          style={styles.Textinput}
          placeholder="Enter your goal"
          onChangeText={goalInputHandler}
        />
        <Button title="press me"  />
      </View>

      {/* goal display  */}
      <View style={styles.goalContainer}>
        <Text>Adding your goals below when you cick the button</Text>
        <FlatList
          data={courseGoals}
          renderItem={(itemData) => {
            return <AddGoal text={itemData.item.text} />
      
          }}
        ></FlatList>
      </View>
      <View style={styles.newgoalcontainer}>
         {/* ADD ANOTHER NEW GOAL  */}
        <NewGoal onAddGoal={addGoalHandler} />
      </View>
    </View>
  );
};

export default testing;

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingHorizontal: 16,
    flex: 1,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
  },
  Textinput: {
    borderWidth: 2,
    borderColor: "#ccc",
    width: "70%",
    marginRight: 8,
    padding: 8,
    backgroundColor: "black",
  },
  goalContainer: {
    flex: 5,
  },
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
  newgoalcontainer:{
    flex:5
  }
});
