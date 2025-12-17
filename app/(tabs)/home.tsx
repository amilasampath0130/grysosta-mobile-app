import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import GameCard from "../../components/HomeComponents/GameCard";
import { Images } from '@/assets/images/images';

interface NewsItemProps {
  title: string;
  time: string;
  trend: "up" | "down";
}

const HomeScreen: React.FC = () => {
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(20)).current;
  
  // Typing state
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullText = 'Where every tap builds your legacy';

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Typing effect
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText(fullText.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typingInterval);
        // Blinking cursor after typing completes
        setTimeout(() => {
          setInterval(() => {
            setShowCursor(prev => !prev);
          }, 500);
        }, 1000);
      }
    }, 40);

    return () => clearInterval(typingInterval);
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const NewsItem: React.FC<NewsItemProps> = ({ title, time, trend }) => (
    <View style={styles.newsItem}>
      <View style={styles.newsIcon}>
        <Ionicons name="flash" size={16} color="#FFD700" />
      </View>
      <View style={styles.newsContent}>
        <Text style={styles.newsTitle}>{title}</Text>
        <View style={styles.newsFooter}>
          <Text style={styles.newsTime}>{time}</Text>
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor:
                  trend === "up"
                    ? "rgba(76, 175, 80, 0.15)"
                    : "rgba(255, 82, 82, 0.15)",
              },
            ]}
          >
            <Ionicons
              name={trend === "up" ? "caret-up" : "caret-down"}
              size={12}
              color={trend === "up" ? "#4CAF50" : "#FF5252"}
            />
            <Text
              style={[
                styles.trendText,
                { color: trend === "up" ? "#4CAF50" : "#FF5252" },
              ]}
            >
              {trend === "up" ? "Bullish" : "Bearish"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="light" />

      {/* Animated Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            }}
          >
            <View style={styles.logoContainer}>
              {/* Pulsing and Rotating Logo */}
              <Animated.View
                style={[
                  styles.logo,
                  {
                    transform: [
                      { rotate: rotateInterpolate },
                      { scale: pulseAnim }
                    ],
                  },
                ]}
              >
                <Image style={styles.LogoImage}source={Images.logo} />
              </Animated.View>
              
              <View style={styles.textContainer}>
                <Text style={styles.headerTitle}>GRYSOSTA</Text>
                
                {/* Typing Animation Subtitle */}
                <View style={styles.subtitleContainer}>
                  <Text style={styles.headerSubtitle}>
                    {displayedText}
                    {showCursor && (
                      <Text style={styles.cursor}>|</Text>
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome Back! 👋</Text>
          <Text style={styles.welcomeSubtitle}>
            Your financial journey continues
          </Text>
        </View>

        {/* Featured Game Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Featured Game</Text>
              <Text style={styles.sectionSubtitle}>
                Earn rewards while having fun
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>View All</Text>
            </TouchableOpacity>
          </View>
          <GameCard />
        </View>

        {/* Market News Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Market Insights</Text>
              <Text style={styles.sectionSubtitle}>
                Latest financial updates
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.newsCard}>
            <NewsItem
              title="Global markets show positive trend as inflation concerns ease"
              time="2 min ago"
              trend="up"
            />
            <NewsItem
              title="Tech stocks face volatility amid new regulations"
              time="15 min ago"
              trend="down"
            />
            <NewsItem
              title="New investment opportunities emerging in sustainable energy"
              time="1 hour ago"
              trend="up"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#101923",
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#1a2530",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#2a3a4a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffd700",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#ffd700",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  logoText: {
    color: "#1a2530",
    fontSize: 20,
    fontWeight: "900",
    fontStyle: "italic",
  },
  textContainer: {
    flexDirection: "column",
  },
  headerTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 1,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitleContainer: {
    minHeight: 20, // Prevent layout shift during typing
    justifyContent: 'center',
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  cursor: {
    color: '#ffd700',
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 30,
  },
  welcomeTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    fontWeight: "400",
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "500",
  },
  sectionAction: {
    color: "#4a90e2",
    fontSize: 14,
    fontWeight: "600",
  },
  newsCard: {
    backgroundColor: "#1a2530",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#2a3a4a",
  },
  newsItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  newsIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,215,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 8,
  },
  newsFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  newsTime: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "500",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  trendText: {
    fontSize: 10,
    fontWeight: "700",
    marginLeft: 4,
  },
  toolsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toolCard: {
    width: "48%",
    backgroundColor: "#1a2530",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a3a4a",
  },
  toolIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(74, 144, 226, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  toolTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  toolSubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  LogoImage:{
    width:'100%',
    height:'100%'
  }
});

export default HomeScreen;