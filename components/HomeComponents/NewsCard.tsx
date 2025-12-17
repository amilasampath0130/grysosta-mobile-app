import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Theme } from '@/theme'
import { Images } from '@/assets/images/images' // Use centralized imports
import SectionHeader from './SectionHeader'
import { NEWS_DATA } from '@/constants/home'

const NewsCard = () => {
  const handleSeeMore = () => {
    // Navigate to news list screen
    console.log('Navigate to news list')
  }

  const handleNewsPress = (newsId: string) => {
    // Navigate to news detail
    console.log('Open news:', newsId)
  }

  return (
    <View>
      <SectionHeader 
        title="News" 
        onSeeMorePress={handleSeeMore}
      />
      
      <View style={styles.newsContainer}>
        {NEWS_DATA.map((news) => (
          <TouchableOpacity 
            key={news.id}
            style={styles.newsItem}
            onPress={() => handleNewsPress(news.id)}
            activeOpacity={0.7}
          >
            <View style={styles.newsCard}>
              <Text style={styles.newsTitle}>{news.title}</Text>
              <View style={styles.imageContainer}>
                <Image 
                  source={news.image} 
                  style={styles.newsImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

export default NewsCard

const styles = StyleSheet.create({
  newsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  newsItem: {
    width: "48%",
  },
  newsCard: {
    height: 150,
    backgroundColor: Theme.colors.background_alien,
    width: "100%",
    padding: 16,
    alignItems: "center",
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
  newsTitle: {
    color: "white",
    fontFamily: Theme.fonts.medium,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  imageContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: 'center',
  },
  newsImage: {
    width: "100%",
    height: "100%",
  },
})