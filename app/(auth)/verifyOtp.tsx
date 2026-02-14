import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useLocalSearchParams, router } from "expo-router";
import { Theme } from "@/theme";
import { useAlert } from "@/contexts/AlertContext";
import { TokenStorage } from "@/utils/tokenStorage";

const VerifyOtp = () => {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { showAlert } = useAlert();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldownMs, setCooldownMs] = useState(0);

  const displayEmail = useMemo(() => (email ? String(email) : ""), [email]);

  useEffect(() => {
    let t: ReturnType<typeof setInterval> | undefined;
    if (cooldownMs > 0) {
      t = setInterval(
        () => setCooldownMs((ms) => Math.max(0, ms - 1000)),
        1000,
      );
    }
    return () => {
      if (t) clearInterval(t);
    };
  }, [cooldownMs]);

  const handleVerify = async () => {
    if (!displayEmail) {
      showAlert({
        title: "Missing Email",
        message: "Email is required",
        type: "warning",
      });
      return;
    }
    if (!otp || otp.trim().length < 4) {
      showAlert({
        title: "Invalid Code",
        message: "Enter the 6-digit code",
        type: "warning",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: displayEmail, otp: otp.trim() }),
        },
      );

      const data = await response.json();
      if (response.ok && data.success) {
        TokenStorage.setToken(data.data.token);
        showAlert({
          title: "Verified!",
          message: "Your account is now active.",
          type: "success",
          onConfirm: () => router.replace("/(tabs)/home"),
        });
      } else {
        showAlert({
          title: "Verification Failed",
          message: data.message || "Invalid or expired code",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      showAlert({
        title: "Network Error",
        message:
          "Cannot reach server. Please confirm backend is running and EXPO_PUBLIC_API_URL is set.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldownMs > 0 || !displayEmail) return;
    setIsResending(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/resend-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: displayEmail }),
        },
      );
      const data = await response.json();
      if (response.ok && data.success) {
        showAlert({
          title: "Code Sent",
          message: "Check your email for a new code.",
          type: "success",
        });
        // If server provided msLeft for cooldown, use it; fallback to 60s
        setCooldownMs(Number(data.msLeft ?? 60_000));
      } else if (response.status === 429) {
        setCooldownMs(Number(data.msLeft ?? 60_000));
        showAlert({
          title: "Please Wait",
          message: "OTP already sent. Try again later.",
          type: "warning",
        });
      } else {
        showAlert({
          title: "Resend Failed",
          message: data.message || "Unable to resend code",
          type: "error",
        });
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      showAlert({
        title: "Network Error",
        message: "Unable to resend code.",
        type: "error",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView enableOnAndroid={true} extraScrollHeight={40}>
        <View style={styles.container}>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{" "}
            <Text style={styles.email}>{displayEmail || "your email"}</Text>
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter verification code"
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
            onPress={handleVerify}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Theme.colors.background_cream} />
            ) : (
              <Text style={styles.buttonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.link}
            onPress={handleResend}
            disabled={isResending || cooldownMs > 0}
          >
            <Text style={styles.linkText}>
              {cooldownMs > 0
                ? `Resend code in ${Math.ceil(cooldownMs / 1000)}s`
                : isResending
                  ? "Sending..."
                  : "Resend Code"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default VerifyOtp;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.background_cream },
  container: {
    flex: 1,
    paddingVertical: 24,
    alignItems: "center",
    backgroundColor: Theme.colors.background_cream,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Theme.colors.text_charcoal,
    marginTop: 24,
  },
  subtitle: {
    fontSize: 14,
    color: Theme.colors.text_brown_gray,
    marginTop: 8,
    paddingHorizontal: 24,
    textAlign: "center",
  },
  email: { color: Theme.colors.accent_terracotta },
  inputContainer: {
    width: "90%",
    marginTop: 24,
    backgroundColor: Theme.colors.background_beige,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Theme.colors.background_sand,
  },
  input: {
    height: 50,
    paddingHorizontal: 12,
    color: Theme.colors.text_charcoal,
    fontSize: 18,
    letterSpacing: 2,
    textAlign: "center",
  },
  button: {
    width: "90%",
    height: 50,
    backgroundColor: Theme.colors.accent_terracotta,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    marginTop: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: Theme.colors.background_cream,
    fontSize: 18,
    fontWeight: "bold",
  },
  link: { marginTop: 16 },
  linkText: { color: Theme.colors.accent_terracotta },
});
