import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Theme } from "@/theme";
import { apiService } from "@/services/api";
import { useAlert } from "@/contexts/AlertContext";

type ResetStep = "request" | "verify" | "reset";

interface BasicApiResponse {
  success: boolean;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!]).{8,}$/;
const STRONG_PASSWORD_HINT =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and one special character (@#$%^&*!).";

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return "Something went wrong. Please try again.";
};

const ResetPassword = () => {
  const params = useLocalSearchParams<{ email?: string }>();
  const initialEmail = useMemo(
    () =>
      typeof params.email === "string" ? params.email.trim().toLowerCase() : "",
    [params.email],
  );

  const { showAlert } = useAlert();
  const [step, setStep] = useState<ResetStep>("request");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();

  const handleRequestCode = async () => {
    if (!normalizedEmail) {
      showAlert({
        title: "Missing Email",
        message: "Please enter your email address.",
        type: "warning",
      });
      return;
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      showAlert({
        title: "Invalid Email",
        message: "Please enter a valid email address.",
        type: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiService.post<BasicApiResponse>(
        "/auth/request-password-reset",
        { email: normalizedEmail },
      );

      setStep("verify");
      showAlert({
        title: "Check Your Email",
        message:
          response.message ||
          "If the account exists, a reset code has been sent to your email.",
        type: "success",
      });
    } catch (error) {
      showAlert({
        title: "Request Failed",
        message: getErrorMessage(error),
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!otp.trim()) {
      showAlert({
        title: "Missing Code",
        message: "Enter the code sent to your email.",
        type: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiService.post<BasicApiResponse>(
        "/auth/verify-password-reset-otp",
        {
          email: normalizedEmail,
          otp: otp.trim(),
        },
      );

      setStep("reset");
      showAlert({
        title: "Code Verified",
        message: response.message || "You can now set a new password.",
        type: "success",
      });
    } catch (error) {
      showAlert({
        title: "Verification Failed",
        message: getErrorMessage(error),
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showAlert({
        title: "Missing Password",
        message: "Enter your new password and confirm it.",
        type: "warning",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert({
        title: "Passwords Do Not Match",
        message: "New password and confirm password must match.",
        type: "warning",
      });
      return;
    }

    if (!STRONG_PASSWORD_REGEX.test(newPassword)) {
      showAlert({
        title: "Weak Password",
        message: STRONG_PASSWORD_HINT,
        type: "warning",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiService.post<BasicApiResponse>(
        "/auth/reset-password",
        {
          email: normalizedEmail,
          otp: otp.trim(),
          newPassword,
          confirmPassword,
        },
      );

      showAlert({
        title: "Password Updated",
        message:
          response.message ||
          "Password reset successful. Please login with your email and new password.",
        type: "success",
        onConfirm: () =>
          router.replace({
            pathname: "/(auth)/login",
            params: { email: normalizedEmail },
          }),
      });
    } catch (error) {
      showAlert({
        title: "Reset Failed",
        message: getErrorMessage(error),
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitle =
    step === "request"
      ? "Find Your Account"
      : step === "verify"
        ? "Verify Reset Code"
        : "Create New Password";

  const stepDescription =
    step === "request"
      ? "Enter the email you use to sign in. If the account exists, we will email you a reset code."
      : step === "verify"
        ? "Enter the code from your email before choosing a new password."
        : "Use a strong password you have not used before.";

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        extraScrollHeight={50}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.maincontainer}>
          <View style={styles.card}>
            <Text style={styles.stepIndicator}>
              {step === "request"
                ? "Step 1 of 3"
                : step === "verify"
                  ? "Step 2 of 3"
                  : "Step 3 of 3"}
            </Text>
            <Text style={styles.title}>{stepTitle}</Text>
            <Text style={styles.description}>{stepDescription}</Text>

            <View style={styles.fieldBlock}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-open-outline"
                  size={20}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isSubmitting && step === "request"}
                  placeholderTextColor={Theme.colors.text_earth}
                />
              </View>
            </View>

            {step !== "request" ? (
              <View style={styles.fieldBlock}>
                <Text style={styles.label}>Reset Code</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={otp}
                    onChangeText={setOtp}
                    placeholder="Enter the code from your email"
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    editable={!isSubmitting && step !== "reset"}
                    placeholderTextColor={Theme.colors.text_earth}
                    maxLength={6}
                  />
                </View>
              </View>
            ) : null}

            {step === "reset" ? (
              <>
                <View style={styles.fieldBlock}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="Enter your new password"
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isSubmitting}
                      placeholderTextColor={Theme.colors.text_earth}
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword((value) => !value)}
                      disabled={isSubmitting}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={
                          showNewPassword ? "eye-off-outline" : "eye-outline"
                        }
                        size={20}
                        color={Theme.colors.text_brown_gray}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.fieldBlock}>
                  <Text style={styles.label}>Confirm Password</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Confirm your new password"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isSubmitting}
                      placeholderTextColor={Theme.colors.text_earth}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword((value) => !value)}
                      disabled={isSubmitting}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={20}
                        color={Theme.colors.text_brown_gray}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.passwordHint}>{STRONG_PASSWORD_HINT}</Text>
              </>
            ) : null}

            <TouchableOpacity
              style={[styles.button, isSubmitting && styles.buttonDisabled]}
              onPress={
                step === "request"
                  ? handleRequestCode
                  : step === "verify"
                    ? handleVerifyCode
                    : handleResetPassword
              }
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={Theme.colors.background_cream} />
              ) : (
                <Text style={styles.buttonText}>
                  {step === "request"
                    ? "Send Reset Code"
                    : step === "verify"
                      ? "Verify Code"
                      : "Reset Password"}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.actionsRow}>
              {step === "verify" ? (
                <TouchableOpacity
                  onPress={handleRequestCode}
                  disabled={isSubmitting}
                >
                  <Text style={styles.linkText}>Resend code</Text>
                </TouchableOpacity>
              ) : null}

              {step !== "request" ? (
                <TouchableOpacity
                  onPress={() =>
                    setStep(step === "reset" ? "verify" : "request")
                  }
                  disabled={isSubmitting}
                >
                  <Text style={styles.linkText}>
                    {step === "reset" ? "Edit code" : "Use another email"}
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                onPress={() =>
                  router.replace({
                    pathname: "/(auth)/login",
                    params: normalizedEmail
                      ? { email: normalizedEmail }
                      : undefined,
                  })
                }
                disabled={isSubmitting}
              >
                <Text style={styles.linkText}>Back to login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background_cream,
  },
  scrollContent: {
    flexGrow: 1,
  },
  maincontainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background_cream,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  card: {
    width: "100%",
    backgroundColor: Theme.colors.background_beige,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.colors.background_sand,
  },
  stepIndicator: {
    color: Theme.colors.accent_terracotta,
    fontSize: 13,
    marginBottom: 8,
    fontFamily: Theme.fonts.medium,
  },
  title: {
    fontSize: 24,
    color: Theme.colors.text_charcoal,
    fontFamily: Theme.fonts.bold,
  },
  description: {
    marginTop: 8,
    color: Theme.colors.text_brown_gray,
    lineHeight: 20,
    fontFamily: Theme.fonts.regular,
  },
  fieldBlock: {
    marginTop: 18,
  },
  label: {
    color: Theme.colors.text_brown_gray,
    marginBottom: 6,
    marginLeft: 4,
    fontFamily: Theme.fonts.medium,
  },
  inputContainer: {
    backgroundColor: Theme.colors.background_cream,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Theme.colors.background_sand,
  },
  inputIcon: {
    color: Theme.colors.text_brown_gray,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: Theme.colors.text_charcoal,
    fontFamily: Theme.fonts.regular,
  },
  eyeIcon: {
    padding: 8,
  },
  passwordHint: {
    marginTop: 12,
    color: Theme.colors.text_brown_gray,
    lineHeight: 18,
    fontSize: 12,
    fontFamily: Theme.fonts.regular,
  },
  button: {
    marginTop: 24,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.accent_terracotta,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Theme.colors.background_cream,
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
  },
  actionsRow: {
    marginTop: 18,
    gap: 14,
    alignItems: "center",
  },
  linkText: {
    color: Theme.colors.accent_terracotta,
    fontFamily: Theme.fonts.medium,
  },
});
