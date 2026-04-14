import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Theme } from "@/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { useAlert } from "@/contexts/AlertContext";
import { apiService } from "@/services/api";
import { router } from "expo-router";

type ResetStep = "request" | "verify" | "reset";

interface ApiMessageResponse {
  success: boolean;
  message: string;
  msLeft?: number;
  data?: {
    resetSessionToken?: string;
  };
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
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

const getErrorStatus = (error: unknown) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number"
  ) {
    return (error as { status: number }).status;
  }
  return undefined;
};

const ResetPassword = () => {
  const { showAlert } = useAlert();
  const [step, setStep] = useState<ResetStep>("request");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetSessionToken, setResetSessionToken] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownMs, setCooldownMs] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (cooldownMs > 0) {
      timer = setInterval(
        () => setCooldownMs((ms) => Math.max(0, ms - 1000)),
        1000,
      );
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [cooldownMs]);

  const normalizedEmail = email.trim().toLowerCase();

  const validateRequestStep = () => {
    if (!normalizedEmail) {
      showAlert({
        title: "Missing Information",
        message: "Please enter your registered email.",
        type: "warning",
      });
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      showAlert({
        title: "Invalid Email",
        message: "Please enter a valid email address.",
        type: "warning",
      });
      return false;
    }

    return true;
  };

  const requestResetCode = async () => {
    if (!validateRequestStep()) return;

    setIsLoading(true);
    try {
      const response = await apiService.post<ApiMessageResponse>(
        "/auth/request-password-reset",
        {
          email: normalizedEmail,
        },
      );

      if (response.success) {
        setStep("verify");
        showAlert({
          title: "Code Sent",
          message: "We sent a reset code to your registered email.",
          type: "success",
        });
      }
    } catch (error) {
      const message = getErrorMessage(error);
      const status = getErrorStatus(error);

      if (status === 429) {
        const match = message.match(/(\d+)/);
        if (match) {
          const maybeSeconds = Number(match[1]);
          if (Number.isFinite(maybeSeconds) && maybeSeconds > 0) {
            setCooldownMs(maybeSeconds > 1000 ? maybeSeconds : maybeSeconds * 1000);
          }
        }
      }

      showAlert({
        title: "Unable to Send Code",
        message,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!otp.trim() || otp.trim().length < 4) {
      showAlert({
        title: "Invalid Code",
        message: "Please enter the reset code from your email.",
        type: "warning",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.post<ApiMessageResponse>(
        "/auth/verify-password-reset-code",
        {
          email: normalizedEmail,
          otp: otp.trim(),
        },
      );

      if (response.success) {
        const tokenFromResponse = response.data?.resetSessionToken;
        if (!tokenFromResponse) {
          showAlert({
            title: "Verification Failed",
            message: "Unable to create reset session. Please request a new code.",
            type: "error",
          });
          return;
        }

        setResetSessionToken(tokenFromResponse);
        setStep("reset");
        showAlert({
          title: "Code Verified",
          message: "Now enter your new password.",
          type: "success",
        });
      }
    } catch (error) {
      showAlert({
        title: "Verification Failed",
        message: getErrorMessage(error),
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitNewPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showAlert({
        title: "Missing Password",
        message: "Please enter and confirm your new password.",
        type: "warning",
      });
      return;
    }

    if (newPassword.length < 6) {
      showAlert({
        title: "Weak Password",
        message: "New password must be at least 6 characters.",
        type: "warning",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert({
        title: "Password Mismatch",
        message: "New password and confirm password must match.",
        type: "warning",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.post<ApiMessageResponse>(
        "/auth/reset-password",
        {
          resetSessionToken,
          newPassword,
        },
      );

      if (response.success) {
        showAlert({
          title: "Password Updated",
          message: "Your password has been reset successfully. Please login.",
          type: "success",
          onConfirm: () => router.replace("/(auth)/login"),
        });
      }
    } catch (error) {
      showAlert({
        title: "Reset Failed",
        message: getErrorMessage(error),
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderRequestStep = () => (
    <>
      <Text style={styles.subtitle}>
        Enter your registered email to receive a password reset code.
      </Text>

      <View style={styles.inputWrap}>
        <Ionicons name="mail-open-outline" size={20} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Registered email"
          placeholderTextColor={Theme.colors.text_earth}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={requestResetCode}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={Theme.colors.background_cream} />
        ) : (
          <Text style={styles.buttonText}>Send Reset Code</Text>
        )}
      </TouchableOpacity>
    </>
  );

  const renderVerifyStep = () => (
    <>
      <Text style={styles.subtitle}>
        Enter the reset code sent to {normalizedEmail || "your email"}.
      </Text>

      <View style={styles.inputWrap}>
        <Ionicons name="key-outline" size={20} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="6-digit code"
          placeholderTextColor={Theme.colors.text_earth}
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          editable={!isLoading}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={verifyCode}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={Theme.colors.background_cream} />
        ) : (
          <Text style={styles.buttonText}>Verify Code</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={requestResetCode}
        disabled={isLoading || cooldownMs > 0}
      >
        <Text style={styles.linkText}>
          {cooldownMs > 0
            ? `Resend code in ${Math.ceil(cooldownMs / 1000)}s`
            : "Resend code"}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderResetStep = () => (
    <>
      <Text style={styles.subtitle}>Set your new password and confirm it.</Text>

      <View style={styles.inputWrap}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="New password"
          placeholderTextColor={Theme.colors.text_earth}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showNewPassword}
          autoCapitalize="none"
          editable={!isLoading}
        />
        <TouchableOpacity
          onPress={() => setShowNewPassword((prev) => !prev)}
          disabled={isLoading}
        >
          <Ionicons
            name={showNewPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={Theme.colors.text_brown_gray}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.inputWrap}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm new password"
          placeholderTextColor={Theme.colors.text_earth}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          autoCapitalize="none"
          editable={!isLoading}
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword((prev) => !prev)}
          disabled={isLoading}
        >
          <Ionicons
            name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={Theme.colors.text_brown_gray}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={submitNewPassword}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={Theme.colors.background_cream} />
        ) : (
          <Text style={styles.buttonText}>Update Password</Text>
        )}
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        extraScrollHeight={40}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.maincontainer}>
          <Text style={styles.title}>Reset Password</Text>
          {step === "request" && renderRequestStep()}
          {step === "verify" && renderVerifyStep()}
          {step === "reset" && renderResetStep()}

          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.linkText}>Back to login</Text>
          </TouchableOpacity>
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
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Theme.colors.text_charcoal,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.text_brown_gray,
    textAlign: "center",
    marginBottom: 6,
    width: "90%",
  },
  inputWrap: {
    width: "90%",
    height: 50,
    borderRadius: 12,
    backgroundColor: Theme.colors.background_beige,
    borderWidth: 1,
    borderColor: Theme.colors.background_sand,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  inputIcon: {
    marginRight: 10,
    color: Theme.colors.text_brown_gray,
  },
  input: {
    flex: 1,
    color: Theme.colors.text_charcoal,
  },
  button: {
    width: "90%",
    height: 50,
    backgroundColor: Theme.colors.accent_terracotta,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Theme.colors.background_cream,
    fontWeight: "700",
    fontSize: 16,
  },
  linkText: {
    color: Theme.colors.accent_terracotta,
    fontSize: 14,
    marginTop: 8,
  },
});
