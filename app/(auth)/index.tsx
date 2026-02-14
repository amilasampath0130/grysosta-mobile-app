import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import React, { useEffect, useRef } from "react";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "../../theme";
import { Images } from "../../assets/images/images";

const { width, height } = Dimensions.get("window");

const Welcome = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  const handleSignIn = () => {
    router.push("/(auth)/login");
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.headerText}>GRYSOSTA</Text>
          <Text style={styles.headerSubtitle}>
            Where every tap builds your legacy.
          </Text>
        </Animated.View>

        {/* Logo - Clean and Professional */}
        <Animated.View
          style={[
            styles.imageMainContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Image
            source={Images.signuplogo}//please change this to the correct logo image
            style={styles.image}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Financial-focused Text Content */}
        <Animated.View
          style={[
            styles.bodyTextContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.bodyText1}>Secure Your Future</Text>
          <Text style={styles.bodyText2}>
            Build, manage, Win, and grow your wealth with confidence
          </Text>
        </Animated.View>

        {/* Enhanced Buttons */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSignIn}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>SIGN IN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleSignUp}
            activeOpacity={0.9}
          >
            <Text style={styles.secondaryButtonText}>CREATE ACCOUNT</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background_cream,
  },
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background_cream,
    paddingHorizontal: width * 0.08,
    paddingVertical: height * 0.03,
  },
  textContainer: {
    alignItems: "center",
    marginTop: height * 0.04,
    marginBottom: height * 0.02,
  },
  headerText: {
    fontFamily: Theme.fonts.bold,
    fontSize: width * 0.11,
    color: Theme.colors.text_charcoal,
    letterSpacing: 0.5,
    marginBottom: 5,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontFamily: Theme.fonts.medium,
    fontSize: width * 0.045,
    color: Theme.colors.text_brown_gray,
    letterSpacing: 1,
  },
  imageMainContainer: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: height * 0.02,
  },
  image: {
    width: width * 0.4,
    height: width * 0.4,
  },
  bodyTextContainer: {
    flex: 1.5,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: height * 0.03,
  },
  bodyText1: {
    color: Theme.colors.text_charcoal,
    fontFamily: Theme.fonts.bold,
    fontSize: width * 0.065,
    marginBottom: 12,
    textAlign: "center",
    lineHeight: 32,
  },
  bodyText2: {
    color: Theme.colors.text_brown_gray,
    fontFamily: Theme.fonts.medium,
    fontSize: width * 0.038,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 25,
    paddingHorizontal: width * 0.05,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
    gap: 16,
    marginBottom: height * 0.02,
  },
  button: {
    height: height * 0.075,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  primaryButton: {
    backgroundColor: Theme.colors.accent_terracotta,
    borderColor: Theme.colors.accent_terracotta,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderColor: Theme.colors.accent_terracotta,
  },
  primaryButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: width * 0.048,
    color: Theme.colors.background_cream,
    letterSpacing: 1,
    fontWeight: "bold",
  },
  secondaryButtonText: {
    fontFamily: Theme.fonts.bold,
    fontSize: width * 0.042,
    color: Theme.colors.accent_terracotta,
    letterSpacing: 0.5,
    fontWeight: "bold",
  },
});
