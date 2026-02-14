import {
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Platform,
} from "react-native";
import React from "react";
import { Theme } from "@/theme";
import { Images } from "@/assets/images/images";

const { width, height } = Dimensions.get("window");

const ImageGallery = () => {
  const handleCollectionPress = () => {
    // Navigate to collections screen
    console.log("Open collections");
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleCollectionPress}
      activeOpacity={0.9}
    >
      <Text style={styles.title}>Collections</Text>
      <View style={styles.imageContainer}>
        <Image
          source={Images.collection}
          style={styles.image}
          resizeMode="cover"
        />
      </View>
    </TouchableOpacity>
  );
};

export default ImageGallery;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.background_beige,
    padding: 16,
    width: "100%",
    height: height * 0.3,
    borderRadius: 15,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  title: {
    color: Theme.colors.text_primary,
    fontFamily: Theme.fonts.medium,
    fontSize: 20,
    marginBottom: 12,
  },
  imageContainer: {
    backgroundColor: Theme.colors.background_cream,
    height: "80%", // Better proportional height
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});
