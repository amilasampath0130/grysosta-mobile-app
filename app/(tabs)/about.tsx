import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Theme } from "@/theme";
import { Images } from "@/assets/images/images";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

// Import constants and types
import { ABOUT_FEATURES, TEAM_MEMBERS, SOCIAL_LINKS } from "@/constants/about";
import { Feature, TeamMember, SocialLink } from "@/types/about";

const About = () => {
  // Social links data using constants
  const socialLinks: SocialLink[] = [
    { platform: "twitter", url: SOCIAL_LINKS.twitter, icon: "twitter" },
    { platform: "discord", url: SOCIAL_LINKS.discord, icon: "discord" },
    { platform: "telegram", url: SOCIAL_LINKS.telegram, icon: "telegram" },
    { platform: "github", url: SOCIAL_LINKS.github, icon: "github" },
  ];

  // Stats data using constants pattern
  const STATS_DATA = {
    users: "1k+",
    rewards: "$100+",
    games: "2+",
  } as const;

  // Handler functions
  const handleSocialPress = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  const handleContactPress = () => {
    Linking.openURL("mailto:grysosta@gmail.com");
  };

  // Render feature card using Feature type
  const renderFeatureCard = (feature: Feature) => (
    <View key={feature.id} style={styles.featureCard}>
      <View style={styles.featureIconContainer}>
        <Ionicons
          name={feature.icon as any}
          size={24}
          color={Theme.colors.gold}
        />
      </View>
      <Text style={styles.featureTitle}>{feature.title}</Text>
      <Text style={styles.featureDescription}>{feature.description}</Text>
    </View>
  );

  // Render team member using TeamMember type
  const renderTeamMember = (member: TeamMember) => (
    <View key={member.id} style={styles.teamCard}>
      <Image
        source={member.image}
        style={styles.teamImage}
        resizeMode="cover"
      />
      <Text style={styles.teamName}>{member.name}</Text>
      <Text style={styles.teamRole}>{member.role}</Text>
    </View>
  );

  // Render social button using SocialLink type
  const renderSocialButton = (social: SocialLink) => (
    <TouchableOpacity
      key={social.platform}
      style={styles.socialButton}
      onPress={() => handleSocialPress(social.url)}
      activeOpacity={0.7}
    >
      <FontAwesome5
        name={social.icon as any}
        size={18}
        color={Theme.colors.gold}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>ABOUT GRYSOSTA</Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <Image
              source={Images.logo}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.heroTitle}>Welcome to Grysosta</Text>
            <Text style={styles.heroSubtitle}>
              Your gateway to crypto gaming and digital asset management
            </Text>
          </View>

          {/* Features Grid - USING CONSTANTS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What We Offer</Text>
            <View style={styles.featuresGrid}>
              {ABOUT_FEATURES.map(renderFeatureCard)}
            </View>
          </View>

          {/* Mission Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Mission</Text>
            <View style={styles.missionCard}>
              <MaterialCommunityIcons
                name="target"
                size={32}
                color={Theme.colors.gold}
                style={styles.missionIcon}
              />
              <Text style={styles.missionText}>
                To democratize access to cryptocurrency through engaging gaming
                experiences and educational content. We believe everyone should
                have the opportunity to participate in the digital economy.
              </Text>
            </View>
          </View>

          {/* Team Section - USING CONSTANTS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Meet Our Team</Text>
            <View style={styles.teamContainer}>
              {TEAM_MEMBERS.map(renderTeamMember)}
            </View>
          </View>

          {/* Stats Section - USING CONSTANTS
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Our Impact</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{STATS_DATA.users}</Text>
                <Text style={styles.statLabel}>Active Users</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{STATS_DATA.rewards}</Text>
                <Text style={styles.statLabel}>Rewards Distributed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{STATS_DATA.games}</Text>
                <Text style={styles.statLabel}>Games Available</Text>
              </View>
            </View>
          </View> */}

          {/* Contact Section - USING CONSTANTS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Get In Touch</Text>
            <View style={styles.contactCard}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleContactPress}
                activeOpacity={0.8}
              >
                <Ionicons name="mail" size={20} color="white" />
                <Text style={styles.contactButtonText}>Contact Support</Text>
              </TouchableOpacity>

              <View style={styles.socialLinks}>
                {socialLinks.map(renderSocialButton)}
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2024 Grysosta. All rights reserved.
            </Text>
            <Text style={styles.footerVersion}>Version 1.0.0</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default About;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background_deep,
  },
  mainContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 70,
    backgroundColor: Theme.colors.background_alien,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  headerText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: Theme.fonts.bold,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  heroTitle: {
    color: Theme.colors.gold,
    fontSize: 28,
    fontFamily: Theme.fonts.bold,
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    color: "white",
    fontSize: 16,
    fontFamily: Theme.fonts.regular,
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.8,
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: Theme.colors.gold,
    fontSize: 22,
    fontFamily: Theme.fonts.bold,
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: "48%",
    backgroundColor: Theme.colors.background_alien,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
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
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,215,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  featureTitle: {
    color: "white",
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    textAlign: "center",
    marginBottom: 4,
  },
  featureDescription: {
    color: "white",
    fontSize: 12,
    fontFamily: Theme.fonts.regular,
    textAlign: "center",
    opacity: 0.8,
    lineHeight: 16,
  },
  missionCard: {
    backgroundColor: Theme.colors.background_alien,
    padding: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "flex-start",
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
  missionIcon: {
    marginRight: 16,
    marginTop: 4,
  },
  missionText: {
    color: "white",
    fontSize: 14,
    fontFamily: Theme.fonts.regular,
    lineHeight: 20,
    flex: 1,
    opacity: 0.9,
  },
  teamContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  teamCard: {
    alignItems: "center",
    width: "30%",
  },
  teamImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
  },
  teamName: {
    color: "white",
    fontSize: 14,
    fontFamily: Theme.fonts.bold,
    textAlign: "center",
    marginBottom: 2,
  },
  teamRole: {
    color: Theme.colors.gold,
    fontSize: 12,
    fontFamily: Theme.fonts.regular,
    textAlign: "center",
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Theme.colors.background_alien,
    padding: 20,
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
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    color: Theme.colors.gold,
    fontSize: 24,
    fontFamily: Theme.fonts.bold,
    marginBottom: 4,
  },
  statLabel: {
    color: "white",
    fontSize: 12,
    fontFamily: Theme.fonts.regular,
    textAlign: "center",
    opacity: 0.8,
  },
  contactCard: {
    backgroundColor: Theme.colors.background_alien,
    padding: 20,
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
  contactButton: {
    flexDirection: "row",
    backgroundColor: Theme.colors.gold,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  contactButtonText: {
    color: Theme.colors.background_deep,
    fontSize: 16,
    fontFamily: Theme.fonts.bold,
    marginLeft: 8,
  },
  socialLinks: {
    flexDirection: "row",
    justifyContent: "center",
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    marginTop: 10,
  },
  footerText: {
    color: "white",
    fontSize: 12,
    fontFamily: Theme.fonts.regular,
    opacity: 0.6,
    marginBottom: 4,
  },
  footerVersion: {
    color: "white",
    fontSize: 11,
    fontFamily: Theme.fonts.regular,
    opacity: 0.5,
  },
});
