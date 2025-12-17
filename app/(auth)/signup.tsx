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
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { TokenStorage } from "@/utils/tokenStorage";
import { useAlert } from "@/contexts/AlertContext";
export default function SignUp() {
  const [name, setName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showAlert } = useAlert();

  const handleSignUp = async () => {
    // Validation
    if (!name || !userName || !email || !password) {
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

    setIsLoading(true);

    try {
      console.log("Sending signup request...");

      const userData = {
        name: name.trim(),
        username: userName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        mobileNumber: mobileNumber.trim() || "",
      };

      console.log("User data:", userData);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok && data.success) {
        TokenStorage.setToken(data.data.token);
        console.log("✅ Registration successful! Token stored.");

        showAlert({
          title: "Success",
          message: "Account created successfully!",
          type: "success",
          onConfirm: () => {
            router.replace("/(auth)/login");
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
          "Cannot connect to server. Please check:\n\n1. Your backend is running\n2. IP address is correct\n3. No firewall blocking",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView enableOnAndroid={true} extraScrollHeight={40}>
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
                placeholderTextColor={Theme.colors.text_Secondary}
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
                placeholderTextColor={Theme.colors.text_Secondary}
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
                placeholderTextColor={Theme.colors.text_Secondary}
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
                placeholderTextColor={Theme.colors.text_Secondary}
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
                  color={Theme.colors.text_Secondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mobile Number Input */}
          <View style={styles.TextInputContainer}>
            <Text style={styles.InputContainerText}>
              Mobile Number (Optional)
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="phone-portrait-outline"
                size={20}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.TextInput}
                placeholder="Enter Your Mobile Number"
                keyboardType="phone-pad"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                placeholderTextColor={Theme.colors.text_Secondary}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
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
    backgroundColor: Theme.colors.background_deep,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background_deep,
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
    backgroundColor: Theme.colors.gold,
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
    color: Theme.colors.background_alien,
  },
  TextInput: {
    flex: 1,
    height: 50,
    color: Theme.colors.text_primary,
    fontSize: 16,
  },
  TextInputContainer: {
    width: "90%",
    marginBottom: 15,
  },
  inputContainer: {
    backgroundColor: Theme.colors.background_alien,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.text_Secondary + "30",
  },
  inputIcon: {
    marginRight: 10,
    color: Theme.colors.text_Secondary,
  },
  InputContainerText: {
    paddingBottom: 8,
    color: Theme.colors.text_Secondary,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 5,
  },
  signUpContainer: {
    marginBottom: 30,
    flexDirection: "row",
  },
  createAccountText: {
    color: Theme.colors.gold,
    fontWeight: "500",
    marginLeft: 5,
  },
  signUpContainerText: {
    color: Theme.colors.text_Secondary,
  },
  eyeIcon: {
    padding: 8,
  },
});
