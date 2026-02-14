import React, { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Theme } from "@/theme";
import { Images } from "@/assets/images/images";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { GAME_CONSTANTS, GAME_TEXTS } from "@/constants/game";
import { GameHomeState, Coin } from "@/types/game";
import { TokenStorage } from "@/utils/tokenStorage";
import { useAlert } from "@/contexts/AlertContext";

interface CoinTapResponse {
  success: boolean;
  points?: number;
  totalPoints?: number;
  message?: string;
  nextAvailableTime?: string;
  prizeEarned?: boolean;
  prizeName?: string;
}

interface UserProfile {
  fullName: string;
  email: string;
}

const GameHome: React.FC = () => {
  const { width } = useWindowDimensions();
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(true); // ✅ ADD LOADING STATE
  const [state, setState] = useState<
    GameHomeState & {
      userProfile: UserProfile | null;
      nextAvailableTime: string | null;
      countdown: string;
    }
  >({
    coins: Array.from({ length: GAME_CONSTANTS.NUM_COINS }, (_, index) => ({
      id: `coin-${index}`,
      index,
      isActive: true,
    })),
    selectedCoin: null,
    isLoading: false,
    userPoints: 0,
    lastTapTime: null,
    canTap: true,
    userProfile: null,
    nextAvailableTime: null,
    countdown: "",
  });

  // Calculate coin size dynamically
  const coinSize = Math.floor(
    (width -
      GAME_CONSTANTS.HORIZONTAL_PADDING -
      GAME_CONSTANTS.COIN_SPACING * (GAME_CONSTANTS.NUM_COINS - 1)) /
      GAME_CONSTANTS.NUM_COINS,
  );

  // Fetch user data on component mount
  useEffect(() => {
    initializeGameData();
  }, []);

  // ✅ ADD INITIALIZATION FUNCTION
  const initializeGameData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchUserData(), checkTapAvailability()]);
    } catch (error) {
      console.error("Error initializing game data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Countdown timer effect - FIXED TYPE
  useEffect(() => {
    let interval: number | null = null;

    if (!state.canTap && state.nextAvailableTime) {
      interval = setInterval(() => {
        updateCountdown();
      }, 1000) as unknown as number;

      // Initial update
      updateCountdown();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.canTap, state.nextAvailableTime]);

  const fetchUserData = async () => {
    try {
      const token = TokenStorage.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Fetch user points
      const pointsResponse = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/game/points`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (pointsResponse.ok) {
        const pointsData = await pointsResponse.json();
        if (pointsData.success) {
          setState((prev) => ({
            ...prev,
            userPoints: pointsData.totalPoints || 0,
          }));
        }
      }

      // Fetch user profile
      const profileResponse = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.success) {
          setState((prev) => ({
            ...prev,
            userProfile: {
              fullName:
                profileData.data?.user?.name ||
                profileData.user?.name ||
                "Player",
              email:
                profileData.data?.user?.email || profileData.user?.email || "",
            },
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const checkTapAvailability = async () => {
    try {
      const token = TokenStorage.getToken();
      if (!token) return;

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/game/can-tap`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        setState((prev) => ({
          ...prev,
          canTap: data.canTap,
          nextAvailableTime: data.nextAvailableTime || null,
        }));
      }
    } catch (error) {
      console.error("Error checking tap availability:", error);
    }
  };

  const updateCountdown = () => {
    if (!state.nextAvailableTime) return;

    const now = new Date().getTime();
    const nextTime = new Date(state.nextAvailableTime).getTime();
    const timeLeft = nextTime - now;

    if (timeLeft <= 0) {
      setState((prev) => ({
        ...prev,
        canTap: true,
        countdown: "",
        nextAvailableTime: null,
      }));
      return;
    }

    const hours = Math.floor(
      (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    const countdownString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    setState((prev) => ({ ...prev, countdown: countdownString }));
  };

  const formatNextAvailableTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCoinPress = async (index: number) => {
    // Check if user is logged in
    const token = TokenStorage.getToken();
    if (!token) {
      showAlert({
        title: "Login Required",
        message: "Please login to your Moonshoot account to play the game",
        type: "warning",
        onConfirm: () => {
          // Optional: Redirect to login
          // router.replace("/(auth)/login");
        },
      });
      return;
    }

    // Check if user can tap
    if (!state.canTap) {
      const message = state.nextAvailableTime
        ? `You can tap again on:\n${formatNextAvailableTime(state.nextAvailableTime)}\n\nTime remaining: ${state.countdown}`
        : "You can only tap one coin every 24 hours. Please come back tomorrow for another chance to earn points!";

      showAlert({
        title: "Cooldown Active",
        message: message,
        type: "info",
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      selectedCoin: index,
      isLoading: true,
    }));

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/game/tap-coin`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coinIndex: index,
          }),
        },
      );

      const data: CoinTapResponse = await response.json();

      if (data.success) {
        // Show points earned
        let alertMessage = `🎉 Congratulations! You earned ${data.points} points!`;

        if (data.totalPoints !== undefined) {
          alertMessage += `\n\nTotal Points: ${data.totalPoints}`;
          setState((prev) => ({ ...prev, userPoints: data.totalPoints! }));
        }

        // Check if prize earned
        if (data.prizeEarned && data.prizeName) {
          alertMessage += `\n\n🎁 You've earned a prize: ${data.prizeName}!`;
        }

        // Calculate next available time (24 hours from now)
        const nextAvailable = new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        ).toISOString();

        // Update tap availability
        setState((prev) => ({
          ...prev,
          canTap: false,
          nextAvailableTime: data.nextAvailableTime || nextAvailable,
        }));

        showAlert({
          title: "Points Earned!",
          message: alertMessage,
          type: "success",
          onConfirm: () => {
            setState((prev) => ({
              ...prev,
              selectedCoin: null,
              isLoading: false,
            }));
          },
        });
      } else {
        showAlert({
          title: "Oops!",
          message: data.message || "Something went wrong. Please try again.",
          type: "error",
          onConfirm: () => {
            setState((prev) => ({
              ...prev,
              selectedCoin: null,
              isLoading: false,
            }));
          },
        });
      }
    } catch (error) {
      console.error("Error tapping coin:", error);
      showAlert({
        title: "Network Error",
        message:
          "Failed to process your tap. Please check your internet connection and try again.",
        type: "error",
        onConfirm: () => {
          setState((prev) => ({
            ...prev,
            selectedCoin: null,
            isLoading: false,
          }));
        },
      });
    }
  };

  // ✅ LOADING SCREEN
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={Theme.colors.accent_terracotta}
            style={styles.loadingSpinner}
          />
          <Text style={styles.loadingText}>Loading Game...</Text>
          <Text style={styles.loadingSubtext}>
            Preparing your coins and points
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        extraScrollHeight={100}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.mainContainer}>
          {/* User Welcome Section */}
          {state.userProfile && (
            <View style={styles.userWelcomeContainer}>
              <Text style={styles.welcomeText}>
                Welcome back,{" "}
                <Text style={styles.userName}>
                  {state.userProfile.fullName}
                </Text>
              </Text>
            </View>
          )}

          {/* Points Display */}
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsLabel}>Your Points</Text>
            <Text style={styles.pointsValue}>{state.userPoints}</Text>
            <Text style={styles.pointsTarget}>/ 1000</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min((state.userPoints / 1000) * 100, 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {state.userPoints} / 1000 points
            </Text>
          </View>

          {/* Cooldown Display */}
          {!state.canTap && state.nextAvailableTime && (
            <View style={styles.cooldownContainer}>
              <View style={styles.cooldownHeader}>
                <Text style={styles.cooldownTitle}>
                  Next Tap Available In
                </Text>
                <Text style={styles.countdownText}>{state.countdown}</Text>
              </View>
              <Text style={styles.cooldownSubtext}>
                Come back on: {formatNextAvailableTime(state.nextAvailableTime)}
              </Text>
            </View>
          )}

          {/* Top Text */}
          <View style={styles.topTextContainer}>
            <Text style={styles.topText}>
              {state.canTap
                ? GAME_TEXTS.TOP_TEXT
                : "Come back tomorrow for another chance to earn points!"}
            </Text>
          </View>

          {/* Coin Row */}
          <View style={styles.coinRow}>
            {state.coins.map((coin, index) => (
              <TouchableOpacity
                key={coin.id}
                onPress={() => handleCoinPress(index)}
                activeOpacity={0.7}
                disabled={state.isLoading || !state.canTap}
                style={[
                  styles.coinTouchable,
                  {
                    opacity: !state.canTap || state.isLoading ? 0.6 : 1,
                    transform: [
                      { scale: state.selectedCoin === index ? 0.95 : 1 },
                    ],
                  },
                ]}
              >
                <View
                  style={[
                    styles.coinContainer,
                    {
                      width: coinSize,
                      height: coinSize,
                      marginRight:
                        index < GAME_CONSTANTS.NUM_COINS - 1
                          ? GAME_CONSTANTS.COIN_SPACING
                          : 0,
                    },
                  ]}
                >
                  <Image
                    source={Images.logo}
                    style={styles.coinImage}
                    resizeMode="contain"
                  />
                  {state.selectedCoin === index && state.isLoading && (
                    <View style={styles.coinOverlay}>
                      <ActivityIndicator
                        color={Theme.colors.background_cream}
                        size="small"
                      />
                    </View>
                  )}
                  {!state.canTap && (
                    <View style={styles.coinOverlay}>
                      <Text style={styles.cooldownText}>24h</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bottom Text */}
          <View style={styles.topTextContainer}>
            <Text style={styles.topText}>
              {state.canTap
                ? "Tap a coin to earn points! One tap per 24 hours."
                : `You've already tapped today. ${state.countdown ? `Next tap in: ${state.countdown}` : "Come back tomorrow!"}`}
            </Text>
          </View>

          {/* Game Rules */}
          <View style={styles.rulesContainer}>
            <Text style={styles.rulesTitle}>Game Rules</Text>
            <Text style={styles.ruleItem}>• One tap per 24 hours</Text>
            <Text style={styles.ruleItem}>
              • Earn 1-1000 random points per tap
            </Text>
            <Text style={styles.ruleItem}>
              • Prizes are automatically awarded
            </Text>
            <Text style={styles.ruleItem}>
              • Must be logged in to moonshoot account to play
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default GameHome;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background_cream,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContainer: {
    backgroundColor: Theme.colors.background_cream,
    width: "100%",
    paddingHorizontal: 16,
    paddingBottom: 32,
    flex: 1,
  },

  // ✅ ADD LOADING STYLES
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Theme.colors.background_cream,
    paddingHorizontal: 40,
  },
  loadingSpinner: {
    marginBottom: 20,
    transform: [{ scale: 1.5 }],
  },
  loadingText: {
    color: Theme.colors.accent_terracotta,
    fontFamily: Theme.fonts.bold,
    fontSize: Theme.fontSizes.xl,
    textAlign: "center",
    marginBottom: 8,
  },
  loadingSubtext: {
    color: Theme.colors.text_brown_gray,
    fontFamily: Theme.fonts.regular,
    fontSize: Theme.fontSizes.md,
    textAlign: "center",
  },

  /* User Welcome */
  userWelcomeContainer: {
    backgroundColor: Theme.colors.background_beige,
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  welcomeText: {
    color: Theme.colors.text_brown_gray,
    fontFamily: Theme.fonts.regular,
    fontSize: Theme.fontSizes.md,
    textAlign: "center",
  },
  userName: {
    color: Theme.colors.accent_terracotta,
    fontFamily: Theme.fonts.bold,
    fontSize: Theme.fontSizes.lg,
  },

  /* Points Display */
  pointsContainer: {
    alignItems: "center",
    marginVertical: 10,
    padding: 16,
    backgroundColor: Theme.colors.background_beige,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  pointsLabel: {
    color: Theme.colors.text_brown_gray,
    fontFamily: Theme.fonts.regular,
    fontSize: Theme.fontSizes.md,
    marginBottom: 4,
  },
  pointsValue: {
    color: Theme.colors.accent_terracotta,
    fontFamily: Theme.fonts.bold,
    fontSize: 36,
  },
  pointsTarget: {
    color: Theme.colors.text_brown_gray,
    fontFamily: Theme.fonts.regular,
    fontSize: Theme.fontSizes.sm,
  },

  /* Progress Bar */
  progressContainer: {
    marginBottom: 16,
  },
  progressBackground: {
    height: 8,
    backgroundColor: Theme.colors.background_sand,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Theme.colors.accent_terracotta,
    borderRadius: 4,
  },
  progressText: {
    color: Theme.colors.text_brown_gray,
    fontFamily: Theme.fonts.regular,
    fontSize: Theme.fontSizes.sm,
    textAlign: "center",
  },

  /* Cooldown Display */
  cooldownContainer: {
    backgroundColor: "rgba(184, 92, 56, 0.12)",
    borderColor: Theme.colors.accent_terracotta,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  cooldownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  cooldownTitle: {
    color: Theme.colors.accent_terracotta,
    fontFamily: Theme.fonts.bold,
    fontSize: Theme.fontSizes.md,
  },
  countdownText: {
    color: Theme.colors.accent_terracotta,
    fontFamily: Theme.fonts.bold,
    fontSize: Theme.fontSizes.lg,
    fontVariant: ["tabular-nums"],
  },
  cooldownSubtext: {
    color: Theme.colors.text_brown_gray,
    fontFamily: Theme.fonts.regular,
    fontSize: Theme.fontSizes.sm,
    textAlign: "center",
  },

  /* Top text */
  topTextContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
    width: "100%",
    paddingVertical: 6,
  },
  topText: {
    color: Theme.colors.text_charcoal,
    fontFamily: Theme.fonts.regular,
    fontSize: 14,
    textAlign: "left",
    lineHeight: 20,
  },

  /* Coins */
  coinRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    width: "100%",
    justifyContent: "flex-start",
  },
  coinTouchable: {
    // Enhanced touch area
  },
  coinContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 1000,
    overflow: "hidden",
    backgroundColor: Theme.colors.background_beige,
  },
  coinImage: {
    width: "100%",
    height: "100%",
  },
  coinOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(44, 42, 40, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  cooldownText: {
    color: Theme.colors.background_cream,
    fontFamily: Theme.fonts.bold,
    fontSize: 12,
  },

  /* Rules Container */
  rulesContainer: {
    backgroundColor: Theme.colors.background_beige,
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
  },
  rulesTitle: {
    color: Theme.colors.text_charcoal,
    fontFamily: Theme.fonts.bold,
    fontSize: Theme.fontSizes.lg,
    marginBottom: 12,
  },
  ruleItem: {
    color: Theme.colors.text_brown_gray,
    fontFamily: Theme.fonts.regular,
    fontSize: Theme.fontSizes.md,
    marginBottom: 6,
  },
});
