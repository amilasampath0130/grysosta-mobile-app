import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Images } from "@/assets/images/images";
import { router } from "expo-router";
import { Theme } from "@/theme";

const { width } = Dimensions.get("window");

interface GameCardProps {
  onPress?: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push("/(Game)/gameHome");
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.card}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Touch & Win</Text>
            <Text style={styles.subtitle}>Tap to reveal instant rewards</Text>
          </View>
          <View style={styles.pointsBadge}>
            <Ionicons
              name="diamond"
              size={16}
              color={Theme.colors.accent_clay}
            />
            <Text style={styles.pointsText}>
              {/* please add the rewards coin */}
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image
                source={Images.logo}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>
                Uncover hidden tiles for instant rewards. Quick, engaging, and
                rewarding gameplay experience.
              </Text>
            </View>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Ionicons
                name="flash"
                size={16}
                color={Theme.colors.accent_olive}
              />
              <Text style={styles.featureText}>Fast</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="trophy"
                size={16}
                color={Theme.colors.accent_clay}
              />
              <Text style={styles.featureText}>Rewards</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="infinite"
                size={16}
                color={Theme.colors.accent_olive}
              />
              <Text style={styles.featureText}>Unlimited</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionSection}>
          <View style={styles.playButton}>
            <Text style={styles.playButtonText}>Play Now</Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={Theme.colors.background_cream}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginVertical: 8,
  },
  card: {
    backgroundColor: Theme.colors.background_beige,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Theme.colors.background_sand,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: Theme.colors.text_charcoal,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: Theme.colors.text_earth,
    fontSize: 14,
    fontWeight: "500",
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(184, 92, 56, 0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(184, 92, 56, 0.3)",
  },
  pointsText: {
    color: Theme.colors.accent_terracotta,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 4,
  },
  content: {
    marginBottom: 20,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: "rgba(163, 111, 78, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "rgba(163, 111, 78, 0.25)",
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  descriptionContainer: {
    flex: 1,
  },
  description: {
    color: Theme.colors.text_brown_gray,
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },
  featuresGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  featureItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(244, 230, 212, 0.6)",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "rgba(163, 111, 78, 0.2)",
  },
  featureText: {
    color: Theme.colors.text_charcoal,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  actionSection: {
    borderTopWidth: 1,
    borderTopColor: Theme.colors.background_sand,
    paddingTop: 16,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Theme.colors.accent_terracotta,
    paddingVertical: 14,
    borderRadius: 12,
  },
  playButtonText: {
    color: Theme.colors.background_cream,
    fontSize: 16,
    fontWeight: "700",
    marginRight: 8,
  },
});

export default GameCard;
