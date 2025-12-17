import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Theme } from '@/theme';
import { HomeSectionProps } from '@/types/home';

const SectionHeader: React.FC<HomeSectionProps> = ({
  title,
  showSeeMore = true,
  onSeeMorePress
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {showSeeMore && (
        <TouchableOpacity onPress={onSeeMorePress}>
          <Text style={styles.seeMore}>See more</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    color: Theme.colors.gold,
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: Theme.fonts.bold,
  },
  seeMore: {
    color: "white",
    fontFamily: Theme.fonts.medium,
    fontSize: 15,
  },
});

export default SectionHeader;