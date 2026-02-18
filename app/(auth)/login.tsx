import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import { Theme } from "@/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { useAlert } from "@/contexts/AlertContext";
import { Images } from "@/assets/images/images";
import { useAuth } from "@/hooks/useAuth";

const { width, height } = Dimensions.get("window");

// ✅ ADD DEFAULT EXPORT
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { showAlert } = useAlert();
  const { login, isLoading } = useAuth();
  const handleLogin = async () => {
    if (!email || !password) {
      showAlert({
        title: "Missing Information",
        message: "Please fill in all fields",
        type: "warning",
      });
      // Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      await login(email.trim(), password);
      showAlert({
        title: "Success",
        message: "Login successful!",
        type: "success",
        onConfirm: () => {
          router.replace("/(tabs)/home");
        },
      });
    } catch (error) {
      showAlert({
        title: "Login Failed",
        message:
          error instanceof Error
            ? error.message
            : "Unable to login right now. Please try again.",
        type: "error",
      });
      console.error("Login error:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        extraScrollHeight={100}
        contentContainerStyle={{
          flexGrow: 1,
        }}
      >
        <View style={styles.container}>
          {/* Email Input */}
          <Image 
            source={Images.signuplogo}//please change this to the correct logo image
            style={styles.image}
            resizeMode="contain" 
          />
          <View style={styles.TextInputContainer}>
            <Text style={styles.InputContainerText}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-open-outline"
                size={20}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.TextInput}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter Your Email address"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={Theme.colors.text_earth}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.TextInputContainer}>
            <Text style={styles.InputContainerText}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.TextInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter Your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={Theme.colors.text_earth}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={Theme.colors.text_brown_gray}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <View style={styles.forgotPasswordContainer}>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/resetPassword")}
              disabled={isLoading}
            >
              <Text style={styles.ForgotpswdText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Theme.colors.background_cream} />
              ) : (
                <Text style={styles.ButtonText}>Login</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpContainerText}>New to Grysosta?</Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/signup")}
              disabled={isLoading}
            >
              <Text style={styles.createAccountText}> Create an account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background_cream,
  },
  image: {
    width: width * 0.4,
    height: width * 0.4,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background_cream,
  },
  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
    padding: 5,
    margin: 10,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: Theme.colors.accent_terracotta,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    margin: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  ButtonText: {
    fontSize: 18,
    color: Theme.colors.background_cream,
    fontWeight: "bold",
  },
  TextInput: {
    width: "100%",
    height: 50,
    color: Theme.colors.text_charcoal,
    flex: 1,
  },
  TextInputContainer: {
    width: "90%",
    margin: 20,
  },
  inputContainer: {
    backgroundColor: Theme.colors.background_beige,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  inputIcon: {
    marginRight: 10,
    color: Theme.colors.text_brown_gray,
  },
  InputContainerText: {
    paddingBottom: 5,
    color: Theme.colors.text_brown_gray,
    fontSize: 14,
    marginLeft: 5,
  },
  ForgotpswdText: {
    color: Theme.colors.accent_terracotta,
  },
  forgotPasswordContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    width: "85%",
    margin: 10,
  },
  signUpContainer: {
    marginBottom: 50,
    flexDirection: "row",
  },
  createAccountText: {
    color: Theme.colors.accent_terracotta,
  },
  signUpContainerText: {
    color: Theme.colors.text_brown_gray,
  },
  eyeIcon: {
    padding: 8,
  },
});
