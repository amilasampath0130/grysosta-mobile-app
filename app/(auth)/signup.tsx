import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import { Theme } from "@/theme";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { TokenStorage } from "@/utils/tokenStorage";
import { useAlert } from "@/contexts/AlertContext";
import PhoneInputWithCountry from "@/components/PhoneInputWithCountry";
import { Country, CountryCode } from "react-native-country-picker-modal";
export default function SignUp() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode>("US");
  const [callingCode, setCallingCode] = useState("1");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showAlert } = useAlert();

  const handleSignUp = async () => {
    // Validation
    if (!name || !userName || !email || !password || !confirmPassword) {
      showAlert({
        title: "Missing Information",
        message: "Please fill in all required fields",
        type: "warning",
      });
      return;
    }

    if (password.length < 6) {
      showAlert({
        title: "Invalid Password",
        message: "Password must be at least 6 characters",
        type: "warning",
      });
      return;
    }

    if (password !== confirmPassword) {
      showAlert({
        title: "Password Mismatch",
        message: "Passwords do not match. Please try again.",
        type: "warning",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("Sending signup request...");

      const trimmedMobile = mobileNumber.replace(/\s+/g, "").trim();
      const fullMobileNumber = trimmedMobile
        ? `+${callingCode}${trimmedMobile}`
        : "";

      const userData = {
        name: name.trim(),
        username: userName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        mobileNumber: fullMobileNumber,
      };

      console.log("User data:", userData);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        },
      );

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok && data.success) {
        console.log("✅ Registration successful! OTP sent to email.");

        showAlert({
          title: "Verify Your Email",
          message:
            "We sent a 6-digit code to your email. Enter it to activate your account.",
          type: "success",
          onConfirm: () => {
            router.replace(
              `/(auth)/verifyOtp?email=${encodeURIComponent(userData.email)}`,
            );
          },
        });
      } else {
        const errorMessage =
          data.message || `Registration failed (Status: ${response.status})`;
        showAlert({
          title: "Registration Failed",
          message: errorMessage,
          type: "error",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      showAlert({
        title: "Network Error",
        message:
          "Cannot connect to server. Please check:\n\n1. Your backend is running\n2. API URL is correct (EXPO_PUBLIC_API_URL)\n3. No firewall blocking",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        extraScrollHeight={40}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top },
        ]}
      >
        <View style={styles.container}>
          {/* Name Input */}
          <View style={styles.TextInputContainer}>
            <Text style={styles.InputContainerText}>Name *</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.TextInput}
                placeholder="Enter Your Name"
                value={name}
                onChangeText={setName}
                placeholderTextColor={Theme.colors.text_earth}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Username Input */}
          <View style={styles.TextInputContainer}>
            <Text style={styles.InputContainerText}>Username *</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-circle-outline"
                size={20}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.TextInput}
                placeholder="Enter Your Username"
                value={userName}
                onChangeText={setUserName}
                placeholderTextColor={Theme.colors.text_earth}
                editable={!isLoading}
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.TextInputContainer}>
            <Text style={styles.InputContainerText}>Email *</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-open-outline"
                size={20}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.TextInput}
                keyboardType="email-address"
                placeholder="Enter Your Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                placeholderTextColor={Theme.colors.text_earth}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.TextInputContainer}>
            <Text style={styles.InputContainerText}>
              Password * (min 6 characters)
            </Text>
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
                placeholder="Enter Your Password"
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

          {/* Confirm Password Input */}
          <View style={styles.TextInputContainer}>
            <Text style={styles.InputContainerText}>Confirm Password *</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.TextInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter Your Password"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor={Theme.colors.text_earth}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={Theme.colors.text_brown_gray}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mobile Number Input */}
          <View style={[styles.TextInputContainer, styles.mobileInputSpacing]}>
            <Text style={styles.InputContainerText}>
              Mobile Number (Optional)
            </Text>
            <PhoneInputWithCountry
              value={mobileNumber}
              onChangeText={setMobileNumber}
              countryCode={countryCode}
              callingCode={callingCode}
              onSelectCountry={(country: Country) => {
                setCountryCode(country.cca2);
                setCallingCode(country.callingCode[0] || "1");
              }}
              placeholder="Enter your mobile number"
              disabled={isLoading}
            />
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Theme.colors.background_cream} />
              ) : (
                <Text style={styles.ButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpContainerText}>
              Already have an Account?
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/login")}
              disabled={isLoading}
            >
              <Text style={styles.createAccountText}> Log In!</Text>
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
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background_cream,
    paddingVertical: 20,
  },
  buttonContainer: {
    width: "80%",
    padding: 5,
    marginVertical: 20,
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: Theme.colors.accent_terracotta,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  ButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Theme.colors.background_cream,
  },
  TextInput: {
    flex: 1,
    height: 50,
    color: Theme.colors.text_charcoal,
    fontSize: 16,
  },
  TextInputContainer: {
    width: "90%",
    marginBottom: 15,
  },
  mobileInputSpacing: {
    marginTop: 16,
  },
  inputContainer: {
    backgroundColor: Theme.colors.background_beige,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.background_sand,
  },
  inputIcon: {
    marginRight: 10,
    color: Theme.colors.text_brown_gray,
  },
  InputContainerText: {
    paddingBottom: 8,
    color: Theme.colors.text_brown_gray,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5,
  },
  signUpContainer: {
    marginBottom: 30,
    flexDirection: "row",
  },
  createAccountText: {
    color: Theme.colors.accent_terracotta,
    fontWeight: "500",
    marginLeft: 5,
  },
  signUpContainerText: {
    color: Theme.colors.text_brown_gray,
  },
  eyeIcon: {
    padding: 8,
  },
});
