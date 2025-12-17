import { StyleSheet, Text, View, Pressable } from "react-native";
import React from "react";
import { FontAwesome } from "@expo/vector-icons";

type Props = {
  label: String;
  theme?: "primary"
};
export default function Button({label,theme}: Props) {
  if (theme === "primary") {
    return (
      <View style={[styles.buttonContainer,{borderColor:"#ffd33d",borderWidth:4}]}>
        <Pressable
          style={styles.button}
          onPress={() => alert("You pressed a button")}
        >
          <FontAwesome name="picture-o" size={18} color={"#25292e"} style={styles.buttonIcon}/>
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
        <FontAwesome name="picture-o" size={18} color={"#25292e"} style={styles.buttonIcon}/>
        <Text style={styles.buttonLable}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonLable: {
    color:"#101923",
    fontSize:20,
    fontWeight:"bold",

  },
  button: {
    borderRadius:10,
    width:"100%",
    height: "100%",
    alignItems:"center",
    justifyContent:"center",
    flexDirection:"row",
    backgroundColor:"#fff",


  },
  buttonContainer:{
    width:320,
    height:68,
    marginHorizontal:20,
    alignItems:"center",
    justifyContent:"center",
    padding:3,
    marginBottom:10,
  },
  buttonIcon:{
    paddingRight:8,
  }
});
