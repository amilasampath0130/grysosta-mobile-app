import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Images } from '@/assets/images/images';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface GameCardProps {
  onPress?: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push('/(Game)/gameHome');
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
            <Ionicons name="diamond" size={16} color="#FFD700" />
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
                Uncover hidden tiles for instant rewards. Quick, engaging, and rewarding gameplay experience.
              </Text>
            </View>
          </View>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Ionicons name="flash" size={16} color="#4CAF50" />
              <Text style={styles.featureText}>Fast</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="trophy" size={16} color="#FFD700" />
              <Text style={styles.featureText}>Rewards</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="infinite" size={16} color="#4a90e2" />
              <Text style={styles.featureText}>Unlimited</Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionSection}>
          <View style={styles.playButton}>
            <Text style={styles.playButtonText}>Play Now</Text>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  card: {
    backgroundColor: '#1a2530',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a3a4a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  pointsText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  content: {
    marginBottom: 20,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(74, 144, 226, 0.2)',
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
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  featureItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featureText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  actionSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a90e2',
    paddingVertical: 14,
    borderRadius: 12,
  },
  playButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
});

export default GameCard;