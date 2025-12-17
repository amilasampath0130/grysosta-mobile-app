import React, { useRef, useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, Dimensions, ScrollView, TouchableOpacity } from "react-native";

const { width: screenWidth } = Dimensions.get('window');

const NewsCarousel = () => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const newsData = [
    {
      id: 1,
      title: "Breaking News",
      description: "Latest updates from around the world",
      image: "https://via.placeholder.com/300x150/4A90E2/ffffff?text=News+1"
    },
    {
      id: 2,
      title: "Tech Update",
      description: "New technology trends for 2024",
      image: "https://via.placeholder.com/300x150/50E3C2/ffffff?text=News+2"
    },
    {
      id: 3,
      title: "Business News",
      description: "Market insights and analysis",
      image: "https://via.placeholder.com/300x150/9013FE/ffffff?text=News+3"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= newsData.length) {
        nextIndex = 0;
      }
      
      scrollViewRef.current?.scrollTo({
        x: nextIndex * (screenWidth * 0.8 + 15), // card width + margin
        animated: true
      });
      
      setCurrentIndex(nextIndex);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Latest News</Text>
      
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.newsSlider}
        snapToInterval={screenWidth * 0.8 + 15}
        decelerationRate="fast"
      >
        {newsData.map((item, index) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.newsCard}
          >
            <Image 
              source={{ uri: item.image }} 
              style={styles.newsImage}
              resizeMode="cover"
            />
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsDescription}>{item.description}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Dots indicator */}
      <View style={styles.dotsContainer}>
        {newsData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default NewsCarousel;

const styles = StyleSheet.create({
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#2a3a4a",
  },
  sectionTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },
  newsSlider: {
    marginHorizontal: -20,
  },
  newsCard: {
    width: screenWidth * 0.8,
    backgroundColor: "#1a2530",
    borderRadius: 12,
    marginRight: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newsImage: {
    width: "100%",
    height: 120,
  },
  newsContent: {
    padding: 15,
  },
  newsTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    backgroundColor:"blue",
    padding:5
  },
  newsDescription: {
    color: "#cccccc",
    fontSize: 14,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2a3a4a',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#4A90E2',
  },
});